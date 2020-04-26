import express from "express";
import mongoose from 'mongoose';
import dbClient from '../DbClient';
import passport from "passport";
import moment from 'moment';
import '../auth';
const preparePrice = require('../common').preparePrice;

import { ObjectID } from "mongodb";
const dbActions = require('../DbQueries')

const router = express();
const resSystemDbClient = dbClient();

// USER & ADMIN
router.post('/create-reservation', async (req, res) => {
    passport.authenticate('jwt', { session: false }, async (error, user) => {
        if (!user.role) return res.status(401).json({
            message: "Unauthorized access"
        });

        let reservation = prepareReservation(req);
        let errors = validateReservation(reservation);
        if (errors.length > 0) {
            console.log(errors);
            return res.status(400).json({
                "errors": errors
            });
        };

        try {
            const insertResult = await resSystemDbClient.withDb(async db => {
                if (!await dbActions.roomWithIdExists(db, reservation.roomId)) {
                    return {
                        type: "ERR",
                        message: `Error: Room with id '${reservation.roomId}' does not exist`
                    }
                }
                if (!await dbActions.userWithIdExists(db, reservation.userId)) {
                    return {
                        type: "ERR",
                        message: `Error: User with id '${reservation.userId}' does not exist`
                    }
                }
                const dateInterval = {
                    "startDate": reservation.startDate,
                    "endDate": reservation.endDate
                };
                if (await dbActions.otherReservationOnGivenRoomAndDateIntervalExists(db, reservation.roomId, dateInterval)) {
                    return {
                        type: "ERR",
                        message: `Error: Other reservation/reservations on this room and date interval already exist(s)`
                    }
                }

                reservation.status = "PENDING";
                reservation.createDate = moment.utc().toDate();
                reservation.updateDate = moment.utc().toDate();

                const reservationId = await db.collection('reservations')
                    .insertOne(reservation)
                    .then(result => result.insertedId);

                return {
                    "type": "OK",
                    "reservationId": reservationId
                };
            });

            if (insertResult.type === "ERR") {
                return res.status(400).json({
                    "message": insertResult.message
                });
            }
            return res.status(200).json({
                "reservationId": insertResult.reservationId
            });
        } catch (error) {
            console.log(`Error: ${error}`);
            res.status(500).json({
                message: "Error: Internal server error"
            });
        }
    })(req, res);
});

router.get('/reservations/:roomid', async (req, res) => {
    const errors = [];
    const roomId = req.params.roomid;
    if (!ObjectID.isValid(roomId)) errors.push(`Error: '${roomId} is not valid ObjectID'`);
    const fromDate = moment.utc(req.query.fromDate, "YYYY-MM-DD", true);
    if (!fromDate.isValid()) errors.push(`'fromDate' is not 'YYYY-MM-DD' format.`);
    const toDate = moment.utc(req.query.toDate, "YYYY-MM-DD", true);
    if (!toDate.isValid()) errors.push(`'toDate' is not 'YYYY-MM-DD' format.`);
    if (errors.length > 0) return res.status(400).json({
        "errors": errors
    });

    const searchData = {
        roomId: roomId,
        fromDate: fromDate.toDate(),
        toDate: toDate.toDate()
    };

    try {
        const dbResult = await resSystemDbClient.withDb(async db => {
            return await dbActions.getReservationsForRoom(db, searchData);
        });
        res.status(200).json(dbResult);

    } catch (error) {
        console.log(`Error: ${error}`);
        res.status(500).json({
            message: "Error: Internal error"
        });
    }
})

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

router.get('/accepted-reservations/:roomid', async (req, res) => {
    const errors = [];
    if (!ObjectID.isValid(req.params.roomid)) errors.push(`Error: '${req.params.roomid} is not valid ObjectID'`);
    const fromDate = moment.utc(req.query.fromDate, "YYYY-MM-DD", true);
    if (!fromDate.isValid()) errors.push(`'fromDate' is not 'YYYY-MM-DD' format.`);
    const toDate = moment.utc(req.query.toDate, "YYYY-MM-DD", true);
    if (!toDate.isValid()) errors.push(`'toDate' is not 'YYYY-MM-DD' format.`);
    if (errors.length > 0) return res.status(400).json({
        "errors": errors
    });

    const roomId = new ObjectID(req.params.roomid);
    const dateInterval = {
        startDate: fromDate.toDate(),
        endDate: toDate.toDate()
    }
    try {
        const reservations = await resSystemDbClient.withDb(async db => {
            return await dbActions.getAcceptedReservationsForDateIntervalForRoom(db, roomId, dateInterval);
        });
        res.status(200).json(reservations);
    } catch (error) {
        console.log(`Error: ${error}`);
        res.status(500).json({
            message: "Error: Internal error"
        });
    }
});

const changeReservationStatus = async (req, res, newStatus) => {
    if (!ObjectID.isValid(req.body.reservationId)) {
        res.status(400).json({
            message: `Error: '${req.body.reservationId}' is invalid ObjectID`
        });
    }
    const reservationId = new ObjectID(req.body.reservationId);
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

const prepareReservation = req => {
    const startDate = moment.utc(req.body.startDate, "YYYY-MM-DD", true);
    const endDate = moment.utc(req.body.endDate, "YYYY-MM-DD", true);
    return {
        startDate: startDate.isValid() ? startDate.toDate() : null,
        endDate: endDate.isValid() ? endDate.toDate() : null,
        userId: ObjectID.isValid(req.body.userId)
            ? new ObjectID(req.body.userId)
            : null,
        roomId: ObjectID.isValid(req.body.roomId)
            ? new ObjectID(req.body.roomId)
            : null,
        pricePerDay: preparePrice(req.body.pricePerDay),
        totalPrice: preparePrice(req.body.totalPrice)
    };
}

const validateReservation = reservation => {
    let errors = [];
    if (!reservation.startDate) errors.push(`'startDate' is not 'YYYY-MM-DD' date format.`)
    if (!reservation.endDate) errors.push(`'endDate' is not 'YYYY-MM-DD' date format.`)
    if (!reservation.userId) errors.push(`'userId' is not correct ObjectID`);
    if (!reservation.roomId) errors.push(`'roomId' is not correct ObjectID`);
    if (!reservation.pricePerDay) errors.push(`'pricePerDay' is not valid price`);
    if (!reservation.totalPrice) errors.push(`'totalPrice' is not valid float price`);
    return errors;
};

export default router;
exports.validateReservation = validateReservation;