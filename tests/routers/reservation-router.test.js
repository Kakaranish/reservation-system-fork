import app from '../../src/app';
import supertest from 'supertest';
import mongoose from 'mongoose';
import 'regenerator-runtime';
import Reservation from '../../src/models/reservation-model';
import * as TestUtils from '../test-utils';
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

describe('GET /reservations', () => {
    it('When fromDate or toDate is not provided then error is returned', async () => {
        // Act:
        const result = await request.get('/reservations')
            .query({ fromDate: '2020-01-01T00:00:00.000Z' });

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].param).toBe('toDate');
        expect(result.body.errors[0].msg.includes('ISO8601'));
    });

    it('When fromDate or toDate is not invalid then error is returned', async () => {
        // Act:
        const result = await request.get('/reservations')
            .query({
                fromDate: '2020-01-01T00:00:00.000Z',
                toDate: 'INVALID'
            });

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].param).toBe('toDate');
        expect(result.body.errors[0].msg.includes('ISO8601'));
    });

    it('When fromDate or toDate is not invalid then error is returned', async () => {
        // Act:
        const result = await request.get('/reservations')
            .query({
                fromDate: '2020-01-01T00:00:00.000Z',
                toDate: 'INVALID'
            });

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].param).toBe('toDate');
        expect(result.body.errors[0].msg.includes('ISO8601'));
    });

    it('When toDate precedes fromDate then error is returned', async () => {
        // Act:
        const result = await request.get('/reservations')
            .query({
                fromDate: '2020-01-02T00:00:00.000Z',
                toDate: '2020-01-01T00:00:00.000Z'
            });

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].param).toBe('toDate');
        expect(result.body.errors[0].msg.includes('illegal date interval'));
    });

    it('When roomId is provided but it is invalid then error is returned', async () => {
        // Act:
        const result = await request.get('/reservations')
            .query({
                fromDate: '2020-01-01T00:00:00.000Z',
                toDate: '2020-01-01T00:00:00.000Z',
                roomId: 'INVALID'
            });

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].param).toBe('roomId');
        expect(result.body.errors[0].msg.includes('mongo ObjectId'));
    });

    it('When status is provided but it is invalid then error is returned', async () => {
        // Act:
        const result = await request.get('/reservations')
            .query({
                fromDate: '2020-01-01T00:00:00.000Z',
                toDate: '2020-01-01T00:00:00.000Z',
                status: 'UNKNOWN_STATUS'
            });

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].param).toBe('status');
        expect(result.body.errors[0].msg.includes('illegal status'));
    });

    it('When room with given id does not exist then error is returned', async () => {
        // Arrange:
        const randomRoomId = '5eb4726265526d1ae4f5de6d';

        // Act:
        const result = await request.get(`/reservations`)
            .query({
                fromDate: '2020-01-01T00:00:00.000Z',
                toDate: '2020-01-01T00:00:00.000Z',
                roomId: randomRoomId
            });

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].param).toBe('roomId');
        expect(result.body.errors[0].msg.includes('room with given'));
    });

    it('When everything is ok and optional args are not provided then reservations are returned', async () => {
        // Act:
        const result = await request.get(`/reservations`)
            .query({
                fromDate: '2000-12-31T00:00:00.000Z',
                toDate: '2000-12-31T00:00:00.000Z',
            });

        // Assert:
        expect(result.status).toBe(200);
        expect(result.errors).toBeUndefined();
        expect(result.body).toHaveLength(1)
        expect(result.body.some(r => r._id == '5eb47148feac1f6e42ebf7f0')).toBe(true);
    });

    it('When everything is ok and roomId is provided then reservations are returned', async () => {
        // Arrange:
        const roomId = '5eae87863a9e88493afd0e58';

        // Act:
        const result = await request.get(`/reservations`)
            .query({
                fromDate: '2000-12-31T00:00:00.000Z',
                toDate: '2000-12-31T00:00:00.000Z',
                roomId: roomId
            });

        // Assert:
        expect(result.status).toBe(200);
        expect(result.errors).toBeUndefined();
        expect(result.body).toHaveLength(1)
        expect(result.body.some(r => r._id == '5eb47148feac1f6e42ebf7f0')).toBe(true);
    });

    it('When everything is ok and roomId and status are provided then reservations are returned', async () => {
        // Arrange:
        const roomId = '5eae87863a9e88493afd0e58';

        // Act:
        const result = await request.get(`/reservations`)
            .query({
                fromDate: '2020-01-02T00:00:00.000Z',
                toDate: '2020-01-06T00:00:00.000Z',
                roomId: roomId,
                status: 'ACCEPTED'
            });

        // Assert:
        expect(result.status).toBe(200);
        expect(result.errors).toBeUndefined();
        expect(result.body).toHaveLength(2);
        expect(result.body.some(r => r._id == '5eae87f7e1d6c41dba3a76b0')).toBe(true);
        expect(result.body.some(r => r._id == '5eae87fef13c8a4a4302dcc6')).toBe(true);
        expect(result.body.some(r => r._id == '5eae880504a5017179988635')).toBe(false);
    });
});

