import express from "express";
import dbClient from '../DbClient';
import { ObjectID } from "mongodb";
import passport from "passport";
require('../auth');
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

// ADMIN
router.post('/accept-reservation', async (req, res) => {
    passport.authenticate('jwt', { session: false }, async (error, user) => {
        if (!user.role) return res.status(401).json({
            message: "Unauthorized access"
        });
        if (user.role !== "ADMIN") return res.status(401).json({
            message: "OK. You're logged in but you have to be admin to do this"
        });

        await changeReservationStatus(req, res, "ACCEPTED");
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

const changeReservationStatus = async (req, res, newStatus) => {
    if (!ObjectID.isValid(req.body.reservationId)) {
        res.status(400).json({
            message: `Error: '${req.body.reservationId}' is invalid ObjectID`
        });
    }
    const reservationId = new ObjectID(req.body.reservationId);
    try {
        const dbResult = await resSystemDbClient.withDb(async db => {
            const reservation = await db.collection('reservations').findOne({
                "_id": reservationId
            });
            if (!reservation) return {
                type: "ERR",
                message: `Error: There is no reservation with id '${reservationId}'`
            };

            if (reservation.status === newStatus) return {
                type: "ERR",
                message: `Error: Reservation '${reservationId}' is already ${newStatus}`
            };

            await db.collection('reservations').updateOne(
                { '_id': reservationId },
                { $set: { status: newStatus } }
            );
            return {
                type: "OK"
            };
        });

        if (dbResult.type === "ERR") {
            return res.status(400).json({
                message: dbResult.message
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
};

const prepareReservation = req => {
    const startDateMs = Date.parse(req.body.startDate);
    const endDateMs = Date.parse(req.body.endDate);

    return {
        startDate: startDateMs
            ? new Date(startDateMs)
            : null,
        endDate: endDateMs
            ? new Date(endDateMs)
            : null,
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
    if (!reservation.startDate) errors.push(`'startDate' is not ISO 8601 datetime format.`)
    if (!reservation.endDate) errors.push(`'endDate' is not ISO 8601 datetime format.`)
    if (!reservation.userId) errors.push(`'userId' is not correct ObjectID`);
    if (!reservation.roomId) errors.push(`'roomId' is not correct ObjectID`);
    if (!reservation.pricePerDay) errors.push(`'pricePerDay' is not valid price`);
    if (!reservation.totalPrice) errors.push(`'totalPrice' is not valid float price`);
    return errors;
};

const preparePrice = value => {
    if (!value) return null;
    else if (typeof (value) === 'number') return value.toFixed(2);
    else if (/\d+(\.\d{1,2})?$/.test(value)) return parseFloat(value);
    else return null;
}

export default router;