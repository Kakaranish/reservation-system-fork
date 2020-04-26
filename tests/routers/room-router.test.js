import app from '../../src/app';
import mongoose from 'mongoose';
const preparePrice = require('../../src/routers/RoomRouter').preparePrice;

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

describe('preparePrice', () => {
    it('When price is string without digits then null is returned', () => {
        // Arrange:
        const price = "not-number";
        
        // Act:
        const result = preparePrice(price);

        // Assert:
        expect(result).toBe(null);
    });

    it('When price is negative number then null is returned', () => {
        // Arrange:
        const price = -12;
        
        // Act:
        const result = preparePrice(price);

        // Assert:
        expect(result).toBe(null);
    });
 
    it('When price is string and does not match regex then null is returned', () => {
        // Arrange:
        const price = "s123.22s";
        
        // Act:
        const result = preparePrice(price);

        // Assert:
        expect(result).toBe(null);
    });

    it('When price is string and do match regex then price is returned', () => {
        // Arrange:
        const price = "123.22";
        
        // Act:
        const result = preparePrice(price);

        // Assert:
        expect(result).toBe(123.22);
    });

    it('When price is number then price is returned', () => {
        // Arrange:
        const price = 21.3;
        
        // Act:
        const result = preparePrice(price);

        // Assert:
        expect(result).toBe(21.3);
    });
});

describe('/rooms', () => {
    it('When one of dates is not iso then errors are returned in json', async () => {
        // Arrange:
        const invalidIsoDate = "01.02.2020";

        // Act:
        const result = await request.get('/rooms')
            .query({
                fromDate: invalidIsoDate,
                toDate: "2020-04-16T00:00:00Z",
                fromPrice: 100,
                toPrice: 200
            });

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].includes('fromDate')).toBe(true);
    });


    test.each([
        "not-number",
        -233,
        "123s.3213x21"
    ])('When one of prices is invalid  - %s', async price => {
        // Act:
        const result = await request.get('/rooms')
            .query({
                fromDate: "2020-04-16T00:00:00Z",
                toDate: "2020-04-16T00:00:00Z",
                fromPrice: price,
                toPrice: 200
            });

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].includes('fromPrice')).toBe(true);
    });

    it('Date interval covers one day', async () => {
        // Act
        const result = await request.get('/rooms')
            .query({
                fromDate: "2020-04-16T00:00:00Z",
                toDate: "2020-04-16T00:00:00Z",
                fromPrice: 100,
                toPrice: 200
            });

        // Assert:
        expect(result.status).toBe(200);
        expect(result.body).toHaveLength(1);
        console.log(result.body);
        expect(result.body[0]._id).toBe("5ea55125e95cc70df70870f7")
    });

    it('Date interval covers two days and intersects one reservation for one day', async () => {
        // Act
        const result = await request.get('/rooms')
            .query({
                fromDate: "2020-04-13T00:00:00Z",
                toDate: "2020-04-14T00:00:00Z",
                fromPrice: 100,
                toPrice: 200
            });

        // Assert:
        expect(result.status).toBe(200);
        expect(result.body).toHaveLength(1);
        expect(result.body[0]._id).toBe("5ea551627698ad8c1c5a4759")
    });

    it('Date interval covers contains whole one reservation', async () => {
        // Act
        const result = await request.get('/rooms')
            .query({
                fromDate: "2020-04-13T00:00:00Z",
                toDate: "2020-04-15T00:00:00Z",
                fromPrice: 100,
                toPrice: 200
            });

        // Assert:
        expect(result.status).toBe(200);
        expect(result.body).toHaveLength(1);
        expect(result.body[0]._id).toBe("5ea551627698ad8c1c5a4759")
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