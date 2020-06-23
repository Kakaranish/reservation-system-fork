import app from '../../src/app';
import supertest from 'supertest';
import mongoose from 'mongoose';
import 'regenerator-runtime';
import Reservation from '../../src/models/reservation-model';
import * as TestUtils from '../test-utils';
import { parseObjectId, parseIsoDatetime } from '../../src/common';
import { connectTestDb } from '../../src/mongo-utils';
import moment from 'moment';

const request = supertest(app);

let testUserAccessToken = TestUtils.createTestAccessToken({
    _id: '5ea54fe32d431462827c2c5e',
    email: 'user@mail.com',
    role: 'USER'
}, 3600 * 1000);

let testAdminAccessToken = TestUtils.createTestAccessToken({
    _id: '5ea5501566815162f73bad80',
    email: 'admin@mail.com',
    role: 'ADMIN'
}, 3600 * 1000);

const userId = '5ea54fe32d431462827c2c5e';

beforeAll(async () => {
    await connectTestDb();
});


describe('GET /reservations', () => {
    it('When no access token is provided then error is returned', async () => {
        // Act:
        const result = await request.get('/reservations');

        // Assert:
        expect(result.status).toBe(401);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].includes('no/invalid refresh'));
    });

    it('When access token other than for admin is provided then error is returned', async () => {
        // Act:
        const result = await request.get('/reservations')
            .set('Cookie', [`accessToken=${testUserAccessToken}`]);

        // Assert:
        expect(result.status).toBe(401);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].includes('admin role required'));
    });

    it('When fromDate or toDate is not provided then error is returned', async () => {
        // Act:
        const result = await request.get('/reservations')
            .query({ fromDate: '2020-01-01T00:00:00.000Z' })
            .set('Cookie', [`accessToken=${testAdminAccessToken}`]);

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].param).toBe('toDate');
        expect(result.body.errors[0].msg.includes('ISO8601'));
    });

    it('When fromDate or toDate is not valid then error is returned', async () => {
        // Act:
        const result = await request.get('/reservations')
            .set('Cookie', [`accessToken=${testAdminAccessToken}`])
            .query({
                fromDate: '2020-01-01T00:00:00.000Z',
                toDate: 'INVALID'
            })

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].param).toBe('toDate');
        expect(result.body.errors[0].msg.includes('ISO8601'));
    });

    it('When toDate precedes fromDate then error is returned', async () => {
        // Act:
        const result = await request.get('/reservations')
            .set('Cookie', [`accessToken=${testAdminAccessToken}`])
            .query({
                fromDate: '2020-01-02T00:00:00.000Z',
                toDate: '2020-01-01T00:00:00.000Z'
            });

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].param).toBe('fromDate&toDate');
        expect(result.body.errors[0].msg.includes('must precede'));
    });

    it('When roomId is provided but it is invalid then error is returned', async () => {
        // Act:
        const result = await request.get('/reservations')
            .set('Cookie', [`accessToken=${testAdminAccessToken}`])
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
            .set('Cookie', [`accessToken=${testAdminAccessToken}`])
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
            .set('Cookie', [`accessToken=${testAdminAccessToken}`])
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
            .set('Cookie', [`accessToken=${testAdminAccessToken}`])
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
            .set('Cookie', [`accessToken=${testAdminAccessToken}`])
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
            .set('Cookie', [`accessToken=${testAdminAccessToken}`])
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

describe('GET /reservations/user', () => {
    it('When access token is invalid or not provided then error is returned', async () => {
        // Act:
        const result = await request.get(`/reservations/user`);

        // Assert:
        expect(result.status).toBe(401);
    });

    it('When user included in token does not exist then error is returned', async () => {
        // Arrange:
        const anyUser = {
            _id: '5eb55361e136a40e06caafd4', // any
            email: 'anyuser@mail.com',
            role: 'USER'
        };
        const anyUserToken = TestUtils.createTestAccessToken(anyUser, 60 * 1000);

        // Act:
        const result = await request.get(`/reservations/user`)
            .set('Cookie', [`accessToken=${anyUserToken}`]);

        // Assert:
        expect(result.status).toBe(401);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].param).toBe('token');
        expect(result.body.errors[0].msg.includes('user does not exist')).toBe(true);
    });

    test.each([undefined, ''])('When fromDate or toDate is invalid/not - %s - provided then error is returned', async fromDate => {
        // Act:
        const result = await request.get(`/reservations/user`)
            .set('Cookie', [`accessToken=${testUserAccessToken}`])
            .query({ fromDate: fromDate, toDate: '2020-01-01T00:00:00.000Z' });

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].param).toBe('fromDate');
        expect(result.body.errors[0].msg.includes('ISO8601')).toBe(true);
    });

    it('When toDate precedes fromDate is not then error is returned', async () => {
        // Act:
        const result = await request.get(`/reservations/user`)
            .set('Cookie', [`accessToken=${testUserAccessToken}`])
            .query({ fromDate: '2020-01-02T00:00:00.000Z', toDate: '2020-01-01T00:00:00.000Z' });

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].param).toBe('fromDate&toDate');
        expect(result.body.errors[0].msg.includes('fromDate must precede')).toBe(true);
    });

    it('When status is provided and its value is unknown then error is returned', async () => {
        // Act:
        const result = await request.get(`/reservations/user`)
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

describe('GET /reservations/:id/user', () => {
    it('When no/invalid token is provided then error is returned', async () => {
        // Arrange:
        const randomReservationId = '5eb86e1e0095f3b081fb2279';

        // Act:
        const result = await request.get(`/reservations/${randomReservationId}/user`);

        // Assert:
        expect(result.status).toBe(401);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].includes('no/invalid refresh'));
    });

    it('When reservation id is invalid then error is returned', async () => {
        // Arrange:
        const reservationId = 'INVNALID';

        // Act:
        const result = await request.get(`/reservations/${reservationId}/user`)
            .set('Cookie', [`accessToken=${testUserAccessToken}`]);

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].param).toBe('id');
        expect(result.body.errors[0].msg.includes('mongo ObjectId')).toBe(true);
    });

    it('When reservation with given id does not exist then null is returned', async () => {
        // Arrange:
        const randomReservationId = '5eb86e1e0095f3b081fb2279';

        // Act:
        const result = await request.get(`/reservations/${randomReservationId}/user`)
            .set('Cookie', [`accessToken=${testUserAccessToken}`]);

        // Assert:
        expect(result.status).toBe(200);
        expect(result.body).toBe(null);
    });

    it('When reservation userId is different than token userId then null is returned', async () => {
        // Arrange:
        const reservationId = '5eb86e1e0095f3b081fb2279';
        const nonExistingUser = {
            _id: '5eb87150bddf948ccb9b0a02',
            email: 'nonexisting@mail.com',
            role: 'USER'
        };
        const accessToken = TestUtils.createTestAccessToken(nonExistingUser, 60 * 1000);

        // Act:
        const result = await request.get(`/reservations/${reservationId}/user`)
            .set('Cookie', [`accessToken=${accessToken}`]);

        // Assert:
        expect(result.status).toBe(200);
        expect(result.body).toBe(null);
    });

    it('When everything is ok then reservation is returned', async () => {
        // Arrange:
        const reservationId = '5eb870bcc32e3d4b7cb8af1c';

        // Act:
        const result = await request.get(`/reservations/${reservationId}/user`)
            .set('Cookie', [`accessToken=${testUserAccessToken}`]);


        // Assert:
        expect(result.status).toBe(200);
        expect(result.body._id).toBe('5eb870bcc32e3d4b7cb8af1c');
    });
});

