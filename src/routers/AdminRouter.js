import express from "express";
import FindReservationQueryBuilder from '../queries/FindReservationQueryBuilder';
import { parseIsoDatetime } from '../common'
import { query, validationResult } from 'express-validator';
import { adminValidatorMW, tokenValidatorMW } from '../auth/auth-validators';

const router = express();

router.get('/reservations', reservationsValidatorMW(), async (req, res) => {
    if (validationResult(req).errors.length > 0)
        return res.status(400).json(validationResult(req));

    try {
        const queryBuilder = new FindReservationQueryBuilder();
        let query = queryBuilder
            .withStatus(req.query.status)
            .withPopulatedUserData('-_id email firstName lastName')
            .withPopulatedRoomData('-_id name location photoUrl')
            .select('id fromDate toDate pricePerDay totalPrice userId roomId');
        if (req.query.fromDate && req.query.toDate)
            query = query.overlappingDateIterval(
                req.query.fromDate.toDate(), req.query.toDate.toDate());
        const reservations = await query.build();
        res.status(200).json(reservations);
    } catch (error) {
        console.log(`Error: ${error}`);
        res.status(500).json({ errors: ['Internal error'] });
    }
});

function reservationsValidatorMW() {
    return [
        tokenValidatorMW,
        adminValidatorMW,
        query('status').notEmpty().withMessage('cannot be empty').bail()
            .custom(status => {
                const availableStatuses = ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'];
                if (!availableStatuses.includes(status.toUpperCase()))
                    throw Error('illegal status');
                return true;
            }),
        query('fromDate').customSanitizer(date => parseIsoDatetime(date)),
        query('toDate').customSanitizer(date => parseIsoDatetime(date))
    ];
}

export default router;