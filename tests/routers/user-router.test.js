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
        const result = await request.get('/user/reservations').query({
            status: "ACCEPTED"
        });

        // Assert:
        expect(result.status).toBe(401);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].includes('no/invalid refresh')).toBe(true);
    });

    it('When no user token is in request then error is returned', async () => {
        // Act:
        const result = await request.get('/user/reservations')
            .set('Cookie', [`accessToken=${testAdminAccessToken}`])
            .query({ status: "ACCEPTED" });

        // Assert:
        expect(result.status).toBe(401);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].includes('user role required')).toBe(true);
    });

    it('When unknown status is in request then error is returned', async () => {
        // Act:
        const result = await request.get('/user/reservations')
            .set('Cookie', [`accessToken=${testUserAccessToken}`])
            .query({ status: "UNKNOWN_STATUS" });

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].param).toBe('status');
        expect(result.body.errors[0].msg.includes('illegal status')).toBe(true);
    });

    it('When user has some accepted reservations then they are returned', async () => {
        // Arrange:
        const user = {
            _id: '5eaed6dbe29cf07a4caf2993',
            email: '5eaed6dbe29cf07a4caf2993@mail.com',
            role: 'USER'
        };
        const token = TestUtils.createTestAccessToken(user, 3600);

        // Act:
        const result = await request.get('/user/reservations')
            .set('Cookie', [`accessToken=${token}`])
            .query({ status: "ACCEPTED" });

        // Assert:
        expect(result.status).toBe(200);
        expect(result.body).toHaveLength(4);
        expect(result.body.some(x => x._id == parseObjectId('5eaed7106c51add6137165bf'))).toBe(true);
        expect(result.body.some(x => x._id == parseObjectId('5eaed71f226ebfcca1ffe3d2'))).toBe(true);
        expect(result.body.some(x => x._id == parseObjectId('5eaed969c8c9d41e955920c0'))).toBe(true);
        expect(result.body.some(x => x._id == parseObjectId('5eaedda00c360c503ef1831e'))).toBe(true);
    });

    it('When user has some rejected reservations then they are returned', async () => {
        // Arrange:
        const user = {
            _id: '5eaed6dbe29cf07a4caf2993',
            email: '5eaed6dbe29cf07a4caf2993@mail.com',
            role: 'USER'
        };
        const token = TestUtils.createTestAccessToken(user, 3600);

        // Act:
        const result = await request.get('/user/reservations')
            .set('Cookie', [`accessToken=${token}`])
            .query({ status: "REJECTED" });

        // Assert:
        expect(result.status).toBe(200);
        expect(result.body).toHaveLength(1);
        expect(result.body.some(x => x._id == parseObjectId('5eaed75c69523d30e9fd8c32'))).toBe(true);
    });

    it('When user has no cancelled reservations then empty array is returned', async () => {
        // Arrange:
        const user = {
            _id: '5eaed6dbe29cf07a4caf2993',
            email: '5eaed6dbe29cf07a4caf2993@mail.com',
            role: 'USER'
        };
        const token = TestUtils.createTestAccessToken(user, 3600);

        // Act:
        const result = await request.get('/user/reservations')
            .set('Cookie', [`accessToken=${token}`])
            .query({ status: "CANCELLED" });

        // Assert:
        expect(result.status).toBe(200);
        expect(result.body).toHaveLength(0);
    });
});

afterAll(() => {
    mongoose.connection.close();
}); 