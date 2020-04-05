import express from "express";
import dbClient from '../DbClient';
import passport from "passport";
require('../auth');
const dbActions = require('../DbQueries')

const router = express();
const resSystemDbClient = dbClient();

router.get('/pending-reservations', async (req, res) => {
    passport.authenticate('jwt', { session: false }, async (error, user) => {
        if (!user.role) return res.status(401).json({
            message: "Unauthorized access"
        });
        if (user.role !== "ADMIN") return res.status(401).json({
            message: "OK. You're logged in but you have to be admin to do this"
        });

        try {
            const pendingReservations = await resSystemDbClient.withDb(async db => {
                return await dbActions.getReservationsWithStatus(db, "PENDING");
            });
            res.status(200).json(pendingReservations);
        } catch (error) {
            console.log(`Error: ${error}`);
            res.status(500).json({
                message: "Error: Internal server error"
            });
        }
    })(req, res);
});

router.get('/accepted-reservations', async (req, res) => {
    passport.authenticate('jwt', { session: false }, async (error, user) => {
        if (!user.role) return res.status(401).json({
            message: "Unauthorized access"
        });
        if (user.role !== "ADMIN") return res.status(401).json({
            message: "OK. You're logged in but you have to be admin to do this"
        });

        try {
            const pendingReservations = await resSystemDbClient.withDb(async db => {
                return await dbActions.getReservationsWithStatus(db, "ACCEPTED");
            });
            res.status(200).json(pendingReservations);
        } catch (error) {
            console.log(`Error: ${error}`);
            res.status(500).json({
                message: "Error: Internal server error"
            });
        }
    })(req, res);
});

router.get('/rejected-reservations', async (req, res) => {
    passport.authenticate('jwt', { session: false }, async (error, user) => {
        if (!user.role) return res.status(401).json({
            message: "Unauthorized access"
        });
        if (user.role !== "ADMIN") return res.status(401).json({
            message: "OK. You're logged in but you have to be admin to do this"
        });

        try {
            const pendingReservations = await resSystemDbClient.withDb(async db => {
                return await dbActions.getReservationsWithStatus(db, "REJECTED");
            });
            res.status(200).json(pendingReservations);
        } catch (error) {
            console.log(`Error: ${error}`);
            res.status(500).json({
                message: "Error: Internal server error"
            });
        }
    })(req, res);
});

router.get('/cancelled-reservations', async (req, res) => {
    passport.authenticate('jwt', { session: false }, async (error, user) => {
        if (!user.role) return res.status(401).json({
            message: "Unauthorized access"
        });
        if (user.role !== "ADMIN") return res.status(401).json({
            message: "OK. You're logged in but you have to be admin to do this"
        });

        try {
            const pendingReservations = await resSystemDbClient.withDb(async db => {
                return await dbActions.getReservationsWithStatus(db, "CANCELLED");
            });
            res.status(200).json(pendingReservations);
        } catch (error) {
            console.log(`Error: ${error}`);
            res.status(500).json({
                message: "Error: Internal server error"
            });
        }
    })(req, res);
});

export default router;