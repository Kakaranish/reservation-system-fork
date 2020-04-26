import app from '../src/app';
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

describe('Sample Test', () => {
    it('should test that true === true', () => {
        expect(true).toBe(true)
    })
})

describe('My first jest test', () => {
    it("Some test", async () => {
        const result = await request.get('/rooms/5ea551627698ad8c1c5a4759');

        console.log(result.body);
    });
});

afterAll(() => {
    mongoose.connection.close();
});