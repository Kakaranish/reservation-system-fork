import app from '../../src/app';
import supertest from 'supertest';
import mongoose from 'mongoose';
import 'regenerator-runtime';
import Reservation from '../../src/models/reservation-model';
import * as TestUtils from '../test-utils';
import moment from 'moment';
import { parseObjectId } from '../../src/common';
import { connectTestDb } from '../../src/mongo-utils';

const request = supertest(app);

let testUserAccessToken = TestUtils.createTestAccessToken({
    _id: '5ea54fe32d431462827c2c5e',
    email: 'user@mail.com',
    role: 'USER'
}, 3600);

let testAdminAccessToken = TestUtils.createTestAccessToken({
    _id: '5ea5501566815162f73bad80',
    email: 'admin@mail.com',
    role: 'ADMIN'
}, 3600);


beforeAll(async () => {
    await connectTestDb();
});

describe('PUT /reservations/:id/modify/accept', () => {
    it('When auth token not provided then error is returned', async () => {
        // Arrange:
        const reservationId = 'ANY';

        // Act:
        const result = await request.put(`/reservations/${reservationId}/modify/accept`);

        // Assert:
        expect(result.status).toBe(401);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].includes("no/invalid refresh")).toBe(true);
    });

    it('When auth token is provided but role other than admin then error is returned', async () => {
        // Arrange:
        const reservationId = 'ANY';

        // Act:
        const result = await request.put(`/reservations/${reservationId}/modify/accept`)
            .set('Cookie', [`accessToken=${testUserAccessToken}`]);

        // Assert:
        expect(result.status).toBe(401);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].includes('admin')).toBe(true);
    });

    it('When reservation id is not valid ObjectId then error is returned', async () => {
        // Arrange:
        const reservationId = 'ANY';

        // Act:
        const result = await request.put(`/reservations/${reservationId}/modify/accept`)
            .set('Cookie', [`accessToken=${testAdminAccessToken}`]);

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].param).toBe('id');
        expect(result.body.errors[0].msg.includes('invalid mongo ObjectId'));
    });

    it('When reservation does not exist then error is returned', async () => {
        // Arrange:
        const reservationId = '5eac25f135b036c9168abfbe';

        // Act:
        const result = await request.put(`/reservations/${reservationId}/modify/accept`)
            .set('Cookie', [`accessToken=${testAdminAccessToken}`]);

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].param).toBe('id');
        expect(result.body.errors[0].msg.includes("with given id")).toBe(true);
    });

    it('When requested reservation is already accepted then error is returned', async () => {
        // Arrange:
        const reservationId = '5eac23434fcb4261665be561';

        // Act:
        const result = await request.put(`/reservations/${reservationId}/modify/accept`)
            .set('Cookie', [`accessToken=${testAdminAccessToken}`]);

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].param).toBe('id');
        expect(result.body.errors[0].msg.includes("already accepted")).toBe(true);
    });

    it('When other reservation is already accepted then error is returned and this reservation status is changed to rejected', async () => {
        // Arrange:
        const reservationId = '5eac2249372b7676ffb9c88e';

        // Act:
        const result = await request.put(`/reservations/${reservationId}/modify/accept`)
            .set('Cookie', [`accessToken=${testAdminAccessToken}`]);

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(2);
        expect(result.body.errors.some(x => x.includes('cannot be accepted'))).toBe(true);
        expect(result.body.errors.some(x => x.includes('changed to REJECTED'))).toBe(true);

        const reservationStatus = (await Reservation.findById(reservationId)).status;
        expect(reservationStatus).toBe("REJECTED");

        // CLEANUP
        try {
            await Reservation.findByIdAndUpdate(reservationId, {
                $set: {
                    status: "PENDING"
                }
            });
        } catch (error) { }
    });

    it('When reservation request is correct and reservation can be acccepted then ok status is returned', async () => {
        // Arrange:
        const reservationToAcceptId = '5eac22acebac85f7dd117a14';
        const reservationToRejectId = '5eac22a4a4fbab8bc52230a3';
        const alreadyCancelledReservationId = '5eac358cac8b270b1c1863f0';

        // Act:
        const result = await request.put(`/reservations/${reservationToAcceptId}/modify/accept`)
            .set('Cookie', [`accessToken=${testAdminAccessToken}`])

        // Assert:
        expect(result.status).toBe(200);
        expect(result.body._id).toBe(reservationToAcceptId);
        const acceptedReservation = await Reservation.findById(reservationToAcceptId);
        expect(acceptedReservation.status).toBe("ACCEPTED");
        const rejectedReservation = await Reservation.findById(reservationToRejectId);
        expect(rejectedReservation.status).toBe("REJECTED");
        const cancelledReservation = await Reservation.findById(alreadyCancelledReservationId);
        expect(cancelledReservation.status).toBe("CANCELLED");

        // CLEANUP
        try {
            await Reservation.findByIdAndUpdate(reservationToAcceptId, {
                $set: { status: "PENDING" }
            });
            await Reservation.findByIdAndUpdate(reservationToRejectId, {
                $set: { status: "PENDING" }
            });
        } catch (error) { }
    });
});

