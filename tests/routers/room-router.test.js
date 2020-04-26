import app from '../../src/app';
import mongoose from 'mongoose';

require('dotenv').config();
const supertest = require('supertest');
const request = supertest(app);

beforeAll(() => {
    mongoose.connect(process.env.MONGO_LOCAL_URI, {
        dbName: process.env.TEST_DB_NAME,
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
});

describe('/rooms/:roomId', () => {
    it("When room exists then it's returned", async () => {
        // Arrange:
        const roomId = '5ea551627698ad8c1c5a4759';

        // Act:
        const result = await request.get(`/rooms/${roomId}`);

        // Assert:
        expect(result.status).toBe(200);
        expect(result.body.message).toBe(undefined);
        expect(result.body.name).toBe('Conference Room #2');
        expect(result.body.location).toBe('Warsaw');
        expect(result.body.capacity).toBe(10);
        expect(result.body.pricePerDay).toBe(400.99);
        expect(result.body.description).toBe('Some description 2');
        expect(result.body.photoUrl).toBe('/some/path2');
        expect(result.body.amenities).toHaveLength(4);
        expect(result.body.dows).toHaveLength(3);
    });

    it("When roomId is invalid ObjectId then error list is returned", async () => {
        // Arrange:
        const roomId = '123';

        // Act:
        const result = await request.get(`/rooms/${roomId}`);

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
    });

    it("When room does not exist empty json is returned", async () => {
        // Arrange:
        const roomId = '5ea551627698ad8c1c5a4758';

        // Act:
        const result = await request.get(`/rooms/${roomId}`);

        // Assert:
        expect(result.status).toBe(200);
        expect(result.body).toBe(null);
    });
});

afterAll(() => {
    mongoose.connection.close();
});