describe('GET /reservations/user/:id', () => {
    it('When access token is invalid or not provided then error is returned', async () => {
        // Arrange:
        const userId = 'ANY';

        // Act:
        const result = await request.get(`/reservations/user/${userId}`);

        // Assert:
        expect(result.status).toBe(401);
    });

    it('When user id is invalid or not provided then error is returned', async () => {
        // Arrange:
        const userId = 'INVALID';

        // Act:
        const result = await request.get(`/reservations/user/${userId}`)
            .set('Cookie', [`accessToken=${testUserAccessToken}`]);

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].param).toBe('id');
        expect(result.body.errors[0].msg.includes('mongo ObjectId')).toBe(true);
    });

    it('When user with given id does not exist then error is returned', async () => {
        // Arrange:
        const userId = '5eb47fcb0d5932db1fbe0d71';

        // Act:
        const result = await request.get(`/reservations/user/${userId}`)
            .set('Cookie', [`accessToken=${testUserAccessToken}`]);

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].param).toBe('id');
        expect(result.body.errors[0].msg.includes('user does not exist')).toBe(true);
    });

    it('When access token does not authorize user then 401 status is returned', async () => {
        // Arrange:
        const userId = '5ea5501566815162f73bad80';

        // Act:
        const result = await request.get(`/reservations/user/${userId}`)
            .set('Cookie', [`accessToken=${testUserAccessToken}`]);

        // Assert:
        expect(result.status).toBe(401);
    });

    it('When fromDate or toDate is invalid/not provided then error is returned', async () => {
        // Act:
        const result = await request.get(`/reservations/user/${userId}`)
            .set('Cookie', [`accessToken=${testUserAccessToken}`])
            .query({ fromDate: 'INVALID', toDate: '2020-01-01T00:00:00.000Z' });

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].param).toBe('fromDate');
        expect(result.body.errors[0].msg.includes('ISO8601')).toBe(true);
    });

    it('When toDate is provided and fromDate is not then error is returned', async () => {
        // Act:
        const result = await request.get(`/reservations/user/${userId}`)
            .set('Cookie', [`accessToken=${testUserAccessToken}`])
            .query({ fromDate: '2020-01-01T00:00:00.000Z', toDate: 'INVALID' });

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].param).toBe('toDate');
        expect(result.body.errors[0].msg.includes('ISO8601')).toBe(true);
    });

    it('When fromDate is provided and toDate is not then error is returned', async () => {
        // Act:
        const result = await request.get(`/reservations/user/${userId}`)
            .set('Cookie', [`accessToken=${testUserAccessToken}`])
            .query({ fromDate: '2020-01-01T00:00:00.000Z' });

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].includes('must be both')).toBe(true);
    });

    it('When toDate precedes fromDate is not then error is returned', async () => {
        // Act:
        const result = await request.get(`/reservations/user/${userId}`)
            .set('Cookie', [`accessToken=${testUserAccessToken}`])
            .query({ fromDate: '2020-01-02T00:00:00.000Z', toDate: '2020-01-01T00:00:00.000Z' });

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].param).toBe('toDate');
        expect(result.body.errors[0].msg.includes('fromDate must precede')).toBe(true);
    });

    it('When status is provided and its value is unknown then error is returned', async () => {
        // Act:
        const result = await request.get(`/reservations/user/${userId}`)
            .set('Cookie', [`accessToken=${testUserAccessToken}`])
            .query({ status: 'UNKNOWN_STATUS' });

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].param).toBe('status');
        expect(result.body.errors[0].msg.includes('illegal status')).toBe(true);
    });

    it('When everything is OK and date interval is provided then reservations are returned', async () => {

    });

    it('When everything is OK and status is provided then reservations are returned', async () => {

    });

    it('When everything is OK and date interval and status are provided then reservations are returned', async () => {

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

describe('DELETE /reservations/:id', () => {
    it('When auth token is not provided then error is returned', async () => {
        // Arrange:
        const reservationId = 'ANY';

        // Act:
        const result = await request.delete(`/reservations/${reservationId}`);

        // Assert:
        expect(result.status).toBe(401);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].includes('no/invalid refresh'));
    });

    it('When auth token belongs not to admin then error is returned', async () => {
        // Arrange:
        const reservationId = 'ANY';

        // Act:
        const result = await request.delete(`/reservations/${reservationId}`)
            .set('Cookie', [`accessToken=${testUserAccessToken}`]);

        // Assert:
        expect(result.status).toBe(401);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].includes('admin role required'));
    });

    it('When reservation id is invalid ObjectId then error is returned', async () => {
        // Arrange:
        const reservationId = 'INVALID';

        // Act:
        const result = await request.delete(`/reservations/${reservationId}`)
            .set('Cookie', [`accessToken=${testAdminAccessToken}`]);

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].param).toBe('id');
        expect(result.body.errors[0].msg.includes('invalid mongo ObjectId')).toBe(true);
    });

    it('When reservation with given id does not exist then null _id is returned', async () => {
        // Arrange: 
        const randomReservationId = '5eadb5bc0fcf46411b8b8570';

        // Act:
        const result = await request.delete(`/reservations/${randomReservationId}`)
            .set('Cookie', [`accessToken=${testAdminAccessToken}`]);

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
        const result = await request.delete(`/reservations/${reservationToRemoveId}`)
            .set('Cookie', [`accessToken=${testAdminAccessToken}`]);

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

afterAll(() => {
    mongoose.connection.close();
});