import express from 'express';
import { param } from 'express-validator';
import { withAsyncRequestHandler } from '../../common';
import { parseObjectId } from '../../common';
import { tokenValidatorMW } from '../../auth/auth-validators';
import * as dbQueries from '../../queries/db-queries';
import { validationExaminator } from "../../common-middlewares";
import FindReservationQueryBuilder from '../../queries/FindReservationQueryBuilder';

const router = express.Router();

router.get('/status/:status', getReservationsForUserValidationMWs(), async (req, res) => {
    withAsyncRequestHandler(res, async () => {
        const queryBuilder = new FindReservationQueryBuilder();
        let query = queryBuilder
            .withUserId(req.user._id)
            .withPopulatedUserData('-_id email firstName lastName')
            .withPopulatedRoomData('-_id name location image')
            .withStatus(req.params.status)
            .select('id fromDate toDate pricePerDay totalPrice userId roomId');

        const reservations = await query.build();
        res.status(200).json(reservations);
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

function getReservationsForUserValidationMWs() {
    const legalStatuses = ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'];
    return [
        tokenValidatorMW,
        param('status').isIn(legalStatuses).withMessage('illegal status'),
        validationExaminator
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