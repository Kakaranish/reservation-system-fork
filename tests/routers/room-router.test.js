import app from '../../src/app';
import supertest from 'supertest';
import mongoose from 'mongoose';
import path from "path";
import Room from '../../src/models/room-model';
import fs from 'fs';
import '../../src/common';

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

/*
    Room1: 5ea55125e95cc70df70870f7
    Reservations: 
    2020-04-03 - 2020-04-03
    2020-04-05 - 2020-04-30

    Room2: 5ea551627698ad8c1c5a4759
    Reservations: 
    2020-04-02 - 2020-04-04
    2020-04-06 - 2020-04-30
*/

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
        expect(result.body.errors[0].param).toBe("fromDate");
        expect(result.body.errors[0].msg.includes('ISO8601')).toBe(true);
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
        expect(result.body.errors[0].param).toBe("fromPrice");
        expect(result.body.errors[0].msg.includes('price')).toBe(true);
    });

    it('Date interval covers one day', async () => {
        // Act
        const result = await request.get('/rooms')
            .query({
                fromDate: "2020-04-04T00:00:00Z",
                toDate: "2020-04-04T00:00:00Z",
                fromPrice: "100",
                toPrice: "200"
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
                fromDate: "2020-04-01T00:00:00Z",
                toDate: "2020-04-02T00:00:00Z",
                fromPrice: 100,
                toPrice: 200
            });

        // Assert:
        expect(result.status).toBe(200);
        expect(result.body).toHaveLength(1);
        expect(result.body[0]._id).toBe("5ea55125e95cc70df70870f7")
    });

    it('Date interval covers contains whole one reservation', async () => {
        // Act
        const result = await request.get('/rooms')
            .query({
                fromDate: "2020-04-02T00:00:00Z",
                toDate: "2020-04-04T00:00:00Z",
                fromPrice: 100,
                toPrice: 200
            });

        // Assert:
        expect(result.status).toBe(200);
        expect(result.body).toHaveLength(0);
    });
});

describe('/rooms/:roomId', () => {
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
            .field('location', 'Some location')
            .field('capacity', '123')
            .field('pricePerDay', '22.22')
            .field('dows', JSON.stringify(["dowMonday", "dowTuesday", "dowSunday"]));

        // Assert:
        expect(result.body.errors).toHaveLength(2);
        expect(result.body.errors[0].param).toBe('name');
        expect(result.body.errors[0].msg.includes('length 3')).toBe(true);
        expect(result.body.errors[1].param).toBe('amenities');
        expect(result.body.errors[1].msg.includes('cannot be empty')).toBe(true);
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

    it('When user token provided and form is filled correctly then room is created', async () => {
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
            expect(result.status).toBe(200);
            expect(mongoose.Types.ObjectId.isValid(result.body.roomId)).toBe(true);
            expect.anything(result.body.photoUrl);
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

    it('When admin token provided and form is filled correctly then room is created', async () => {
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
            expect(result.status).toBe(200);
            expect(mongoose.Types.ObjectId.isValid(result.body.roomId)).toBe(true);
            expect.anything(result.body.photoUrl);
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