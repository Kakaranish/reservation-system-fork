import app from '../../src/app';
import supertest from 'supertest';
import mongoose from 'mongoose';
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

beforeAll(async () => {
    await connectTestDb();
});

describe('GET /reservations', () => {
    it('When no auth token is in request then error is returned', async () => {
        // Act:
        const result = await request.get('/admin/reservations').query({
            status: 'ACCEPTED'
        });

        // Assert:
        expect(result.status).toBe(401);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].includes('no/invalid refresh')).toBe(true);
    });

    it('When no admin token is in request then error is returned', async () => {
        // Act:
        const result = await request.get('/admin/reservations')
            .set('Cookie', [`accessToken=${testUserAccessToken}`])
            .query({ status: 'ACCEPTED' });

        // Assert:
        expect(result.status).toBe(401);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].includes('admin role required')).toBe(true);
    });

    it('When unknown status is in request then error is returned', async () => {
        // Act:
        const result = await request.get('/admin/reservations')
            .set('Cookie', [`accessToken=${testAdminAccessToken}`])
            .query({ status: "UNKNOWN_STATUS" });

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].param).toBe('status');
        expect(result.body.errors[0].msg.includes('illegal status')).toBe(true);
    });

    it('When there is no date interval provided then all accepted reservations are returned', async () => {
        // Act:
        const result = await request.get('/admin/reservations')
            .set('Cookie', [`accessToken=${testAdminAccessToken}`])
            .query({ status: 'ACCEPTED' });

        // Assert:
        expect(result.status).toBe(200);
        expect(result.body.errors).toBeUndefined();
        expect(result.body.length).toBeGreaterThan(2);
        expect(result.body.some(r => r._id == parseObjectId('5eaee6b01808121f3ca90884'))).toBe(true);
    });

    it('When there is invalid date interval in request then all accepted reservations are returned', async () => {
        // Act:
        const result = await request.get('/admin/reservations')
            .set('Cookie', [`accessToken=${testAdminAccessToken}`])
            .query({
                status: 'ACCEPTED',
                fromDate: 'INVALID',
                toDate: '2019-01-30T00:00:00.000Z'
            });

        // Assert:
        expect(result.status).toBe(200);
        expect(result.body.errors).toBeUndefined();
        expect(result.body.length).toBeGreaterThan(2);
        expect(result.body.some(r => r._id == parseObjectId('5eaee6b01808121f3ca90884'))).toBe(true);
    });

    it('When there are some accepted reservations for date interval then they are returned', async () => {
        // Act:
        const result = await request.get('/admin/reservations')
            .set('Cookie', [`accessToken=${testAdminAccessToken}`])
            .query({
                status: 'ACCEPTED',
                fromDate: '2019-01-01T00:00:00.000Z',
                toDate: '2019-01-30T00:00:00.000Z'
            });

        // Assert:
        expect(result.status).toBe(200);
        expect(result.body).toHaveLength(2);
        expect(result.body.some(x => x._id == parseObjectId('5eaee6b6f43ee9c80fddca0f'))).toBe(true);
        expect(result.body.some(x => x._id == parseObjectId('5eaee6b01808121f3ca90884'))).toBe(true);
    });

    it('When there are some rejected reservations for date interval then they are returned', async () => {
        // Act:
        const result = await request.get('/admin/reservations')
            .set('Cookie', [`accessToken=${testAdminAccessToken}`])
            .query({
                status: 'REJECTED',
                fromDate: '2019-01-01T00:00:00.000Z',
                toDate: '2019-01-30T00:00:00.000Z'
            });

        // Assert:
        expect(result.status).toBe(200);
        expect(result.body).toHaveLength(1);
        expect(result.body[0]._id == parseObjectId('5eaee6ad3b1c7302153d59a0')).toBe(true);
    });
});

afterAll(() => {
    mongoose.connection.close();
});