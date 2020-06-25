import express from 'express';
import moment from 'moment';
import { param, validationResult, body } from 'express-validator';
import { withAsyncRequestHandler, parseIsoDatetime, preparePrice } from '../../common';
import { parseObjectId } from '../../common';
import { tokenValidatorMW } from '../../auth/auth-validators';
import * as dbQueries from '../../queries/db-queries';
import { validationExaminator, bodyDateIntervalValidatorMW, errorSummarizerMW } from "../../common-middlewares";
import FindReservationQueryBuilder from '../../queries/FindReservationQueryBuilder';
import Room from '../../models/room-model';
import ExistReservationQueryBuilder from '../../queries/ExistReservationQueryBuilder';
import Reservation from '../../models/reservation-model';

const router = express.Router();

router.get('/:id', getReservationValidationMWs(), async (req, res) => {
    withAsyncRequestHandler(res, async () => {
        const reservation = await Reservation.findOne({
            _id: req.params.id,
            userId: req.user._id
        });
        res.status(200).json(reservation);
    });
});

router.get('/status/:status', getReservationsWithStatusValidationMWs(),
    async (req, res) => {
        withAsyncRequestHandler(res, async () => {
            const queryBuilder = new FindReservationQueryBuilder();
            let query = queryBuilder
                .withUserId(req.user._id)
                .withPopulatedUserData('-_id email firstName lastName')
                .withPopulatedRoomData('_id name location image')
                .withStatus(req.params.status)
                .select('id fromDate toDate pricePerDay totalPrice userId roomId');

            const reservations = await query.build();
            res.status(200).json(reservations);
        });
    }
);

router.post('/', createReservationValidationMWs(),
    async (req, res) => {
        if (validationResult(req).errors.length > 0)
            return res.status(400).json(validationResult(req));
        if ((!req.query.fromDate && req.query.toDate) ||
            (req.query.fromDate && !req.query.toDate)) {
            return res.status(400).json({ errors: ['fromDate and toDate must be both provided or neither'] });
        }

        try {
            const queryBuilder = new ExistReservationQueryBuilder();
            const otherReservationExists = await queryBuilder.withRoomId(req.body.roomId.toHexString())
                .overlappingDateIterval(req.body.fromDate.toDate(), req.body.toDate.toDate())
                .withStatus('ACCEPTED')
                .build();
            if (otherReservationExists) return res.status(400).json({
                errors: [`other reservation/reservations on this room and date interval already exist(s)`]
            });

            const reservation = new Reservation({
                roomId: req.body.roomId,
                userId: req.user._id,
                fromDate: req.body.fromDate,
                toDate: req.body.toDate,
                pricePerDay: req.body.pricePerDay,
                totalPrice: req.body.totalPrice,
                status: "PENDING",
                createDate: moment.utc().toDate(),
                updateDate: moment.utc().toDate()
            })
            await reservation.save();
            return res.status(200).json(reservation._id);
        } catch (error) {
            console.log(error)
            const errors = ['Error: Internal server error'];
            if (error.errors) {
                for (let errorField in error.errors) {
                    errors.push(errorField)
                }
            }
            res.status(500).json({ errors: errors });
        }
    }
);

router.put('/:id', updateReservationMWs(), async (req, res) => {
    if (req.body.errors?.length > 0)
        return res.status(400).json({ errors: req.body.errors });

    withAsyncRequestHandler(res, async () => {
        const numDaysBetween = req.body.toDate.diff(req.body.fromDate, 'days') + 1;
        const result = await Reservation.findOneAndUpdate({ _id: req.reservation._id }, {
            $set: {
                fromDate: req.body.fromDate.toDate(),
                toDate: req.body.toDate.toDate(),
                pricePerDay: req.reservation.pricePerDay,
                totalPrice: req.reservation.pricePerDay * numDaysBetween,
                status: 'PENDING'
            }
        });

        return res.status(200).json({ _id: result._id });
    });
});

router.put('/:id/cancel', cancelValidationMWs(), async (req, res) => {
    withAsyncRequestHandler(res, async () => {
        const result = await dbQueries.setReservationStatus(req.params.id, "CANCELLED")
        if (!result) return res.status(400).json({
            errors: [`there is no reservation with id ${req.body.reservationId}`]
        })
        res.status(200).json({ _id: result._id });
    });
});

function getReservationValidationMWs() {
    return [
        tokenValidatorMW,
        param('id').customSanitizer(id => parseObjectId(id))
            .notEmpty().withMessage('invalid mongo ObjectId'),
        validationExaminator
    ];
}

function getReservationsWithStatusValidationMWs() {
    const legalStatuses = ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'];
    return [
        tokenValidatorMW,
        param('status').isIn(legalStatuses).withMessage('illegal status'),
        validationExaminator
    ];
}

function createReservationValidationMWs() {
    return [
        tokenValidatorMW,
        body('roomId').customSanitizer(id => parseObjectId(id))
            .notEmpty().withMessage('invalid mongo ObjectId').bail()
            .custom(async id => {
                return await Room.exists({ _id: id }).then(exists => {
                    if (!exists) return Promise.reject('room with given id does not exist')
                });
            }),
        body('fromDate').customSanitizer(date => parseIsoDatetime(date))
            .notEmpty()
            .withMessage('not in ISO8601 format'),
        body('toDate').customSanitizer(date => parseIsoDatetime(date))
            .notEmpty()
            .withMessage('not in ISO8601 format'),
        body('pricePerDay').customSanitizer(price => preparePrice(price))
            .notEmpty()
            .withMessage('price must match regex: \d+(\.\d{1,2})?'),
        body('totalPrice').customSanitizer(price => preparePrice(price))
            .notEmpty()
            .withMessage('price must match regex: \d+(\.\d{1,2})?')
    ];
}

function updateReservationMWs() {
    return [
        tokenValidatorMW,
        param('id').customSanitizer(id => parseObjectId(id))
            .notEmpty().withMessage('invalid mongo ObjectId').bail()
            .custom(async (id, { req }) => {
                const reservation = await Reservation.findById(id);
                if (!reservation)
                    return Promise.reject('reservation with given id does not exist');
                if (['CANCELLED', 'REJECTED'].includes(reservation.status))
                    return Promise.reject('reservation has illegal status');
                if (reservation.userId != req.user._id)
                    return Promise.reject('reservation does not belong to token bearer');

                req.reservation = reservation;
                return true;
            }),
        bodyDateIntervalValidatorMW,
        errorSummarizerMW
    ];
}

function cancelValidationMWs() {
    return [
        tokenValidatorMW,
        param('id').customSanitizer(roomId => parseObjectId(roomId))
            .notEmpty().withMessage('invalid mongo ObjectId'),
        validationExaminator
    ];
}

export default router;