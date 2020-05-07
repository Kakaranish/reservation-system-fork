import express from "express";
import moment from 'moment';
import { query, validationResult, param, body } from 'express-validator';
import * as dbQueries from '../DbQueries2';
import Room from '../models/room-model';
import User from '../models/user-model';
import Reservation from '../models/reservation-model';
import { withAsyncRequestHandler } from '../common';
import FindReservationQueryBuilder from '../queries/FindReservationQueryBuilder';
import ExistReservationQueryBuilder from '../queries/ExistReservationQueryBuilder';
import { preparePrice, parseIsoDatetime, parseObjectId } from '../common';
import { userValidatorMW, adminValidatorMW, tokenValidatorMW } from '../auth/auth-validators';

const router = express();

router.get('/rooms/:roomId/reservations', reservationsValidationMWs(), async (req, res) => {
    if (validationResult(req).errors.length > 0)
        return res.status(400).json(validationResult(req));

    withAsyncRequestHandler(res, async () => {
        const queryBuilder = new FindReservationQueryBuilder();
        const findReservations = queryBuilder
            .withRoomId(req.params.roomId.toHexString())
            .overlappingDateIterval(req.query.fromDate.toDate(), req.query.toDate.toDate())
            .build();
        const reservations = await findReservations;
        res.status(200).json(reservations);
    });
})

// USER & ADMIN
/*
    {
        fromDate: String | ISO8601 Datetime - e.g. 2020-04-01T20:00:00.000Z
        toDate: String | ISO8601 Datetime - e.g. 2020-04-01T20:00:00.000Z
        userId: String | ObjectId
        roomId: String | ObjectId
        pricePerDay: String | eg. 22.00 ; 22 ; 22.0
        totalPrice: String | eg. 22.00 ; 22 ; 22.0
    }
*/
router.post('/reservation/create', createReservationValidationMiddlewares(),
    async (req, res, next) => {
        if (validationResult(req).errors.length > 0)
            return res.status(400).json(validationResult(req));
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
                userId: req.body.userId,
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
    });

// ADMIN
router.post('/reservation/accept', accceptReservationValidationMWs(), async (req, res) => {
    if (validationResult(req).errors.length > 0)
        return res.status(400).json(validationResult(req));

    withAsyncRequestHandler(res, async () => {
        const reservation = req.body.reservation;
        const queryBuilder = new FindReservationQueryBuilder();
        const allReservations = await queryBuilder.withRoomId(reservation.roomId.toHexString())
            .overlappingDateIterval(reservation.fromDate, reservation.toDate)
            .select('_id status')
            .build();

        const canBeAccepted = !allReservations.some(r => r._id !== reservation._id
            && r.status === "ACCEPTED");
        if (!canBeAccepted) {
            await dbQueries.changeReservationStatus(reservation._id, "REJECTED");
            return res.status(400).json({
                errors: [
                    'Reservation cannot be accepted because other accepted reservation on this date interval exists.',
                    `State of current reservation has been changed to REJECTED`
                ]
            });
        }

        const reservationToRejectIds = allReservations.filter(r =>
            r._id !== reservation._id && r.status === 'PENDING').map(r => r._id);
        await dbQueries.withTransaction(async session => {
            await Reservation.updateMany({
                _id: { $in: reservationToRejectIds }
            }, {
                $set: { status: "REJECTED" }
            }, { session: session });

            reservation.status = "ACCEPTED";
            reservation.updateDate = moment.utc().toDate();
            await reservation.save({ session: session });
        });

        return res.status(200).json({ _id: reservation._id });
    });
});

// ADMIN
router.post('/reservation/reject', [tokenValidatorMW, adminValidatorMW,
    body('reservationId').customSanitizer(roomId => parseObjectId(roomId))
        .notEmpty().withMessage('invalid mongo ObjectId'),
], async (req, res) => {
    if (validationResult(req).errors.length > 0)
        return res.status(400).json(validationResult(req));

    withAsyncRequestHandler(res, async () => {
        const result = await dbQueries.changeReservationStatus(
            req.body.reservationId, "REJECTED")
        if (!result) return res.status(400).json({
            errors: [`there is no reservation with id ${req.body.reservationId}`]
        })
        res.status(200).json({ _id: result._id });
    });
});

