import app from '../../src/app';
import supertest from 'supertest';
import mongoose from 'mongoose';
import path from "path";
import Room from '../../src/models/room-model';
import fs from 'fs';
import '../../src/common';
const validateDows = require('../../src/routers/RoomRouter').validateDows;
const validateAmenities = require('../../src/routers/RoomRouter').validateAmenities;
const processRoomJson = require('../../src/routers/RoomRouter').processRoomJson;

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

describe('validateDows', () => {
    it('When dows are empty then error is returned', () => {
        // Arrange:
        const dowsStr = "[]";

        // Act:
        const result = validateDows(dowsStr);

        // Assert:
        expect(result.includes('non-empty')).toBe(true);
    });


    it('When dows are not parsable then error is returned', () => {
        // Arrange:
        const dowsStr = "ashjidhlkasd";

        // Act:
        const result = validateDows(dowsStr);

        // Assert:
        expect(result.includes(`'dows'`)).toBe(true);
    });

    it('When dows contains not valid dow then error is returned', () => {
        // Arrange:
        const dowsStr = '["dowMonday", "INVALID_VALUE", "dowFriday"]';

        // Act:
        const result = validateDows(dowsStr);

        // Assert:
        expect(result.includes(`illegal`)).toBe(true);
    });

    it('When dows are valid then no error is returned', () => {
        // Arrange:
        const dowsStr = '["dowMonday", "dowTuesday", "dowFriday"]';

        // Act:
        const result = validateDows(dowsStr);

        // Assert:
        expect(result).toBe(null);
    });
});

describe('processRoomJson', () => {
    it('When name and location are empty then errors are returned', () => {
        // Arrange:
        const roomJson = {
            capacity: "123",
            pricePerDay: "222.22",
            amenities: JSON.stringify(["amtTV", "amtProjector"]),
            dows: JSON.stringify(["dowMonday", "dowTuesday", "dowSunday"])
        };

        // Act:
        const result = processRoomJson(roomJson);

        // Assert:
        expect(result).toHaveLength(2);
        expect(result.some(x => x.includes(`'name'`))).toBe(true);
        expect(result.some(x => x.includes(`'location'`))).toBe(true);
    });

    it('When capacity is not int parsable then error is returned', () => {
        // Arrange:
        const roomJson = {
            name: "Some name",
            location: "Some location",
            capacity: "s123",
            pricePerDay: "222.22",
            amenities: JSON.stringify(["amtTV", "amtProjector"]),
            dows: JSON.stringify(["dowMonday", "dowTuesday", "dowSunday"])
        };

        // Act:
        const result = processRoomJson(roomJson);

        // Assert:
        expect(result).toHaveLength(1);
        expect(result[0].includes(`'capacity'`)).toBe(true);
    });

    it('When price is invalid then error is returned', () => {
        // Arrange:
        const roomJson = {
            name: "Some name",
            location: "Some location",
            capacity: "123",
            pricePerDay: "asdas",
            amenities: JSON.stringify(["amtTV", "amtProjector"]),
            dows: JSON.stringify(["dowMonday", "dowTuesday", "dowSunday"])
        };

        // Act:
        const result = processRoomJson(roomJson);

        // Assert:
        expect(result).toHaveLength(1);
        expect(result[0].includes(`'pricePerDay'`)).toBe(true);
    });

    it('When amenities are invalid then error is returned', () => {
        // Arrange:
        const roomJson = {
            name: "Some name",
            location: "Some location",
            capacity: "123",
            pricePerDay: "22.22",
            amenities: "INVALID",
            dows: JSON.stringify(["dowMonday", "dowTuesday", "dowSunday"])
        };

        // Act:
        const result = processRoomJson(roomJson);

        // Assert:
        expect(result).toHaveLength(1);
        expect(result[0].includes(`'amenities'`)).toBe(true);
    });


    it('When dows are invalid then error is returned', () => {
        // Arrange:
        const roomJson = {
            name: "Some name",
            location: "Some location",
            capacity: "123",
            pricePerDay: "22.22",
            amenities: JSON.stringify(["amtTV", "amtProjector"]),
            dows: "INVALID"
        };

        // Act:
        const result = processRoomJson(roomJson);

        // Assert:
        expect(result).toHaveLength(1);
        expect(result[0].includes(`'dows'`)).toBe(true);
    });

    it('When json is valid then no errors are returned', () => {
        // Arrange:
        const roomJson = {
            name: "Some name",
            location: "Some location",
            capacity: "123",
            pricePerDay: "22.22",
            amenities: JSON.stringify(["amtTV", "amtProjector"]),
            dows: JSON.stringify(["dowMonday", "dowTuesday", "dowSunday"])
        };

        // Act:
        const result = processRoomJson(roomJson);

        // Assert:
        expect(result).toHaveLength(0);
    });
});

