import express from "express";
import { changeReservationStatus } from "../DbQueries2";
import User from '../models/user-model';
import FindReservationQueryBuilder from '../queries/FindReservationQueryBuilder';
import { parseObjectId } from '../common';
import { userValidator } from '../auth-validators';
import { body, query, validationResult } from 'express-validator';

const router = express();

router.get('/reservations', [
    userValidator,
    query('status').notEmpty().withMessage('cannot be empty').bail()
        .custom(status => {
            const availableStatuses = ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'];
            if (!availableStatuses.includes(status.toUpperCase()))
                throw Error('illegal status');
            return true;
        })
], async (req, res) => {
    if (validationResult(req).errors.length > 0)
        return res.status(400).json(validationResult(req));
    try {
        const queryBuilder = new FindReservationQueryBuilder();
        const reservations = await queryBuilder
            .withUserId(req.user._id)
            .withStatus(req.query.status)
            .withPopulatedUserData('-_id email firstName lastName')
            .withPopulatedRoomData('-_id name location photoUrl')
            .select('id fromDate toDate pricePerDay totalPrice userId roomId')
            .build();
        res.status(200).json(reservations);
    } catch (error) {
        console.log(`Error: ${error}`);
        res.status(500).json({ errors: ['Internal error'] });
    }
});

router.post('/cancel-reservation/:reservationId', [
    userValidator,
    body('reservationId').customSanitizer(roomId => parseObjectId(roomId))
        .notEmpty().withMessage('invalid mongo ObjectId'),
], async (req, res) => {
    if (validationResult(req).errors.length > 0)
        return res.status(400).json(validationResult(req));
    try {
        const result = await changeReservationStatus(req.body.reservationId, 'CANCELLED');
        return res.status(200).json({_id: result?._id ?? null});
    } catch (error) {
        console.log(`Error: ${error}`);
        res.status(500).json({ errors: ['Internal error'] });
    }
});

router.post('/check-if-email-available', [
    body('email').isString().withMessage('must be string').bail()
        .notEmpty().withMessage('cannot be empty').bail()
        .isEmail().withMessage('invalid email format')
], async (req, res) => {
    if (validationResult(req).errors.length > 0)
        return res.status(400).json(validationResult(req));
    try {
        const available = !await User.exists({ email: req.body.email })
        return res.status(200).json(available);
    } catch (error) {
        console.log(`Error: ${error}`);
        res.status(500).json({ errors: ['Internal error'] });
    }
});

export default router;