// USER
router.post('/reservation/cancel', [tokenValidatorMW, userValidatorMW,
    body('reservationId').customSanitizer(roomId => parseObjectId(roomId))
        .notEmpty().withMessage('invalid mongo ObjectId'),
], async (req, res) => {
    if (validationResult(req).errors.length > 0)
        return res.status(400).json(validationResult(req));

    withAsyncRequestHandler(res, async () => {
        const result = await dbQueries.changeReservationStatus(
            req.body.reservationId, "CANCELLED")
        if (!result) return res.status(400).json({
            errors: [`there is no reservation with id ${req.body.reservationId}`]
        })
        res.status(200).json({ _id: result._id });
    });
});

// ADMIN
router.delete('/reservation', [tokenValidatorMW, adminValidatorMW,
    body('reservationId').customSanitizer(roomId => parseObjectId(roomId))
        .notEmpty().withMessage('invalid mongo ObjectId'),
], async (req, res) => {
    if (validationResult(req).errors.length > 0)
        return res.status(400).json(validationResult(req));

    withAsyncRequestHandler(res, async () => {
        const result = await Reservation.findByIdAndDelete(req.body.reservationId);
        return res.status(200).json({ _id: result?._id ?? null });
    });
});

router.get('/room/:roomId/reservations/accepted', acceptedReservationsValidationMWs(),
    async (req, res) => {
        if (validationResult(req).errors.length > 0)
            return res.status(400).json(validationResult(req));

        withAsyncRequestHandler(res, async () => {
            const queryBuilder = new FindReservationQueryBuilder();
            const reservations = await queryBuilder.withRoomId(req.params.roomId.toHexString())
                .overlappingDateIterval(req.query.fromDate.toDate(), req.query.toDate.toDate())
                .withStatus('ACCEPTED')
                .build();
            return res.status(200).json(reservations);
        });
    }
);

function reservationsValidationMWs() {
    return [
        param('roomId').customSanitizer(roomId => parseObjectId(roomId))
            .notEmpty().withMessage('invalid mongo ObjectId'),
        query('fromDate').customSanitizer(date => parseIsoDatetime(date))
            .notEmpty()
            .withMessage('not in ISO8601 format'),
        query('toDate').customSanitizer(date => parseIsoDatetime(date))
            .notEmpty()
            .withMessage('not in ISO8601 format'),
    ];
}

function accceptReservationValidationMWs() {
    return [
        tokenValidatorMW,
        adminValidatorMW,
        body('reservationId').customSanitizer(id => parseObjectId(id))
            .notEmpty().withMessage('invalid mongo ObjectId').bail()
            .custom(async (id, { req }) => {
                const reservation = await Reservation.findById(id);
                if (!reservation)
                    return Promise.reject('reservation with given id does not exist')
                if (reservation.status === 'ACCEPTED')
                    return Promise.reject('reservation is already accepted')
                req.body.reservation = reservation;
            }),
    ];
}

function createReservationValidationMiddlewares() {
    return [
        tokenValidatorMW,
        body('roomId').customSanitizer(id => parseObjectId(id))
            .notEmpty().withMessage('invalid mongo ObjectId').bail()
            .custom(async id => {
                return await Room.exists({ _id: id }).then(exists => {
                    if (!exists) return Promise.reject('room with given id does not exist')
                });
            }),
        body('userId').customSanitizer(id => parseObjectId(id))
            .notEmpty().withMessage('invalid mongo ObjectId').bail()
            .custom(async id => {
                return await User.exists({ _id: id }).then(exists => {
                    if (!exists) return Promise.reject('user with given id does not exist')
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
            .withMessage('price must match regex: \d+(\.\d{1,2})?'),
    ];
}

function acceptedReservationsValidationMWs() {
    return [
        param('roomId').customSanitizer(id => parseObjectId(id))
            .notEmpty().withMessage('invalid mongo ObjectId').bail()
            .custom(async id => {
                return await Room.exists({ _id: id }).then(exists => {
                    if (!exists) return Promise.reject('room with given id does not exist')
                });
            }),
        query('fromDate').customSanitizer(date => parseIsoDatetime(date))
            .notEmpty()
            .withMessage('not in ISO8601 format'),
        query('toDate').customSanitizer(date => parseIsoDatetime(date))
            .notEmpty().withMessage('not in ISO8601 format'),
    ];
}

export default router;