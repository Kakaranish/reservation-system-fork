import express from "express";
import moment from 'moment';
import { query, validationResult, param, body } from 'express-validator';
import Room from '../models/room-model';
import User from '../models/user-model';
import Reservation from '../models/reservation-model';
import { withAsyncRequestHandler } from '../common';
import FindReservationQueryBuilder from '../queries/FindReservationQueryBuilder';
import ExistReservationQueryBuilder from '../queries/ExistReservationQueryBuilder';
import { preparePrice, parseIsoDatetime, parseObjectId } from '../common';
import { adminValidatorMW, tokenValidatorMW } from '../auth/auth-validators';

const router = express();

// Probably admin only
router.get('/reservations', reservationsValidationMWs(), async (req, res) => {
    if (validationResult(req).errors.length > 0)
        return res.status(400).json(validationResult(req));

    withAsyncRequestHandler(res, async () => {
        const queryBuilder = new FindReservationQueryBuilder();
        let query = queryBuilder
            .overlappingDateIterval(req.query.fromDate.toDate(), req.query.toDate.toDate())
            .withPopulatedUserData('-_id email firstName lastName')
            .withPopulatedRoomData('-_id name location photoUrl')
            .select('id fromDate toDate pricePerDay totalPrice userId roomId');
        if (req.query.roomId) query = query.withRoomId(req.query.roomId);
        if (req.query.status) query = query.withStatus(req.query.status);
        const reservations = await query.build();
        res.status(200).json(reservations);
    });
});

router.get('/reservations/user/:id', tokenValidatorMW, reservationsForUserValidationMWs(),
    async (req, res) => {
        const errors = validationResult(req).errors;
        if (errors.length > 0) {
            if (errors.some(e => e.param === 'id' && e.msg.includes('access token')))
                return res.sendStatus(401)
            return res.status(400).json(validationResult(req));
        }
        if ((!req.query.fromDate && req.query.toDate) ||
            (req.query.fromDate && !req.query.toDate)) {
            return res.status(400).json({ errors: ['fromDate and toDate must be both provided or neither'] });
        }

        withAsyncRequestHandler(res, async () => {
            const queryBuilder = new FindReservationQueryBuilder();
            const query = queryBuilder
                .withUserId(req.user._id)
                .withPopulatedUserData('-_id email firstName lastName')
                .withPopulatedRoomData('-_id name location photoUrl')
                .select('id fromDate toDate pricePerDay totalPrice userId roomId');
            if (req.query.fromDate) query = query.overlappingDateIterval(
                req.query.fromDate.toDate(), req.query.toDate.toDate());
            if (req.query.status) query = query.withStatus(req.query.status);

            const reservations = await query.build();
            res.status(200).json(reservations);
        });
    }
);

// USER & ADMIN
router.post('/reservations', createReservationValidationMiddlewares(),
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
    }
);

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

function reservationsValidationMWs() {
    return [
        query('fromDate').customSanitizer(date => parseIsoDatetime(date))
            .notEmpty().withMessage('not in ISO8601 format'),
        query('toDate').customSanitizer(date => parseIsoDatetime(date))
            .notEmpty().withMessage('not in ISO8601 format').bail()
            .custom((toDate, { req }) => {
                if (toDate.toDate() < req.query.fromDate.toDate())
                    throw Error('illegal date interval - fromDate must precede toDate');
                return true
            }),
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
            })
    ];
}

function reservationsForUserValidationMWs() {
    return [
        param('id').customSanitizer(id => parseObjectId(id))
            .notEmpty().withMessage('invalid mongo ObjectId').bail()
            .custom(async (id, { req }) => {
                return await User.exists({ _id: id }).then(exists => {
                    if (!exists) return Promise.reject('user does not exist')
                    if (id.toHexString() !== req.user._id) return Promise.reject('access token');
                });
            }),
        query('fromDate').optional().customSanitizer(date => parseIsoDatetime(date))
            .notEmpty().withMessage('not in ISO8601 format'),
        query('toDate').optional().customSanitizer(date => parseIsoDatetime(date))
            .notEmpty().withMessage('not in ISO8601 format').bail()
            .custom((toDate, { req }) => {
                if (!req.query.fromDate) return true;
                if (toDate.toDate() < req.query.fromDate.toDate())
                    throw Error('illegal date interval - fromDate must precede toDate');
                return true
            }),
        query('status').optional()
            .custom(status => {
                const availableStatuses = ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'];
                if (!availableStatuses.includes(status.toUpperCase()))
                    throw Error('illegal status');
                return true;
            })
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
            .withMessage('price must match regex: \d+(\.\d{1,2})?')
    ];
}

export default router;