describe('validateAmenities', () => {
    it('When amenities are empty then error is returned', () => {
        // Arrange:
        const amenitiesStr = "[]";

        // Act:
        const result = validateAmenities(amenitiesStr);

        // Assert:
        expect(result.includes('non-empty')).toBe(true);
    });


    it('When amenities are not parsable then error is returned', () => {
        // Arrange:
        const amenitiesStr = "ashjidhlkasd";

        // Act:
        const result = validateAmenities(amenitiesStr);

        // Assert:
        expect(result.includes(`'amenities'`)).toBe(true);
    });

    it('When amenities contains not valid amt then error is returned', () => {
        // Arrange:
        const amenitiesStr = '["amtTV", "INVALID_VALUE", "amtProjector"]';

        // Act:
        const result = validateAmenities(amenitiesStr);

        // Assert:
        expect(result.includes(`illegal`)).toBe(true);
    });

    it('When dows are valid then no error is returned', () => {
        // Arrange:
        const amenitiesStr = '["amtProjector", "amtTV", "amtPhone"]';

        // Act:
        const result = validateAmenities(amenitiesStr);

        // Assert:
        expect(result).toBe(null);
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

describe('/rooms/create', () => {
    it('When no token is provided then unathorized status is returned', async () => {
        ``
        // Act:
        const result = await request.post('/rooms/create');

        // Assert:
        expect(result.status).toBe(401);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].includes('Unauthorized')).toBe(true);
    });

    it('When header content-type is not multipart/form-data then error is returned', async () => {
        // Act:
        const result = await request.post('/rooms/create').query({
            secret_token: testUserToken
        });

        // Assert:
        expect(result.status).toBe(400);
    });

    it('When there is some error in body properties then errors are returned', async () => {
        // Act:
        const result = await request.post('/rooms/create')
            .query({
                secret_token: testUserToken
            })
            .type('form')
            .field('location', 'Some location')
            .field('capacity', '123')
            .field('pricePerDay', '22.22')
            .field('dows', JSON.stringify(["dowMonday", "dowTuesday", "dowSunday"]));

        // Assert:
        expect(result.body.errors).toHaveLength(2);
        expect(result.body.errors.some(x => x.includes(`'name'`)));
        expect(result.body.errors.some(x => x.includes(`'amenities'`)));
    });

    it('When file is not uploaded then error is returned', async () => {
        // Act:
        const result = await request.post('/rooms/create')
            .query({
                secret_token: testUserToken
            })
            .field('name', 'Some name')
            .field('location', 'Some location')
            .field('capacity', '123')
            .field('pricePerDay', '22.22')
            .field('amenities', JSON.stringify(["amtTV", "amtProjector"]))
            .field('dows', JSON.stringify(["dowMonday", "dowTuesday", "dowSunday"]));

        // Assert:
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].includes('file')).toBe(true);
    });

    it('When user token provided and form filled correctly then room is created', async () => {
        // Arrange:
        const cwd = path.resolve(__dirname, "..", "assets");

        // Act:
        const result = await request.post('/rooms/create')
            .query({
                secret_token: testUserToken
            })
            .field('name', 'Some name')
            .field('location', 'Some location')
            .field('capacity', '123')
            .field('pricePerDay', '22.22')
            .field('amenities', JSON.stringify(["amtTV", "amtProjector"]))
            .field('dows', JSON.stringify(["dowMonday", "dowTuesday", "dowSunday"]))
            .attach('file', `${cwd}/some-image.png`);

        // Assert:
        try {
            expect.anything(result.body.roomId);
            expect(result.body.photoUrl);
        }
        catch (error) {
            throw error;
        }
        finally {
            if (result.body.roomId) {
                await Room.deleteOne({ _id: result.body.roomId });
            }

            if (result.body.photoUrl) {
                const photoPath = path.resolve(__dirname, "..", "..", "client", "public")
                    + result.body.photoUrl;
                await fs.unlink(photoPath);
            }
        }
    });

    it('When admin token provided and form filled correctly then room is created', async () => {
        // Arrange:
        const cwd = path.resolve(__dirname, "..", "assets");

        // Act:
        const result = await request.post('/rooms/create')
            .query({
                secret_token: testAdminToken
            })
            .field('name', 'Some name')
            .field('location', 'Some location')
            .field('capacity', '123')
            .field('pricePerDay', '22.22')
            .field('amenities', JSON.stringify(["amtTV", "amtProjector"]))
            .field('dows', JSON.stringify(["dowMonday", "dowTuesday", "dowSunday"]))
            .attach('file', `${cwd}/some-image.png`);

        // Assert:
        try {
            expect.anything(result.body.roomId);
            expect(result.body.photoUrl);
        }
        catch (error) {
            throw error;
        }
        finally {
            if (result.body.roomId) {
                await Room.deleteOne({ _id: result.body.roomId });
            }

            if (result.body.photoUrl) {
                const photoPath = path.resolve(__dirname, "..", "..", "client", "public")
                    + result.body.photoUrl;
                await fs.unlink(photoPath);
            }
        }
    });
});

afterAll(() => {
    mongoose.connection.close();
});