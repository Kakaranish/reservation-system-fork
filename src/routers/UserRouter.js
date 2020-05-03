import express from "express";
import dbClient from '../DbClient';
import passport from "passport";
import { ObjectID } from "mongodb";
require('../auth');
const dbActions = require('../DbQueries');
import mongoose from 'mongoose';
import Reservation from '../models/reservation-model';
import FindReservationQueryBuilder from '../queries/FindReservationQueryBuilder';
import { parseObjectId } from '../common';
import { userValidator, adminValidator, authValidator } from '../auth-validators';
import { query, validationResult } from 'express-validator';

const router = express();
const resSystemDbClient = dbClient();


router.get('/reservations', [
    userValidator,
    query('status').notEmpty().withMessage('cannot be empty').bail()
        .custom(status => {
            const availableStatuses = ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'];
            if (!availableStatuses.includes(status))
                throw Error('illegal status');
            return true;
        })
], async (req, res) => {
    if (validationResult(req).errors.length > 0)
        return res.status(400).json(validationResult(req));
    try {
        const queryBuilder = new FindReservationQueryBuilder();
        const reservations = await queryBuilder
            .withUserId(req.user._id)
            .withStatus(req.query.status)
            .withPopulatedUserData('-_id email firstName lastName')
            .withPopulatedRoomData('-_id name location photoUrl')
            .select('id fromDate toDate pricePerDay totalPrice userId roomId')
            .build();
        res.status(200).json(reservations);
    } catch (error) {
        console.log(`Error: ${error}`);
        res.status(500).json({ errors: ['Internal error'] });
    }
});


router.post('/cancel-reservation/:reservationId', async (req, res) => {
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

router.post('/check-if-email-available', async (req, res) => {
    const userEmail = req.body.email;
    if (!userEmail) return res.status(400).json({
        message: "'email' was not provided"
    });

    try {
        const userExists = await resSystemDbClient.withDb(async db => {
            return await dbActions.userWithEmailExists(db, userEmail);
        });
        return res.status(200).json({
            "available": !userExists
        });
    } catch (error) {
        console.log(`Error: ${error}`);
        res.status(500).json({
            message: "Error: Internal server error"
        });
    }
});

export default router;