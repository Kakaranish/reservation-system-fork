import express from "express";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import Room from "../models/room-model";
import '../auth/passport-config';
import * as dbQueries from '../queries/db-queries';
import { withAsyncRequestHandler } from '../common';
import { errorSummarizerMW, queryDateIntervalValidatorMW } from '../common-middlewares'
import { preparePrice, parseObjectId } from '../common';
import { query, validationResult, param, header, body } from 'express-validator';
import { tokenValidatorMW } from '../auth/auth-validators';
import FindReservationQueryBuilder from "../queries/FindReservationQueryBuilder";

const router = express.Router();

/*
    ADD PRICES!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/
router.get('/', getRoomsValidationMiddlewares(), async (req, res) => {
    if (req.body.errors?.length > 0)
        return res.status(400).json({ errors: req.body.errors });

    withAsyncRequestHandler(res, async () => {
        const roomPreviews = await dbQueries.getAvailableRoomPreviews({
            fromDate: req.query.fromDate,
            toDate: req.query.toDate,
            fromPrice: req.query.fromPrice,
            toPrice: req.query.toPrice
        });
        res.status(200).json(roomPreviews);
    });
});

router.get('/:id', [
    param('id').customSanitizer(id => parseObjectId(id))
        .notEmpty().withMessage('invalid mongo ObjectId')
], async (req, res) => {
    if (validationResult(req).errors.length > 0)
        return res.status(400).json(validationResult(req));

    withAsyncRequestHandler(res, async () => {
        const room = await Room.findById(req.params.id);
        return res.status(200).json(room);
    });
});

router.get('/:id/reservations-preview', [
    param('id').customSanitizer(id => parseObjectId(id))
        .notEmpty().withMessage('invalid mongo ObjectId')
], async (req, res) => {
    if (validationResult(req).errors.length > 0)
        return res.status(400).json(validationResult(req));

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
router.post('/', tokenValidatorMW, createRoomValidationMiddlewares(), async (req, res) => {
    if (validationResult(req).errors.length > 0)
        return res.status(400).json(validationResult(req));
    if (!req.files) return res.status(400).json({
        errors: ["No file uploaded"]
    });

    withAsyncRequestHandler(res, async () => {
        const file = req.files.file;
        const uploadDirPath = path.resolve(__dirname, "..", "..", "client/public/uploads/images")
        const newFilename = uuidv4() + path.extname(file.name);

        const room = new Room({
            name: req.body.name,
            location: req.body.location,
            capacity: req.body.capacity,
            pricePerDay: req.body.pricePerDay,
            description: req.body.description,
            amenities: req.body.amenities,
            dows: req.body.dows,
            photoUrl: `/uploads/images/${newFilename}`
        });
        await room.save();

        res.status(200).json({
            roomId: room._id,
            photoUrl: `/uploads/images/${newFilename}`
        });

        file.mv(`${uploadDirPath}/${newFilename}`, error => {
            if (error) throw error;
        });
    });
});

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
        header('content-type').custom(value => value.includes('multipart/form-data'))
            .withMessage('Content-Type must be multipart/form-data'),
        body('name').isLength({ min: 3 }).withMessage('must have length 3'),
        body('location').isString().isLength({ min: 3 }),
        body('capacity').isInt({ min: 0 }),
        body('pricePerDay').customSanitizer(price => preparePrice(price))
            .notEmpty().withMessage('price must match regex: \d+(\.\d{1,2})?'),
        body('description').optional().isString(),
        body('amenities').notEmpty().withMessage('cannot be empty').bail()
            .isString().withMessage('must be stringified non-empty array').bail()
            .custom(amenities => {
                const parsedAmenities = JSON.parse(amenities);
                if (!Array.isArray(parsedAmenities) || parsedAmenities.length === 0) {
                    throw new Error('must be non-empty array');
                }
                const hasIllegalElements = parsedAmenities.some(
                    amenity => !availableAmenities.includes(amenity));
                if (hasIllegalElements) throw Error('contains at least one illegal amenity');
                return true;
            }),
        body('dows').notEmpty().withMessage('cannot be empty').bail()
            .isString().withMessage('must be stringified non-empty array').bail()
            .custom(dows => {
                const parsedDows = JSON.parse(dows);
                if (!Array.isArray(parsedDows) || parsedDows.length === 0) {
                    throw Error('must be non-empty array');
                }
                const hasIllegalElements = parsedDows.some(dow => !availableDows.includes(dow));
                if (hasIllegalElements) throw Error("contains at least one illegal dow");
                return true;
            })
    ];
}

const availableAmenities = ["amtTV", "amtMicrophone", "amtProjector", "amtPhone"];

const availableDows = ["dowMonday", "dowTuesday", "dowWednesday",
    "dowThursday", "dowFriday", "dowSaturday", "dowSunday"];

export default router;