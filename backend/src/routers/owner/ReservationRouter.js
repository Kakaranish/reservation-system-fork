import express from 'express';
import moment from 'moment';
import { tokenValidatorMW, ownerValidatorMW } from '../../auth/auth-validators';
import { param } from 'express-validator';
import { validationExaminator } from '../../common-middlewares';
import { withAsyncRequestHandler, parseObjectId } from '../../common';
import Reservation from '../../models/reservation-model';
import FindReservationQueryBuilder from '../../queries/FindReservationQueryBuilder';
import * as dbQueries from '../../queries/db-queries';

const router = express.Router();

router.get('/status/:status', getReservationsWithStatusValidationMWs(),
    async (req, res) => {
        withAsyncRequestHandler(res, async () => {
            const reservations = await Reservation.find({ status: req.params.status })
                .populate('user', '-_id email firstName lastName',)
                .populate({
                    path: 'room',
                    select: 'name location image',
                    match: { ownerId: req.user._id }
                })
                .select('id fromDate toDate pricePerDay totalPrice userId roomId');
            res.status(200).json(reservations);
        });
    }
);

router.put('/:id/accept', accceptReservationValidationMWs(), async (req, res) => {
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
            await dbQueries.setReservationStatus(reservation._id, "REJECTED");
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

        return res.sendStatus(200);
    });
});

router.put('/:id/reject', rejectValidationMWs(), async (req, res) => {
    withAsyncRequestHandler(res, async () => {
        await dbQueries.setReservationStatus(req.params.id, "REJECTED")
        res.sendStatus(200);
    });
});

function getReservationsWithStatusValidationMWs() {
    const legalStatuses = ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'];
    return [
        tokenValidatorMW,
        ownerValidatorMW,
        param('status').isIn(legalStatuses).withMessage('illegal status'),
        validationExaminator
    ];
}

function accceptReservationValidationMWs() {
    return [
        tokenValidatorMW,
        ownerValidatorMW,
        param('id').customSanitizer(id => parseObjectId(id))
            .notEmpty().withMessage('invalid mongo ObjectId').bail()
            .custom(async (id, { req }) => {
                const reservation = await Reservation.findById(id)
                    .populate({
                        path: 'room',
                        match: { ownerId: req.user._id },
                        select: '_id'
                    });

                if (!reservation)
                    return Promise.reject('reservation with given id does not exist')
                if (reservation.status === 'ACCEPTED')
                    return Promise.reject('reservation is already accepted')
                req.body.reservation = reservation;
            }),
        validationExaminator
    ];
}

function rejectValidationMWs() {
    return [
        tokenValidatorMW,
        ownerValidatorMW,
        param('id').customSanitizer(id => parseObjectId(id))
            .notEmpty().withMessage('invalid mongo ObjectId').bail()
            .custom(async (id, { req }) => {
                const reservation = await Reservation.findById(id)
                    .populate({
                        path: 'room',
                        match: { ownerId: req.user._id },
                        select: '_id'
                    });
                if (!reservation)
                    return Promise.reject('reservation with given id does not exist')
            }),
        validationExaminator
    ];
}

export default router;