import express from "express";
import Room from "../models/room-model";
import '../auth/passport-config';
import * as dbQueries from '../queries/db-queries';
import { withAsyncRequestHandler } from '../common';
import {
    errorSummarizerMW,
    queryDateIntervalValidatorMW,
    validationExaminator,
    uploadImageMW
} from '../common-middlewares'
import { preparePrice, parseObjectId } from '../common';
import { query, param, header, body } from 'express-validator';
import { tokenValidatorMW, ownerValidatorMW } from '../auth/auth-validators';
import FindReservationQueryBuilder from "../queries/FindReservationQueryBuilder";

const router = express.Router();

router.get('/', getRoomsValidationMiddlewares(), async (req, res) => {
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

router.get('/with-phrase/:phrase', [
    param('phrase').notEmpty().withMessage('cannot be empty'),
    validationExaminator
], async (req, res) => {
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

router.get('/:id', [
    param('id').customSanitizer(id => parseObjectId(id))
        .notEmpty().withMessage('invalid mongo ObjectId'),
    validationExaminator
], async (req, res) => {
    withAsyncRequestHandler(res, async () => {
        const room = await Room.findById(req.params.id);
        return res.status(200).json(room);
    });
});

router.get('/:id/reservations-preview', [
    param('id').customSanitizer(id => parseObjectId(id))
        .notEmpty().withMessage('invalid mongo ObjectId'),
    validationExaminator
], async (req, res) => {
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
});

// USER & ADMIN
router.post('/', tokenValidatorMW, createRoomValidationMiddlewares(),
    uploadImageMW, async (req, res) => {
        withAsyncRequestHandler(res, async () => {
            const room = new Room({
                name: req.body.name,
                location: req.body.location,
                capacity: req.body.capacity,
                pricePerDay: req.body.pricePerDay,
                description: req.body.description,
                amenities: req.amenities,
                dows: req.dows,
                image: req.image
            });
            await room.save();

            res.status(200).json({ roomId: room._id });
        });
    }
);

function getRoomsValidationMiddlewares() {
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

function createRoomValidationMiddlewares() {
    return [
        tokenValidatorMW,
        ownerValidatorMW,
        body('name').isLength({ min: 3 }).withMessage('must have length 3'),
        body('location').isString().isLength({ min: 3 }),
        body('capacity').isInt({ min: 0 }),
        body('pricePerDay').customSanitizer(price => preparePrice(price))
            .notEmpty().withMessage('price must match regex: \d+(\.\d{1,2})?'),
        body('description').optional().isString(),
        body('amenities').notEmpty().withMessage('cannot be empty').bail()
            .isString().withMessage('must be stringified non-empty array').bail()
            .custom((amenities, { req }) => {
                const parsedAmenities = JSON.parse(amenities);
                if (!Array.isArray(parsedAmenities) || parsedAmenities.length === 0) {
                    throw new Error('must be non-empty array');
                }
                const hasIllegalElements = parsedAmenities.some(
                    amenity => !availableAmenities.includes(amenity));
                if (hasIllegalElements) throw Error('contains at least one illegal amenity');
                req.amenities = parsedAmenities;
                return true;
            }),
        body('dows').notEmpty().withMessage('cannot be empty').bail()
            .isString().withMessage('must be stringified non-empty array').bail()
            .custom((dows, { req }) => {
                const parsedDows = JSON.parse(dows);
                if (!Array.isArray(parsedDows) || parsedDows.length === 0) {
                    throw Error('must be non-empty array');
                }
                const hasIllegalElements = parsedDows.some(dow => !availableDows.includes(dow));
                if (hasIllegalElements) throw Error("contains at least one illegal dow");
                req.dows = parsedDows;
                return true;
            }),
        header('content-type').custom(value => value.includes('multipart/form-data'))
            .withMessage('Content-Type must be multipart/form-data'),
        validationExaminator
    ]
}

const availableAmenities = ["amtTV", "amtMicrophone", "amtProjector", "amtPhone"];

const availableDows = ["dowMonday", "dowTuesday", "dowWednesday",
    "dowThursday", "dowFriday", "dowSaturday", "dowSunday"];

export default router;