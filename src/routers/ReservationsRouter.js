import express from "express";
import mongoose from 'mongoose';
import dbClient from '../DbClient';
import passport from "passport";
import moment from 'moment';
import '../auth';
const preparePrice = require('../common').preparePrice;
const parseIsoDatetime = require('../common').parseIsoDatetime;
const parseObjectId = require('../common').parseObjectId;

import dbQueries from '../DbQueries2';
import { ObjectID } from "mongodb";
const dbActions = require('../DbQueries')
import Room from '../models/room-model';
import User from '../models/user-model';
import Reservation from '../models/reservation-model';

const router = express();
const resSystemDbClient = dbClient();

router.get('/rooms/:roomId/reservations', async (req, res) => {
    const errors = [];
    const roomId = parseObjectId(req.params.roomId);
    if (!roomId) errors.push(`${roomId} is not valid ObjectId'`);
    const fromDate = parseIsoDatetime(req.query.fromDate);
    if (!fromDate) errors.push(`'fromDate' is not 'YYYY-MM-DD' format.`);
    const toDate = parseIsoDatetime(req.query.toDate);
    if (!toDate) errors.push(`'toDate' is not 'YYYY-MM-DD' format.`);
    if (errors.length) {
        return res.status(400).json({
            errors: errors
        });
    }

    const searchData = {
        roomId: roomId,
        fromDate: fromDate.toDate(),
        toDate: toDate.toDate()
    };
    try {
        const reservations = await dbQueries.getReservationsForRoom(searchData);
        res.status(200).json(reservations);

    } catch (error) {
        console.log(`Error: ${error}`);
        res.status(500).json({
            message: "Error: Internal error"
        });
    }
})

// USER & ADMIN
/*
    {
        fromDate: String | ISO8601 Datetime - e.g. 2020-04-01T20:00:00.000Z
        toDate: String | ISO8601 Datetime - e.g. 2020-04-01T20:00:00.000Z
        userId: String | ObjectId
        roomId: String | ObjectId
        pricePerDay: String | eg. 22.00 ; 22 ; 22.0
        totalPrice: String | eg. 22.00 ; 22 ; 22.0
    }
*/
router.post('/reservation/create', async (req, res) => {
    passport.authenticate('jwt', { session: false }, async (error, user) => {
        if (!user.role) return res.status(401).json({
            errors: ["Unauthorized access"]
        });

        let reservationJson = prepareReservationJson(req);
        let errors = validateReservationJson(reservationJson);
        if (errors.length) {
            return res.status(400).json({ errors: errors });
        };

        try {
            if (! await Room.exists({ _id: reservationJson.roomId })) return res.status(400).json({
                errors: [ 
                    `room with id '${reservationJson.roomId}' does not exist`
                ]
            });

            if (! await User.exists({ _id: reservationJson.userId })) return res.status(400).json({
                errors: [
                    `user with id '${reservationJson.userId}' does not exist`
                ]
            });

            const searchData = {
                roomId: reservationJson.roomId,
                fromDate: reservationJson.fromDate,
                toDate: reservationJson.toDate
            };
            if (await dbQueries.otherReservationOnGivenRoomAndDateIntervalExists(searchData)) {
                return res.status(400).json({
                    errors: [
                        `other reservation/reservations on this room and date interval already exist(s)`
                    ]
                });
            }

            reservationJson.status = "PENDING";
            reservationJson.createDate = moment.utc().toDate();
            reservationJson.updateDate = moment.utc().toDate();

            const reservation = new Reservation(reservationJson);
            await reservation.save();

            return res.status(200).json(reservation._id);

        } catch (error) {
            const errors = ['Error: Internal server error'];
            if (error.errors) {
                for (let errorField in error.errors) {
                    errors.push(errorField)
                }
            }

            res.status(500).json({
                errors: errors
            });
        }
    })(req, res);
});

// ADMIN
router.post('/accept-reservation', async (req, res) => {
    passport.authenticate('jwt', { session: false }, async (error, user) => {
        if (!user.role) return res.status(401).json({
            message: "Unauthorized access"
        });
        if (user.role !== "ADMIN") return res.status(401).json({
            message: "OK. Maybe you're logged in but you have to be admin to do this"
        });

        if (!ObjectID.isValid(req.body.reservationId)) {
            res.status(400).json({
                message: `Error: '${req.body.reservationId}' is invalid ObjectID`
            });
        }
        const reservationId = new ObjectID(req.body.reservationId);

        try {
            const dbResult = await resSystemDbClient.withDb(async db => {
                const reservation = await dbActions.changeReservationStatus(
                    db, reservationId, "ACCEPTED");
                if (!reservation) return reservation;

                const roomId = reservation.roomId;
                await dbActions.rejectAllPendingAndSuccessReservationsForRoom(db, roomId, reservationId);

                return reservation;
            });

            if (!dbResult) return res.status(400).json({
                message: `There is no reservation with id ${reservationId}`
            });

            return res.status(200).json({
                message: "OK"
            });
        } catch (error) {
            console.log(`Error: ${error}`);
            res.status(500).json({
                message: "Error: Internal server error"
            });
        }

    })(req, res);
});

// ADMIN
router.post('/reject-reservation', async (req, res) => {
    passport.authenticate('jwt', { session: false }, async (error, user) => {
        if (!user.role) return res.status(401).json({
            message: "Unauthorized access"
        });
        if (user.role !== "ADMIN") return res.status(401).json({
            message: "OK. You're logged in but you have to be admin to do this"
        });

        await changeReservationStatus(req, res, "REJECTED");
    })(req, res);
});

