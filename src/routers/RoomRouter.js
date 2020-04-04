import express from "express";
import { ObjectID } from "mongodb";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import dbClient from "../DbClient";
import passport from "passport";
import moment from "moment";

require('../auth');
const dbActions = require('../DbQueries');
const router = express.Router();

const resSystemDbClient = dbClient();

/*
    ADD PRICES!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/
router.get('/rooms', async (req, res) => {
    const errors = [];
    const fromDate = moment.utc(req.query.fromDate, moment.ISO_8601, true);
    if (!fromDate.isValid()) errors.push(`'fromDate' is not ISO 8601 datetime format.`);
    const toDate = moment.utc(req.query.toDate, moment.ISO_8601, true);
    if (!toDate.isValid()) errors.push(`'toDate' is not ISO 8601 datetime format.`);
    const fromPrice = preparePrice(req.query.fromPrice);
    if (!fromPrice) errors.push(`'fromPrice' is not valid float number.`);
    const toPrice = preparePrice(req.query.toPrice);
    if (!toPrice) errors.push(`'toPrice' is not valid float number.`);

    if (errors.length > 0) return res.json({
        "errors": errors
    });

    const searchData = {
        fromDate: fromDate,
        toDate: toDate,
        fromPrice: fromPrice,
        toPrice: toPrice
    };

    try {
        const dbResult = await resSystemDbClient.withDb(async db => {
            const availableRoomsIds = await dbActions.getAvailableRoomsIds(db, searchData);
            const roomPreviews = await dbActions.getRoomPreviews(db, availableRoomsIds);
            return roomPreviews;
        });
        res.status(200).json({
            "rooms": dbResult
        });
    } catch (error) {
        console.log(`Error: ${error}`);
        res.status(500).json({
            message: "Error: Internal error"
        });
    }
});

router.get('/rooms/:id', async (req, res) => {
    if (!ObjectID.isValid(req.params.id)) return res.status(400).json({
        message: `Error: '${req.params.id} is not valid ObjectID'`
    });
    const roomId = new ObjectID(req.params.id);

    try {
        const room = await resSystemDbClient.withDb(async db => {
            return await db.collection('rooms').findOne({ "_id": new ObjectID(roomId) })
        });
        if (!room) return res.status(400).json({ message: `There is no room with ${req.params.id} id` });
        return res.status(200).json(room);
    } catch (error) {
        console.log(`Error: ${error}`);
        res.status(500).json({
            message: "Internal error"
        });
    }
});

// USER & ADMIN
router.post('/create-room', async (req, res) => {
    passport.authenticate('jwt', { session: false }, async (error, user) => {
        if (!user.role) return res.status(401).json({
            message: "Unauthorized access"
        });

        const isFormData = req.headers["content-type"].includes('multipart/form-data');
        if (!isFormData) return res.status(400).json({
            message: "Error: Header must have Content-Type='multipart/form-data'"
        });

        let roomJson = {
            name: req.body.name,
            location: req.body.location,
            capacity: req.body.capacity,
            pricePerDay: req.body.pricePerDay,
            description: req.body.description,
            amenities: req.body.amenities,
            dows: req.body.dows
        };

        const processingErrors = processRoomJson(roomJson, isFormData);
        console.log(roomJson);

        if (processingErrors.length) {
            return res.status(400).json({
                errors: processingErrors
            })
        };

        if (!req.files) {
            return res.status(400).json({
                errors: ["No file uploaded"]
            });
        }

        const file = req.files.file;
        const uploadDirPath = path.resolve(__dirname, "..", "..", "client/public/uploads/images")
        const newFilename = uuidv4() + path.extname(file.name);

        file.mv(`${uploadDirPath}/${newFilename}`, error => {
            if (error) {
                console.log(error)
                return res.status(500).json({
                    message: `Error: ${error}`
                });
            }
        });

        roomJson.photo = `/uploads/images/${newFilename}`;

        try {
            const insertedId = await resSystemDbClient.withDb(async db => {
                return await db.collection('rooms').insertOne(roomJson).then(result => {
                    return result.insertedId;
                });
            })
            res.status(200).json({
                "roomId": insertedId
            });
        } catch (error) {
            console.log(`Error: ${error}`);
            res.status(500).json({
                message: "Error: Internal error"
            });
        }
    })(req, res);
});

const processRoomJson = roomJson => {
    console.log(roomJson);
    let errors = [];
    if (!roomJson.name) errors.push("'name' is not provided");
    if (!roomJson.location) errors.push("'location' is not provided");

    roomJson.capacity = parseInt(roomJson.capacity);
    if (!roomJson.capacity) errors.push("'capacity' is not provided or it's not integer");

    roomJson.pricePerDay = parseFloat(roomJson.pricePerDay);
    if (!roomJson.pricePerDay) errors.push("'pricePerDay' is not provided or it's not float");

    let amenitiesError = validateAmenities(roomJson.amenities);
    if (amenitiesError) errors.push(amenitiesError);
    roomJson.amenities = amenitiesError ? null : JSON.parse(roomJson.amenities);

    let dowsError = validateDows(roomJson.dows);
    if (dowsError) errors.push(dowsError);
    roomJson.dows = dowsError ? null : JSON.parse(roomJson.dows);

    return errors;
}

/**
 * @param {String} amenities 
 */
const validateAmenities = amenities => {
    const availableAmenities = ["amtTV", "amtMicrophone", "amtProjector", "amtPhone"];
    let parsedAmenities;
    try {
        parsedAmenities = JSON.parse(amenities);
    } catch (error) {
        return `'amenities': ${error}`;
    }

    console.log(parsedAmenities.length);
    if (!Array.isArray(parsedAmenities) || parsedAmenities.length === 0) {
        return "'amenities' must be non-empty array";
    }

    const hasIllegalElements = parsedAmenities.some(amenity =>
        !availableAmenities.includes(amenity));
    if (hasIllegalElements) return "Amenities array contains at least one illegal amenity";

    return null;
}

/**
 * @param {Array} dows 
 */
const validateDows = dows => {
    const availableDows = ["dowMonday", "dowTuesday", "dowWednesday",
        "dowThursday", "dowFriday", "dowSaturday", "dowSunday"];

    let parsedDows;
    try {
        parsedDows = JSON.parse(dows);
    } catch (error) {
        return `Dows: ${error}`;
    }
    if (!Array.isArray(parsedDows) || parsedDows.length === 0) {
        return "'dows' must be non-empty array";
    }

    const hasIllegalElements = parsedDows.some(dow => !availableDows.includes(dow));
    if (hasIllegalElements) return "'dows' contains at least one illegal dow";

    return null;
}

const preparePrice = value => {
    if (!value) return null;
    else if (typeof (value) === 'number') return value.toFixed(2);
    else if (/\d+(\.\d{1,2})?$/.test(value)) return parseFloat(value);
    else return null;
}

export default router;