import express from 'express';
import { withAsyncRequestHandler, preparePrice, deleteImage, uploadImage } from '../../common';
import Room from '../../models/room-model';
import { tokenValidatorMW, ownerValidatorMW } from '../../auth/auth-validators';
import { body, header, param } from 'express-validator';
import { validationExaminator, uploadImageMW } from '../../common-middlewares';

const router = express.Router();

router.get('/', getOwnerRoomsValidationMWs(), async (req, res) => {
    withAsyncRequestHandler(res, async () => {
        const rooms = await Room.find({ ownerId: req.user._id });
        res.status(200).json(rooms);
    });
});

router.post('/', createRoomValidationMiddlewares(), uploadImageMW,
    async (req, res) => {
        withAsyncRequestHandler(res, async () => {
            const room = new Room({
                ownerId: req.user._id,
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

router.put('/:id', updateRoomValidationMWs(), async (req, res) => {
    withAsyncRequestHandler(res, async () => {
        req.room.name = req.body.name;
        req.room.location = req.body.location;
        req.room.capacity = req.body.capacity;
        req.room.pricePerDay = req.body.pricePerDay;
        req.room.description = req.body.description;
        req.room.amenities = req.amenities;
        req.room.dows = req.dows;

        if (req.files?.file) {
            await deleteImage(req.room.image);
            const image = await uploadImage(req.files.file);
            req.room.image = image;
        }

        await req.room.save();

        res.sendStatus(200);
    });
});

function getOwnerRoomsValidationMWs() {
    return [
        tokenValidatorMW,
        ownerValidatorMW
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
    ];
}

function updateRoomValidationMWs() {
    return [
        tokenValidatorMW,
        ownerValidatorMW,
        param('id').custom(async (value, { req }) => {
            const room = await Room.findOne({
                _id: value,
                ownerId: req.user._id
            });
            if (!room) return Promise.reject('no such room');

            req.room = room;
        }),
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
    ];
}

const availableAmenities = ["amtTV", "amtMicrophone", "amtProjector", "amtPhone"];

const availableDows = ["dowMonday", "dowTuesday", "dowWednesday",
    "dowThursday", "dowFriday", "dowSaturday", "dowSunday"];


export default router;