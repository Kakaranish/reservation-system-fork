import express from "express";
import Room from "../models/room-model";
import '../auth/passport-config';
import * as dbQueries from '../queries/db-queries';
import { withAsyncRequestHandler } from '../common';
import {
    errorSummarizerMW,
    queryDateIntervalValidatorMW,
    validationExaminator
} from '../common-middlewares'
import { preparePrice, parseObjectId } from '../common';
import { query, param } from 'express-validator';
import FindReservationQueryBuilder from "../queries/FindReservationQueryBuilder";

const router = express.Router();

router.get('/', getRoomsValidationMWs(), async (req, res) => {
    if (req.body.errors?.length > 0)
        return res.status(400).json({ errors: req.body.errors });

    const numDaysBetween = req.query.toDate.diff(req.query.fromDate, 'days') + 1;
    withAsyncRequestHandler(res, async () => {
        const roomPreviews = await dbQueries.getAvailableRoomPreviews({
            fromDate: req.query.fromDate.toDate(),
            toDate: req.query.toDate.toDate(),
            fromPrice: req.query.fromPrice / numDaysBetween,
            toPrice: req.query.toPrice / numDaysBetween
        });
        res.status(200).json(roomPreviews);
    });
});

router.get('/search/:phrase', searchPhraseValidationMWs(), async (req, res) => {
    withAsyncRequestHandler(res, async () => {
        const rooms = await Room.find({
            $or: [
                { name: { $regex: `.*${req.params.phrase}.*` } },
                { description: { $regex: `.*${req.params.phrase}.*` } },
                { location: { $regex: `.*${req.params.phrase}.*` } }
            ]
        }).select('_id name location capacity image pricePerDay amenities');

        res.status(200).json(rooms);
    });
});

router.get('/:id', getRoomValidationMWs(), async (req, res) => {
    withAsyncRequestHandler(res, async () => {
        const room = await Room.findById(req.params.id);
        return res.status(200).json(room);
    });
});

router.get('/:id/reservations-preview', getReservationsPreviewsValidationMWs(),
    async (req, res) => {
        withAsyncRequestHandler(res, async () => {
            const queryBuilder = new FindReservationQueryBuilder();
            const query = queryBuilder
                .withRoomId(req.params.id.toHexString())
                .withStatus('ACCEPTED')
                .select('_id fromDate toDate')
                .build();
            const reservations = await query;
            return res.status(200).json(reservations);
        });
    }
);

function getRoomsValidationMWs() {
    return [
        queryDateIntervalValidatorMW,
        query('fromPrice').customSanitizer(price => preparePrice(price))
            .notEmpty()
            .withMessage('price must match regex: \d+(\.\d{1,2})?'),
        query('toPrice').customSanitizer(price => preparePrice(price))
            .notEmpty()
            .withMessage('price must match regex: \d+(\.\d{1,2})?'),
        errorSummarizerMW
    ];
}

function getRoomValidationMWs() {
    return [
        param('id').customSanitizer(id => parseObjectId(id))
            .notEmpty().withMessage('invalid mongo ObjectId'),
        validationExaminator
    ];
}

function searchPhraseValidationMWs() {
    return [
        param('phrase').notEmpty().withMessage('cannot be empty'),
        validationExaminator
    ];
}

function getReservationsPreviewsValidationMWs() {
    return [
        param('id').customSanitizer(id => parseObjectId(id))
            .notEmpty().withMessage('invalid mongo ObjectId'),
        validationExaminator
    ];
}

export default router;