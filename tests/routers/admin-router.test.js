import app from '../../src/app';
import supertest from 'supertest';
import mongoose from 'mongoose';
import { parseObjectId } from '../../src/common';

const request = supertest(app);
const testUserToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Il9pZCI6IjVlYTU0ZmUzMmQ0MzE0NjI4MjdjMmM1ZSIsImVtYWlsIjoidXNlckBtYWlsLmNvbSIsInJvbGUiOiJVU0VSIn0sImlhdCI6MTU4NzkxMTM4NX0.tPN6wyONN11o7fiY0Wptf-_SGAgynaqT_dKW5UUO9kI';
const testAdminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Il9pZCI6IjVlYTU1MDE1NjY4MTUxNjJmNzNiYWQ4MCIsImVtYWlsIjoiYWRtaW5AbWFpbC5jb20iLCJyb2xlIjoiQURNSU4ifSwiaWF0IjoxNTg3OTExNDA3fQ.pMoZZUYhgkiVKPhsT-uVO8n9FWEdiG4JrIJjSDcnX3g';

beforeAll(() => {
    mongoose.connect(process.env.MONGO_LOCAL_URI, {
        dbName: process.env.DB_NAME_TEST,
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
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
        expect(result.body.errors[0].includes('Unauthorized access')).toBe(true);
    });

    it('When no admin token is in request then error is returned', async () => {
        // Act:
        const result = await request.get('/admin/reservations').query({
            secret_token: testUserToken,
            status: 'ACCEPTED'
        });

        // Assert:
        expect(result.status).toBe(401);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].includes('Admin role required')).toBe(true);
    });

    it('When unknown status is in request then error is returned', async () => {
        // Act:
        const result = await request.get('/admin/reservations').query({
            secret_token: testAdminToken,
            status: "UNKNOWN_STATUS"
        });

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].param).toBe('status');
        expect(result.body.errors[0].msg.includes('illegal status')).toBe(true);
    });

    it('When there is no date interval provided then all accepted reservations are returned', async () => {
        // Act:
        const result = await request.get('/admin/reservations').query({
            secret_token: testAdminToken,
            status: 'ACCEPTED'
        });

        // Assert:
        expect(result.status).toBe(200);
        expect(result.body.errors).toBeUndefined();
        expect(result.body.length).toBeGreaterThan(2);
        expect(result.body.some(r => r._id == parseObjectId('5eaee6b01808121f3ca90884'))).toBe(true);
    });

    it('When there is invalid date interval in request then all accepted reservations are returned', async () => {
        // Act:
        const result = await request.get('/admin/reservations').query({
            secret_token: testAdminToken,
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
        const result = await request.get('/admin/reservations').query({
            secret_token: testAdminToken,
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
        const result = await request.get('/admin/reservations').query({
            secret_token: testAdminToken,
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