import express from "express";
import moment from 'moment';
import { validationResult, param } from 'express-validator';
import Reservation from '../models/reservation-model';
import { withAsyncRequestHandler } from '../common';
import FindReservationQueryBuilder from '../queries/FindReservationQueryBuilder';
import { parseObjectId } from '../common';
import { userValidatorMW, adminValidatorMW, tokenValidatorMW } from '../auth/auth-validators';
import * as dbQueries from '../DbQueries2';

const router = express.Router({ mergeParams: true });

// ADMIN
router.put('/accept', accceptReservationValidationMWs(), async (req, res) => {
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
router.put('/reject', [tokenValidatorMW, adminValidatorMW,
    param('id').customSanitizer(roomId => parseObjectId(roomId))
        .notEmpty().withMessage('invalid mongo ObjectId'),
], async (req, res) => {
    if (validationResult(req).errors.length > 0)
        return res.status(400).json(validationResult(req));

    withAsyncRequestHandler(res, async () => {
        const result = await dbQueries.changeReservationStatus(req.params.id, "REJECTED")
        if (!result) return res.status(400).json({
            errors: [`there is no reservation with id ${req.body.reservationId}`]
        })
        res.status(200).json({ _id: result._id });
    });
});

// USER
router.put('/cancel', [tokenValidatorMW, userValidatorMW,
    param('id').customSanitizer(roomId => parseObjectId(roomId))
        .notEmpty().withMessage('invalid mongo ObjectId'),
], async (req, res) => {
    if (validationResult(req).errors.length > 0)
        return res.status(400).json(validationResult(req));

    withAsyncRequestHandler(res, async () => {
        const result = await dbQueries.changeReservationStatus(req.params.id, "CANCELLED")
        if (!result) return res.status(400).json({
            errors: [`there is no reservation with id ${req.body.reservationId}`]
        })
        res.status(200).json({ _id: result._id });
    });
});

function accceptReservationValidationMWs() {
    return [
        tokenValidatorMW,
        adminValidatorMW,
        param('id').customSanitizer(id => parseObjectId(id))
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

export default router;