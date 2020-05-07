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

const userId = '5ea54fe32d431462827c2c5e';

beforeAll(async () => {
    await connectTestDb();
});

const roomForGettingReservation = '5ea5e3423724e5ff90e7df45';
const reservationsForRoom = [
    '5ea5e6b2f0322ac00ff284ac',
    '5ea5e3beb9f264420ea8799d'
];

describe('/room/:roomId/reservations', () => {
    it('When roomId is not valid ObjectId then error is returned', async () => {
        // Assert: 
        const invalidObjectId = "INVALID";

        // Act:
        const result = await request.get(`/rooms/${invalidObjectId}/reservations`)
            .query({
                fromDate: '2020-05-01T00:00:00.000Z',
                toDate: '2020-05-02T00:00:00.000Z'
            });

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].param).toBe('roomId');
        expect(result.body.errors[0].msg.includes('mongo ObjectId')).toBe(true);
    });

    it('When one of dates is not valid iso datetime then error is returned', async () => {
        // Act:
        const result = await request.get(`/rooms/${roomForGettingReservation}/reservations`)
            .query({
                fromDate: 'INVALID',
                toDate: '2020-05-02T00:00:00.000Z'
            });

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].param).toBe('fromDate');
        expect(result.body.errors[0].msg.includes('ISO8601')).toBe(true);
    });

    it('When correct query values and parameter are provided then valid reservation are returned', async () => {
        // Act:
        const result = await request.get(`/rooms/${roomForGettingReservation}/reservations`)
            .query({
                fromDate: '2020-05-01T00:00:00.000Z',
                toDate: '2020-05-02T00:00:00.000Z'
            });

        // Assert:
        expect(result.status).toBe(200);
        expect(result.body).toHaveLength(2);
        reservationsForRoom.forEach(reservationId => {
            expect(result.body.some(x => x._id === reservationId)).toBe(true)
        });

        const reservation1 = result.body.filter(x => x._id === reservationsForRoom[0])[0];
        expect(reservation1.fromDate).toBe('2020-05-01T00:00:00.000Z');
        expect(reservation1.toDate).toBe('2020-05-01T00:00:00.000Z');

        const reservation2 = result.body.filter(x => x._id === reservationsForRoom[1])[0];
        expect(reservation2.fromDate).toBe('2020-05-02T00:00:00.000Z');
        expect(reservation2.toDate).toBe('2020-05-02T00:00:00.000Z');
    });
});

