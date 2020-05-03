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
        const result = await request.get('/user/reservations').query({
            status: "ACCEPTED"
        });

        // Assert:
        expect(result.status).toBe(401);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].includes('Unauthorized access')).toBe(true);
    });

    it('When no user token is in request then error is returned', async () => {
        // Act:
        const result = await request.get('/user/reservations').query({
            secret_token: testAdminToken,
            status: "ACCEPTED"
        });

        // Assert:
        expect(result.status).toBe(401);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].includes('User role required')).toBe(true);
    });

    it('When unknown status is in request then error is returned', async () => {
        // Act:
        const result = await request.get('/user/reservations').query({
            secret_token: testUserToken,
            status: "UNKNOWN_STATUS"
        });

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].param).toBe('status');
        expect(result.body.errors[0].msg.includes('illegal status')).toBe(true);
    });

    it('When user has some accepted reservations then they are returned', async () => {
        // Arrange:
        const userToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Il9pZCI6IjVlYWVkNmRiZTI5Y2YwN2E0Y2FmMjk5MyIsImVtYWlsIjoiNWVhZWQ2ZGJlMjljZjA3YTRjYWYyOTkzQG1haWwuY29tIiwicm9sZSI6IlVTRVIifSwiaWF0IjoxNTg4NTE3MDg0fQ.19pcUsDbPGhNcBgHkE2e0_4f4JkULHnAv-ohEN_ulGg';

        // Act:
        const result = await request.get('/user/reservations').query({
            secret_token: userToken,
            status: "ACCEPTED"
        });

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
        const userToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Il9pZCI6IjVlYWVkNmRiZTI5Y2YwN2E0Y2FmMjk5MyIsImVtYWlsIjoiNWVhZWQ2ZGJlMjljZjA3YTRjYWYyOTkzQG1haWwuY29tIiwicm9sZSI6IlVTRVIifSwiaWF0IjoxNTg4NTE3MDg0fQ.19pcUsDbPGhNcBgHkE2e0_4f4JkULHnAv-ohEN_ulGg';

        // Act:
        const result = await request.get('/user/reservations').query({
            secret_token: userToken,
            status: "REJECTED"
        });

        // Assert:
        expect(result.status).toBe(200);
        expect(result.body).toHaveLength(1);
        expect(result.body.some(x => x._id == parseObjectId('5eaed75c69523d30e9fd8c32'))).toBe(true);
    });

    it('When user has no cancelled reservations then empty array is returned', async () => {
        // Arrange:
        const userToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Il9pZCI6IjVlYWVkNmRiZTI5Y2YwN2E0Y2FmMjk5MyIsImVtYWlsIjoiNWVhZWQ2ZGJlMjljZjA3YTRjYWYyOTkzQG1haWwuY29tIiwicm9sZSI6IlVTRVIifSwiaWF0IjoxNTg4NTE3MDg0fQ.19pcUsDbPGhNcBgHkE2e0_4f4JkULHnAv-ohEN_ulGg';

        // Act:
        const result = await request.get('/user/reservations').query({
            secret_token: userToken,
            status: "CANCELLED"
        });

        // Assert:
        expect(result.status).toBe(200);
        expect(result.body).toHaveLength(0);
    });
});

afterAll(() => {
    mongoose.connection.close();
});