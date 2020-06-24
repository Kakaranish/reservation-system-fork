import express from "express";
import moment from 'moment';
import { query, validationResult, param, body } from 'express-validator';
import Room from '../models/room-model';
import Reservation from '../models/reservation-model';
import FindReservationQueryBuilder from '../queries/FindReservationQueryBuilder';
import ExistReservationQueryBuilder from '../queries/ExistReservationQueryBuilder';
import {
    preparePrice,
    parseIsoDatetime,
    parseObjectId,
    withAsyncRequestHandler
} from '../common';
import {
    userExistenceValidatorMW,
    queryOptionalDateIntervalValidatorMW,
    errorSummarizerMW,
    bodyDateIntervalValidatorMW
} from '../common-middlewares';
import { adminValidatorMW, tokenValidatorMW } from '../auth/auth-validators';

const router = express();

// ADMIN
router.get('/reservations', getReservationsValidationMWs(), async (req, res) => {
    if (req.body.errors?.length > 0)
        return res.status(400).json({ errors: req.body.errors });

    withAsyncRequestHandler(res, async () => {
        const queryBuilder = new FindReservationQueryBuilder();
        let query = queryBuilder
            .withPopulatedUserData('-_id email firstName lastName')
            .withPopulatedRoomData('-_id name location image')
            .select('id fromDate toDate pricePerDay totalPrice userId roomId');
        if (req.query.fromDate) query = query.overlappingDateIterval
            (req.query.fromDate.toDate(), req.query.toDate.toDate())
        if (req.query.roomId) query = query.withRoomId(req.query.roomId);
        if (req.query.status) query = query.withStatus(req.query.status);
        const reservations = await query.build();
        res.status(200).json(reservations);
    });
});

// USER & ADMIN
router.get('/reservations/user', getReservationsForUserValidationMWs(), async (req, res) => {
    if (req.body.errors?.length > 0)
        return res.status(400).json({ errors: req.body.errors });

    withAsyncRequestHandler(res, async () => {
        const queryBuilder = new FindReservationQueryBuilder();
        let query = queryBuilder
            .withUserId(req.user._id)
            .withPopulatedUserData('-_id email firstName lastName')
            .withPopulatedRoomData('-_id name location image')
            .select('id fromDate toDate pricePerDay totalPrice userId roomId');
        if (req.query.fromDate) query = query.overlappingDateIterval(
            req.query.fromDate.toDate(), req.query.toDate.toDate());
        if (req.query.status) query = query.withStatus(req.query.status);

        const reservations = await query.build();
        res.status(200).json(reservations);
    });
});

// USER & ADMIN
router.get('/reservations/:id/user', getReservationForUserValidationMWs(), async (req, res) => {
    if (validationResult(req).errors.length > 0)
        return res.status(400).json(validationResult(req));

    withAsyncRequestHandler(res, async () => {
        if (!req.reservation) return res.status(200).json(null);
        const belongsToUser = req.reservation.userId == req.user?._id;
        res.status(200).json(belongsToUser ? req.reservation : null);
    });
});

// USER, ADMIN
router.post('/reservations', createReservationValidationMWs(),
    async (req, res, next) => {
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

// USER & ADMIN
router.put('/reservations/:id/user', updateReservationMWs(), async (req, res) => {
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

// ADMIN
router.delete('/reservations/:id', [tokenValidatorMW, adminValidatorMW,
    param('id').customSanitizer(roomId => parseObjectId(roomId))
        .notEmpty().withMessage('invalid mongo ObjectId'),
], async (req, res) => {
    if (validationResult(req).errors.length > 0)
        return res.status(400).json(validationResult(req));

    withAsyncRequestHandler(res, async () => {
        const result = await Reservation.findByIdAndDelete(req.params.id);
        return res.status(200).json({ _id: result?._id ?? null });
    });
});

function getReservationsValidationMWs() {
    return [
        tokenValidatorMW,
        adminValidatorMW,
        queryOptionalDateIntervalValidatorMW,
        query('status').optional()
            .custom(status => {
                const availableStatuses = ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'];
                if (!availableStatuses.includes(status.toUpperCase()))
                    throw Error('illegal status');
                return true;
            }),
        query('roomId').optional()
            .customSanitizer(id => parseObjectId(id))
            .notEmpty().withMessage('invalid mongo ObjectId').bail()
            .custom(async id => {
                return await Room.exists({ _id: id }).then(exists => {
                    if (!exists) return Promise.reject('room with given id does not exist')
                });
            }),
        errorSummarizerMW
    ];
}

function getReservationsForUserValidationMWs() {
    return [
        tokenValidatorMW,
        userExistenceValidatorMW,
        queryOptionalDateIntervalValidatorMW,
        query('status').optional()
            .custom(status => {
                const availableStatuses = ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'];
                if (!availableStatuses.includes(status.toUpperCase()))
                    throw Error('illegal status');
                return true;
            }),
        errorSummarizerMW
    ];
}

function getReservationForUserValidationMWs() {
    return [
        tokenValidatorMW,
        param('id').customSanitizer(id => parseObjectId(id))
            .notEmpty().withMessage('invalid mongo ObjectId')
            .custom(async (id, {req}) => {
                req.reservation = await Reservation.findById(id);
                return true;
            }),
        errorSummarizerMW
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

export default router;