/*
    roomId: 5ea6fda6e8ecbe2dad9f1c23
    reservationId: 5ea6fe28a5a7f3fc38808a32
*/
describe('POST /reservations', () => {
    it('When request does not contain auth token then error is returned', async () => {
        // Act:
        const result = await request.post(`/reservations`);

        // Assert:
        expect(result.status).toBe(401);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].includes('no/invalid refresh')).toBe(true);
    });

    it('When request does not pass validation then errors are returned', async () => {
        // Act:
        const result = await request.post(`/reservations`)
            .set('Cookie', [`accessToken=${testUserAccessToken}`])
            .send({
                fromDate: "2020-05-01T00:00:00.000Z",
                toDate: "INVALID",
                userId: "5e8659b0c853a3155c0a4be1",
                pricePerDay: "222.22",
                totalPrice: "222.22"
            });

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(3);
        expect(result.body.errors[0].param).toBe('roomId');
        expect(result.body.errors[0].msg.includes('mongo ObjectId')).toBe(true);
        expect(result.body.errors[1].param).toBe('userId');
        expect(result.body.errors[1].msg.includes('user with given')).toBe(true);
        expect(result.body.errors[2].param).toBe('toDate');
        expect(result.body.errors[2].msg.includes('ISO8601')).toBe(true);
    });

    it('When room does not exist then errors are returned', async () => {
        // Arrange:
        const randomRoomId = '5ea6f975f593271424c74017';

        // Act:
        const result = await request.post(`/reservations`)
            .set('Cookie', [`accessToken=${testUserAccessToken}`])
            .send({
                fromDate: "2020-05-01T00:00:00.000Z",
                toDate: "2020-05-01T00:00:00.000Z",
                roomId: randomRoomId,
                userId: userId,
                pricePerDay: "222.22",
                totalPrice: "222.22"
            });

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].param).toBe('roomId');
        expect(result.body.errors[0].msg.includes('room with given')).toBe(true);
    });

    it('When user does not exist then errors are returned', async () => {
        // Arrange:
        const roomId = '5ea6fda6e8ecbe2dad9f1c23';
        const randomUserId = '5ea6f975f593271424c74017';

        // Act:
        const result = await request.post(`/reservations`)
            .set('Cookie', [`accessToken=${testUserAccessToken}`])
            .send({
                fromDate: "2020-05-01T00:00:00.000Z",
                toDate: "2020-05-01T00:00:00.000Z",
                roomId: roomId,
                userId: randomUserId,
                pricePerDay: "222.22",
                totalPrice: "222.22"
            });

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].param).toBe('userId');
        expect(result.body.errors[0].msg.includes('user with given')).toBe(true);
    });

    it('When other reservation(s) on this room and date interval exist then errors are returned', async () => {
        // Arrange:
        const roomId = '5ea6fda6e8ecbe2dad9f1c23';

        // Act:
        const result = await request.post(`/reservations`)
            .set('Cookie', [`accessToken=${testUserAccessToken}`])
            .send({
                fromDate: "2020-05-01T00:00:00.000Z",
                toDate: "2020-05-01T00:00:00.000Z",
                roomId: roomId,
                userId: userId,
                pricePerDay: "222.22",
                totalPrice: "222.22"
            });

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].includes('other reservation')).toBe(true);
    });

    it('When request data is valid and other reservations for that that room and interval do not exist then id of new reservation is returned', async () => {
        // Arrange:
        const roomId = '5ea6fda6e8ecbe2dad9f1c23';

        // Act:
        const result = await request.post(`/reservations`)
            .set('Cookie', [`accessToken=${testUserAccessToken}`])
            .send({
                fromDate: "2020-05-02T00:00:00.000Z",
                toDate: "2020-05-02T00:00:00.000Z",
                roomId: roomId,
                userId: userId,
                pricePerDay: "222.22",
                totalPrice: "222.22"
            });

        // Assert:
        expect(result.status).toBe(200);
        expect(mongoose.Types.ObjectId.isValid(result.body)).toBe(true);

        const reservationId = parseObjectId(result.body);
        const reservation = await Reservation.findById(parseObjectId(reservationId));
        try {
            const reservationObj = reservation.toObject();
            expect(reservationObj.roomId).toStrictEqual(parseObjectId(roomId));
            expect(reservationObj.userId).toStrictEqual(parseObjectId(userId));
            expect(reservationObj.pricePerDay).toBe(222.22);
            expect(reservationObj.totalPrice).toBe(222.22);
            expect(reservationObj.fromDate).toStrictEqual(new Date('2020-05-02'));
            expect(reservationObj.toDate).toStrictEqual(new Date('2020-05-02'));
        } catch (error) {
            throw error;
        }
        finally {
            await reservation.remove();
        }
    });
});