describe('PUT /reservations/:id/modify/reject', () => {
    it('When no token is provided then error is returned', async () => {
        // Arrange:
        const reservationId = 'INVALID';

        // Act:
        const result = await request.put(`/reservations/${reservationId}/modify/reject`);

        // Assert:
        expect(result.status).toBe(401);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].includes('no/invalid refresh')).toBe(true);
    });

    it('When admin token is not provided then error is returned', async () => {
        // Arrange:
        const reservationId = 'INVALID';

        // Act:
        const result = await request.put(`/reservations/${reservationId}/modify/reject`)
            .set('Cookie', [`accessToken=${testUserAccessToken}`]);

        // Assert:
        expect(result.status).toBe(401);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].includes('admin role required')).toBe(true);
    });

    it('When reservation id is invalid then error is returned', async () => {
        // Arrange:
        const reservationId = 'INVALID';

        // Act:
        const result = await request.put(`/reservations/${reservationId}/modify/reject`)
            .set('Cookie', [`accessToken=${testAdminAccessToken}`]);

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].param).toBe('id');
        expect(result.body.errors[0].msg.includes('invalid mongo ObjectId')).toBe(true);
    });

    it('When reservation with given id does not exist then error is returned', async () => {
        // Arrange:
        const randomReservationId = '5eae996fececcab610a66b62';

        // Act:
        const result = await request.put(`/reservations/${randomReservationId}/modify/reject`)
            .set('Cookie', [`accessToken=${testAdminAccessToken}`]);

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].includes('there is no reservation with id')).toBe(true);
    });

    it('When reservation exists then it is rejected', async () => {
        // Arrange:
        const reservationId = '5eae965024496e1a07f59774';
        let reservation = await Reservation.findById(reservationId);
        if (!reservation)
            throw Error('TEST CANT BE RUN - RESERVATION DOES NOT EXIST');
        if (reservation.status === 'REJECTED')
            throw Error('TEST CANT BE RUN - RESERVATION DOES IS ALREADY REJECTED');

        // Act:
        const result = await request.put(`/reservations/${reservationId}/modify/reject`)
            .set('Cookie', [`accessToken=${testAdminAccessToken}`]);

        try {
            // Assert:
            expect(result.status).toBe(200);
            expect(result.body.errors).toBeUndefined();
            expect(mongoose.Types.ObjectId.isValid(result.body._id)).toBe(true);
            expect(result.body._id).toBe(reservationId);

            reservation = await Reservation.findById(reservationId);
            expect(reservation._id).toStrictEqual(parseObjectId(reservationId));
            expect(moment.utc().subtract(20, "seconds").toDate() < reservation.updateDate).toBe(true);
            expect(moment.utc().add(20, "seconds").toDate() > reservation.updateDate).toBe(true);
        } catch (error) {
            throw error;
        } finally {
            await Reservation.findByIdAndUpdate(reservationId,
                { $set: { status: "PENDING" } });
        }
    });
});

describe('PUT /reservations/:id/modify/cancel', () => {
    it('When no token is provided then error is returned', async () => {
        // Arrange:
        const reservationId = 'INVALID';

        // Act:
        const result = await request.put(`/reservations/${reservationId}/modify/cancel`)
            .send({ reservationId: 'INVALID' });

        // Assert:
        expect(result.status).toBe(401);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].includes('no/invalid refresh')).toBe(true);
    });

    it('When user token is not provided then error is returned', async () => {
        // Arrange:
        const reservationId = 'INVALID';

        // Act:
        const result = await request.put(`/reservations/${reservationId}/modify/cancel`)
            .set('Cookie', [`accessToken=${testAdminAccessToken}`])
            .send({ reservationId: 'INVALID' });

        // Assert:
        expect(result.status).toBe(401);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].includes('user role required')).toBe(true);
    });

    it('When reservation id is invalid then error is returned', async () => {
        // Arrange:
        const reservationId = 'INVALID';

        // Act:
        const result = await request.put(`/reservations/${reservationId}/modify/cancel`)
            .set('Cookie', [`accessToken=${testUserAccessToken}`])
            .send({ reservationId: 'INVALID' });

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].param).toBe('id');
        expect(result.body.errors[0].msg.includes('invalid mongo ObjectId')).toBe(true);
    });

    it('When reservation with given id does not exist then error is returned', async () => {
        // Arrange:
        const reservationId = '5eae996fececcab610a66b62'; // Random

        // Act:
        const result = await request.put(`/reservations/${reservationId}/modify/cancel`)
            .set('Cookie', [`accessToken=${testUserAccessToken}`])
            .send({ reservationId: reservationId });

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].includes('there is no reservation with id')).toBe(true);
    });

    it('When reservation exists then it is cancelled', async () => {
        // Arrange:
        const reservationId = '5eae9e372a81fdb8b32c8380';
        let reservation = await Reservation.findById(reservationId);
        if (!reservation)
            throw Error('TEST CANT BE RUN - RESERVATION DOES NOT EXIST');
        if (reservation.status === 'CANCELLED')
            throw Error('TEST CANT BE RUN - RESERVATION DOES IS ALREADY CANCELLED');

        // Act:
        const result = await request.put(`/reservations/${reservationId}/modify/cancel`)
            .set('Cookie', [`accessToken=${testUserAccessToken}`])
            .send({ reservationId: reservationId });

        try {
            // Assert:
            expect(result.status).toBe(200);
            expect(result.body.errors).toBeUndefined();
            expect(mongoose.Types.ObjectId.isValid(result.body._id)).toBe(true);
            expect(result.body._id).toBe(reservationId);

            reservation = await Reservation.findById(reservationId);
            expect(reservation._id).toStrictEqual(parseObjectId(reservationId));
            expect(reservation.status).toBe('CANCELLED');
            expect(moment.utc().subtract(20, "seconds").toDate() < reservation.updateDate).toBe(true);
            expect(moment.utc().add(20, "seconds").toDate() > reservation.updateDate).toBe(true);

        } catch (error) {
            throw error;
        } finally {
            await Reservation.findByIdAndUpdate(reservationId,
                { $set: { status: "PENDING" } });
        }
    });
});

afterAll(() => {
    mongoose.connection.close();
});