// USER
router.post('/cancel-reservation', async (req, res) => {
    passport.authenticate('jwt', { session: false }, async (error, user) => {
        if (!user.role) return res.status(401).json({
            message: "Unauthorized access"
        });
        if (user.role !== "USER") return res.status(401).json({
            message: "OK. You're logged in but you have to be user to do this"
        });

        await changeReservationStatus(req, res, "CANCELLED");
    })(req, res);
});

// ADMIN
router.delete('/delete-reservation', async (req, res) => {
    passport.authenticate('jwt', { session: false }, async (error, user) => {
        if (!user.role) return res.status(401).json({
            message: "Unauthorized access"
        });
        if (user.role !== "ADMIN") return res.status(401).json({
            message: "OK. You're logged in but you have to be admin to do this"
        });

        if (!ObjectID.isValid(req.body.reservationId)) {
            res.status(400).json({
                message: `Error: '${req.body.reservationId}' is invalid ObjectID`
            });
        }
        const reservationId = new ObjectID(req.body.reservationId);

        try {
            const nDeletedRows = await resSystemDbClient.withDb(async db => {
                return await db.collection('reservations')
                    .deleteOne({ "_id": reservationId })
                    .then(result => result.deletedCount);
            });

            if (nDeletedRows === 0) {
                return res.status(400).json({
                    message: "Nothing was removed"
                });
            }
            return res.status(200).json({
                message: "OK"
            });
        } catch (error) {
            console.log(`Error: ${error}`);
            res.status(500).json({
                message: "Error: Internal server error"
            });
        }
    })(req, res);
});

router.get('/room/:roomId/reservations/accepted', async (req, res) => {
    const errors = [];
    const roomId = parseObjectId(req.params.roomId);
    if (!roomId) errors.push(`Error: '${req.params.roomid} is not valid ObjectID'`);
    const fromDate = parseIsoDatetime(req.query.fromDate);
    if (!fromDate) errors.push(`'fromDate' is not 'YYYY-MM-DD' format.`);
    const toDate = parseIsoDatetime(req.query.toDate);
    if (!toDate) errors.push(`'toDate' is not 'YYYY-MM-DD' format.`);
    if (errors.length > 0) {
        return res.status(400).json({
            errors: errors
        });
    }

    const searchData = {
        roomId: roomId,
        fromDate: fromDate.toDate(),
        toDate: toDate.toDate(),
        status: "ACCEPTED"
    }
    try {
        const reservations = await dbQueries
            .getReservationsForDateIntervalForRoomWithStatus(searchData)
        return res.status(200).json(reservations);
    } catch (error) {
        console.log(`Error: ${error}`);
        res.status(500).json({
            message: "Error: Internal error"
        });
    }
});

const changeReservationStatus = async (req, res, newStatus) => {
    const reservationId = parseObjectId(req.body.reservationId);
    if (!reservationId) {
        res.status(400).json({
            errors: [
                `Error: '${req.body.reservationId}' is invalid ObjectId`
            ]
        });
    }

    try {
        const dbResult = await resSystemDbClient.withDb(async db => {
            return dbActions.changeReservationStatus(db, reservationId, newStatus);
        });

        if (!dbResult) return res.status(400).json({
            message: `There is no reservation with id ${reservationId}`
        });

        return res.status(200).json({
            message: "OK"
        });
    } catch (error) {
        console.log(`Error: ${error}`);
        res.status(500).json({
            message: "Error: Internal server error"
        });
    }
};

/**
 * @param {Object} req 
 * @param {String} req.body.fromDate
 * @param {String} req.body.toDate
 * @param {String} req.body.userId
 * @param {String} req.body.roomId
 * @param {String} req.pricePerDay
 * @param {String} req.totalPrice
 */
const prepareReservationJson = req => {
    return {
        fromDate: parseIsoDatetime(req.body.fromDate),
        toDate: parseIsoDatetime(req.body.toDate),
        userId: parseObjectId(req.body.userId),
        roomId: parseObjectId(req.body.roomId),
        pricePerDay: preparePrice(req.body.pricePerDay),
        totalPrice: preparePrice(req.body.totalPrice)
    };
}

/**
 * @param {Object} reservation
 * @param {moment.Moment} reservation.fromDate
 * @param {moment.Moment} reservation.toDate
 * @param {mongoose.Types.ObjectId} reservation.userId
 * @param {mongoose.Types.ObjectId} reservation.roomId
 * @param {Number} reservation.pricePerDay
 * @param {Number} reservation.totalPrice
 */
const validateReservationJson = reservation => {
    let errors = [];
    if (!reservation.fromDate) errors.push(`'fromDate' is not 'YYYY-MM-DD' date format.`)
    if (!reservation.toDate) errors.push(`'toDate' is not 'YYYY-MM-DD' date format.`)
    if (!reservation.userId) errors.push(`'userId' is not correct ObjectID`);
    if (!reservation.roomId) errors.push(`'roomId' is not correct ObjectID`);
    if (!reservation.pricePerDay) errors.push(`'pricePerDay' is not valid price`);
    if (!reservation.totalPrice) errors.push(`'totalPrice' is not valid float price`);
    return errors;
};

export default router;
exports.prepareReservation = prepareReservationJson;
exports.validateReservation = validateReservationJson;
exports.changeReservationStatus = changeReservationStatus;