describe('DELETE /reservation', () => {
    it('When auth token is not provided then error is returned', async () => {
        // Act:
        const result = await request.delete(`/reservation`)
            .send({ reservationId: "ANY" });

        // Assert:
        expect(result.status).toBe(401);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].includes('no/invalid refresh'));
    });

    it('When auth token belongs not to admin then error is returned', async () => {
        // Act:
        const result = await request.delete(`/reservation`)
            .set('Cookie', [`accessToken=${testUserAccessToken}`])
            .send({ reservationId: "ANY" });

        // Assert:
        expect(result.status).toBe(401);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].includes('Admin role required'));
    });

    it('When reservation id is invalid ObjectId then error is returned', async () => {
        // Act:
        const result = await request.delete(`/reservation`)
            .set('Cookie', [`accessToken=${testAdminAccessToken}`])
            .send({ reservationId: "INVALID" });

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].param).toBe('reservationId');
        expect(result.body.errors[0].msg.includes('invalid mongo ObjectId')).toBe(true);
    });

    it('When reservation with given id does not exist then null _id is returned', async () => {
        // Arrange: 
        const randomReservationId = '5eadb5bc0fcf46411b8b8570';

        // Act:
        const result = await request.delete(`/reservation`)
            .set('Cookie', [`accessToken=${testAdminAccessToken}`])
            .send({ reservationId: randomReservationId });

        // Assert:
        expect(result.status).toBe(200);
        expect(result.body.errors).toBeUndefined();
        expect(result.body._id).toBeNull();
    });

    it(`When reservation exists and can be deleted then it's deleted and its id is returned`, async () => {
        // Arrange:
        const reservationToRemoveId = '5eadb20560fdcfdd1dd4fc10';
        const reservationCopy = await Reservation.findById(
            parseObjectId(reservationToRemoveId));
        const reservationCopyObj = reservationCopy.toObject();
        if (!reservationCopy) throw Error('Unable to backup reservation to remove');

        // Act:
        const result = await request.delete(`/reservation`)
            .set('Cookie', [`accessToken=${testAdminAccessToken}`])
            .send({ reservationId: reservationToRemoveId });

        // Assert:
        try {
            expect(result.status).toBe(200);
            expect(result.body.errors).toBeUndefined();
            expect(result.body._id).toBe(reservationToRemoveId);
        } catch (error) {
            throw Error('Repopulation failed');
        } finally {
            await new Reservation(reservationCopyObj).save();
        }
    });
});

describe('GET /room/:roomId/reservations/accepted', () => {
    it('When some request values are invalid then errors are returned', async () => {
        // Arrange:
        const invalidRoomId = 'INVALID;'

        // Act:
        const result = await request.get(`/room/${invalidRoomId}/reservations/accepted`)
            .query({
                fromDate: 'INVALID',
                toDate: '2020-01-01T00:00:00.000Z'
            });

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(2);
        expect(result.body.errors[0].param).toBe('roomId');
        expect(result.body.errors[0].msg.includes('invalid mongo ObjectId'));
        expect(result.body.errors[1].param).toBe('fromDate');
        expect(result.body.errors[1].msg.includes('ISO8601'));
    });

    it('When room with given id does not exist then error is returned', async () => {
        // Arrange:
        const randomRoomId = '5eae8a183476c3f86337a179';

        // Act:
        const result = await request.get(`/room/${randomRoomId}/reservations/accepted`)
            .query({
                fromDate: '2020-01-01T00:00:00.000Z',
                toDate: '2020-01-01T00:00:00.000Z'
            });

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].param).toBe('roomId');
        expect(result.body.errors[0].msg.includes('room with given'));
    });

    it('When there are some accepted reservations on room and date interval then they are returned', async () => {
        // Arrange:
        const roomId = '5eae87863a9e88493afd0e58';

        // Act:
        const result = await request.get(`/room/${roomId}/reservations/accepted`)
            .query({
                fromDate: '2020-01-02T00:00:00.000Z',
                toDate: '2020-01-06T00:00:00.000Z'
            });

        // Assert:
        expect(result.status).toBe(200);
        expect(result.errors).toBeUndefined();
        expect(result.body).toHaveLength(2);
        expect(result.body.some(r => r._id == '5eae87f7e1d6c41dba3a76b0')).toBe(true);
        expect(result.body.some(r => r._id == '5eae87fef13c8a4a4302dcc6')).toBe(true);;
        expect(result.body.some(r => r._id == '5eae880504a5017179988635')).toBe(false);;
    });
});

afterAll(() => {
    mongoose.connection.close();
});