describe('PUT /reservations/:id/user', () => {
    it('When auth token is invalid or not provided then error is returned', async () => {
        // Arrange:
        const randomReservationId = '5eb86e1e0095f3b081fb2279';

        // Act:
        const result = await request.put(`/reservations/${randomReservationId}/user`);

        // Assert:
        expect(result.status).toBe(401);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].includes('no/invalid refresh'));
    });

    it('When reservation id is invalid/not provided then error is returned', async () => {
        // Arrange:
        const invalidReservationId = 'INVALID';

        // Act:
        const result = await request.put(`/reservations/${invalidReservationId}/user`)
            .send({
                fromDate: '2020-01-01T00:00:00.000Z',
                toDate: '2020-01-01T00:00:00.000Z'
            })
            .set('Cookie', [`accessToken=${testUserAccessToken}`]);

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].param).toBe('id');
        expect(result.body.errors[0].msg.includes('mongo ObjectId')).toBe(true);
    });

    it('When reservation with given id does not exist then error is returned', async () => {
        // Arrange:
        const randomReservationId = '5eb87407271a7e8139246020';

        // Act:
        const result = await request.put(`/reservations/${randomReservationId}/user`)
            .send({
                fromDate: '2020-01-01T00:00:00.000Z',
                toDate: '2020-01-01T00:00:00.000Z'
            })
            .set('Cookie', [`accessToken=${testUserAccessToken}`]);

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].param).toBe('id');
        expect(result.body.errors[0].msg.includes('with given id does not exist')).toBe(true);
    });

    it('When reservation has state different than PENDING and ACCEPTED then error is returned', async () => {
        // Arrange:
        const reservationId = '5eb8793a6cd93061c15e263d';

        // Act:
        const result = await request.put(`/reservations/${reservationId}/user`)
            .send({
                fromDate: '2020-01-01T00:00:00.000Z',
                toDate: '2020-01-01T00:00:00.000Z'
            })
            .set('Cookie', [`accessToken=${testUserAccessToken}`]);

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].param).toBe('id');
        expect(result.body.errors[0].msg.includes('has illegal status')).toBe(true);
    });

    it('When reservation userId is diffrent than token userId then error is returned', async () => {
        // Arrange:
        const reservationId = '5eb8795ea7644880b7c215ad';
        const anyUser = {
            _id: '5eb879e28717ea91b6f7a09f',
            user: 'nonexisting@mail.com',
            role: 'USER'
        };
        const accessToken = TestUtils.createTestAccessToken(anyUser, 60 * 1000);

        // Act:
        const result = await request.put(`/reservations/${reservationId}/user`)
            .send({
                fromDate: '2020-01-01T00:00:00.000Z',
                toDate: '2020-01-01T00:00:00.000Z'
            })
            .set('Cookie', [`accessToken=${accessToken}`]);

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].param).toBe('id');
        expect(result.body.errors[0].msg.includes('to token bearer')).toBe(true);
    });

    it('When date interval is invalid then error is returned', async () => {
        // Arrange:
        const reservationId = '5eb8795ea7644880b7c215ad';

        // Act:
        const result = await request.put(`/reservations/${reservationId}/user`)
            .send({
                fromDate: '2020-01-02T00:00:00.000Z',
                toDate: '2020-01-01T00:00:00.000Z'
            })
            .set('Cookie', [`accessToken=${testUserAccessToken}`]);

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].param).toBe('fromDate&toDate');
        expect(result.body.errors[0].msg.includes('must precede')).toBe(true);
    });

    it('When everything is ok then reservation is updated and reservation _id is returned', async () => {
        // Arrange:
        const reservationId = '5eb8795ea7644880b7c215ad';
        const reservationBackup = (await Reservation.findById(reservationId)).toObject();

        try {
            // Act:
            const result = await request.put(`/reservations/${reservationId}/user`)
                .send({
                    fromDate: '2020-03-02T00:00:00.000Z',
                    toDate: '2020-03-05T00:00:00.000Z'
                })
                .set('Cookie', [`accessToken=${testUserAccessToken}`]);

            // Assert:
            expect(result.status).toBe(200);
            expect(result.body._id).toBe(reservationId);
            const reservation = await Reservation.findById(reservationId);
            expect(moment(reservation.fromDate).toISOString()).toBe('2020-03-02T00:00:00.000Z');
            expect(moment(reservation.toDate).toISOString()).toBe('2020-03-05T00:00:00.000Z');
            expect(reservation.status).toBe('PENDING');
            expect(reservation.pricePerDay).toBe(400);
            expect(reservation.totalPrice).toBe(1600);
        } catch (error) {
            throw error;
        } finally {
            await Reservation.findByIdAndUpdate(reservationId, reservationBackup);
        }
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
                pricePerDay: "222.22",
                totalPrice: "222.22"
            });

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(2);
        expect(result.body.errors[0].param).toBe('roomId');
        expect(result.body.errors[0].msg.includes('mongo ObjectId')).toBe(true);
        expect(result.body.errors[1].param).toBe('toDate');
        expect(result.body.errors[1].msg.includes('ISO8601')).toBe(true);
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