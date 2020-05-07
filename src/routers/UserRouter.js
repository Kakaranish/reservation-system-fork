import express from "express";
import { changeReservationStatus } from "../DbQueries2";
import User from '../models/user-model';
import FindReservationQueryBuilder from '../queries/FindReservationQueryBuilder';
import { parseObjectId } from '../common';
import { userValidatorMW, tokenValidatorMW } from '../auth/auth-validators';
import { body, query, validationResult } from 'express-validator';
import { withAsyncRequestHandler } from '../common';

const router = express();

router.get('/reservations', reservationsValidationMWs(), async (req, res) => {
    if (validationResult(req).errors.length > 0)
        return res.status(400).json(validationResult(req));

    withAsyncRequestHandler(res, async () => {
        const queryBuilder = new FindReservationQueryBuilder();
        const reservations = await queryBuilder
            .withUserId(req.user._id)
            .withStatus(req.query.status)
            .withPopulatedUserData('-_id email firstName lastName')
            .withPopulatedRoomData('-_id name location photoUrl')
            .select('id fromDate toDate pricePerDay totalPrice userId roomId')
            .build();
        res.status(200).json(reservations);
    });
});

router.post('/cancel-reservation/:reservationId',
    cancelReservationValidationMWs(), async (req, res) => {
        if (validationResult(req).errors.length > 0)
            return res.status(400).json(validationResult(req));

        withAsyncRequestHandler(res, async () => {
            const result = await changeReservationStatus(req.body.reservationId, 'CANCELLED');
            return res.status(200).json({ _id: result?._id ?? null });
        });
    });


router.post('/check-if-email-available', [
    body('email').isString().withMessage('must be string').bail()
        .notEmpty().withMessage('cannot be empty').bail()
        .isEmail().withMessage('invalid email format')
], async (req, res) => {
    if (validationResult(req).errors.length > 0)
        return res.status(400).json(validationResult(req));

    withAsyncRequestHandler(res, async () => {
        const available = !await User.exists({ email: req.body.email })
        return res.status(200).json(available);
    });
});

function reservationsValidationMWs() {
    return [
        tokenValidatorMW,
        userValidatorMW,
        query('status').notEmpty().withMessage('cannot be empty').bail()
            .custom(status => {
                const availableStatuses = ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'];
                if (!availableStatuses.includes(status.toUpperCase()))
                    throw Error('illegal status');
                return true;
            })
    ];
}

function cancelReservationValidationMWs() {
    return [
        tokenValidatorMW,
        userValidatorMW,
        body('reservationId').customSanitizer(roomId => parseObjectId(roomId))
            .notEmpty().withMessage('invalid mongo ObjectId'),
    ];
}

export default router;