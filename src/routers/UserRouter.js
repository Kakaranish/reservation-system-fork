import express from "express";
import dbClient from '../DbClient';
import passport from "passport";
import { ObjectID } from "mongodb";
require('../auth');
const dbActions = require('../DbQueries');

const router = express();
const resSystemDbClient = dbClient();

router.get('/pending-reservations/:userId', async (req, res) => {
    passport.authenticate('jwt', { session: false }, async (error, user) => {
        if (!user.role) return res.status(401).json({
            message: "Unauthorized access"
        });
        if (user.role !== "USER") return res.status(401).json({
            message: "OK admin. Only normal user can do this"
        });

        if (!ObjectID.isValid(req.params.userId)) {
            return res.status(400).json({
                message: `Error: ${req.params.userId} is not valid ObjectID`
            });
        }
        const userId = new ObjectID(req.params.userId);
        const status = "PENDING";
        getReservationWtihStatus(userId, status, res)
    })(req, res);
});

router.get('/accepted-reservations/:userId', async (req, res) => {
    passport.authenticate('jwt', { session: false }, async (error, user) => {
        if (!user.role) return res.status(401).json({
            message: "Unauthorized access"
        });
        if (user.role !== "USER") return res.status(401).json({
            message: "OK admin. Only normal user can do this"
        });

        if (!ObjectID.isValid(req.params.userId)) {
            return res.status(400).json({
                message: `Error: ${req.params.userId} is not valid ObjectID`
            });
        }
        const userId = new ObjectID(req.params.userId);
        const status = "ACCEPTED";
        getReservationWtihStatus(userId, status, res)
    })(req, res);
});

router.get('/rejected-reservations/:userId', async (req, res) => {
    passport.authenticate('jwt', { session: false }, async (error, user) => {
        if (!user.role) return res.status(401).json({
            message: "Unauthorized access"
        });
        if (user.role !== "USER") return res.status(401).json({
            message: "OK admin. Only normal user can do this"
        });

        if (!ObjectID.isValid(req.params.userId)) {
            return res.status(400).json({
                message: `Error: ${req.params.userId} is not valid ObjectID`
            });
        }
        const userId = new ObjectID(req.params.userId);
        const status = "REJECTED";
        getReservationWtihStatus(userId, status, res)
    })(req, res);
});

router.get('/cancelled-reservations/:userId', async (req, res) => {
    passport.authenticate('jwt', { session: false }, async (error, user) => {
        if (!user.role) return res.status(401).json({
            message: "Unauthorized access"
        });
        if (user.role !== "USER") return res.status(401).json({
            message: "OK admin. Only normal user can do this"
        });

        if (!ObjectID.isValid(req.params.userId)) {
            return res.status(400).json({
                message: `Error: ${req.params.userId} is not valid ObjectID`
            });
        }
        const userId = new ObjectID(req.params.userId);
        const status = "CANCELLED";
        getReservationWtihStatus(userId, status, res)
    })(req, res);
});

router.get('/cancel-reservation/:reservationId', async (req, res) => {
    passport.authenticate('jwt', { session: false }, async (error, user) => {
        if (!user.role) return res.status(401).json({
            message: "Unauthorized access"
        });
        if (user.role !== "USER") return res.status(401).json({
            message: "OK admin. Only normal user can do this"
        });

        if (!ObjectID.isValid(req.params.reservationId)) {
            return res.status(400).json({
                message: `Error: ${req.params.reservationId} is not valid reservationId`
            });
        }

        const reservationId = new ObjectID(req.params.reservationId);
        try {
            const pendingReservations = await resSystemDbClient.withDb(async db => {
                if (!await dbActions.reservationWithIdExists(db, reservationId)) return null;
                await dbActions.changeReservationStatus(db, reservationId, "CANCELLED");
                return true;
            });
            if (!pendingReservations) return res.status(400).json({
                message: `Error: Reservation with id ${reservationId} does not exist`
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

const getReservationWtihStatus = async (userId, status, res) => {
    try {
        const pendingReservations = await resSystemDbClient.withDb(async db => {
            if (!await dbActions.userWithIdExists(db, userId)) return null;
            return await dbActions.getReservationsWithStatusForUser(db, userId, status)
        });
        console.log(pendingReservations);
        if (!pendingReservations) return res.json({
            message: `Error: User with id ${req.params.userId} does not exist`
        });
        res.status(200).json(pendingReservations);
    } catch (error) {
        console.log(`Error: ${error}`);
        res.status(500).json({
            message: "Error: Internal server error"
        });
    }
};

export default router;