import app from '../../src/app';
import fs from 'fs';
import path from "path";
import supertest from 'supertest';
import mongoose from 'mongoose';
import * as TestUtils from '../test-utils';
import Room from '../../src/models/room-model';
import { connectTestDb } from '../../src/mongo-utils';
import '../../src/common';

const request = supertest(app);

beforeAll(async () => {
    await connectTestDb();
});

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

/*
    Room1: 5ea55125e95cc70df70870f7
    Reservations: 
    2010-01-03 - 2010-01-03
    2010-01-05 - 2010-01-30

    Room2: 5ea551627698ad8c1c5a4759
    Reservations: 
    2010-01-02 - 2010-01-04
    2010-01-06 - 2010-01-30
*/

describe('GET /rooms', () => {
    it('When one of dates is not iso then errors are returned in json', async () => {
        // Arrange:
        const invalidIsoDate = "01.01.2010";

        // Act:
        const result = await request.get('/rooms')
            .query({
                fromDate: invalidIsoDate,
                toDate: "2010-01-01T00:00:00Z",
                fromPrice: 100,
                toPrice: 200
            });

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].param).toBe('fromDate');
        expect(result.body.errors[0].msg.includes('ISO8601')).toBe(true);
    });

    it('When toDate precedes fromDate then error is returned', async () => {
        // Act:
        const result = await request.get('/rooms')
            .query({
                fromDate: '2010-01-02T00:00:00.000Z',
                toDate: '2010-01-01T00:00:00.000Z',
                fromPrice: 100,
                toPrice: 200
            });

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].param).toBe('fromDate&toDate');
        expect(result.body.errors[0].msg.includes('must precede')).toBe(true);
    });

    test.each([
        "not-number",
        -233,
        "123s.3213x21"
    ])('When one of prices is invalid  - %s', async price => {
        // Act:
        const result = await request.get('/rooms')
            .query({
                fromDate: '2010-01-01T00:00:00.000Z',
                toDate: '2010-01-01T00:00:00.000Z',
                fromPrice: price,
                toPrice: 200
            });

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].param).toBe('fromPrice');
        expect(result.body.errors[0].msg.includes('price')).toBe(true);
    });

    it('Date interval covers one day', async () => {
        // Act
        const result = await request.get('/rooms')
            .query({
                fromDate: "2010-01-04T00:00:00Z",
                toDate: "2010-01-04T00:00:00Z",
                fromPrice: "0",
                toPrice: "1000"
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
                fromDate: "2010-01-01T00:00:00Z",
                toDate: "2010-01-02T00:00:00Z",
                fromPrice: 0,
                toPrice: 1000
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
                fromDate: "2010-01-02T00:00:00Z",
                toDate: "2010-01-04T00:00:00Z",
                fromPrice: 100,
                toPrice: 200
            });

        // Assert:
        expect(result.status).toBe(200);
        expect(result.body).toHaveLength(0);
    });

    it('Date interval covers two days one reservation for one day and prices meetrequirements', async () => {
        // Act
        const result = await request.get('/rooms')
            .query({
                fromDate: "2010-01-01T00:00:00Z",
                toDate: "2010-01-02T00:00:00Z",
                fromPrice: 598,
                toPrice: 601
            });

        // Assert:
        expect(result.status).toBe(200);
        expect(result.body).toHaveLength(1);
        expect(result.body[0]._id).toBe("5ea55125e95cc70df70870f7")
    });

    it('Date interval covers two days one reservation for one day and price does not meet requirements', async () => {
        // Act
        const result = await request.get('/rooms')
            .query({
                fromDate: "2010-01-01T00:00:00Z",
                toDate: "2010-01-02T00:00:00Z",
                fromPrice: 601,
                toPrice: 602
            });

        // Assert:
        expect(result.status).toBe(200);
        expect(result.body).toHaveLength(0);
    });
});

describe('GET /rooms/with-phrase/:phrase', () => {
    it('When room contains phrase in name then some results are returned', async () => {
        // Arrange:
        const phrase = '5eb91a37ee66aecd968b46b3';

        // Act:
        const result = await request.get(`/rooms/with-phrase/${phrase}`);

        // Assert:
        expect(result.status).toBe(200);
        expect(result.body.errors).toBeUndefined();
        expect(result.body).toHaveLength(1);
        expect(result.body[0]._id).toBe('5eb91a37ee66aecd968b46b3');
    });

    it('When room contains phrase in location then some results are returned', async () => {
        // Arrange:
        const phrase = '5eb91a91b2f4ba915de68f5a';

        // Act:
        const result = await request.get(`/rooms/with-phrase/${phrase}`);

        // Assert:
        expect(result.status).toBe(200);
        expect(result.body.errors).toBeUndefined();
        expect(result.body).toHaveLength(1);
        expect(result.body[0]._id).toBe('5eb91a91b2f4ba915de68f5a');
    });

    it('When room contains phrase in description then some results are returned', async () => {
        // Arrange:
        const phrase = '5eb91ac8acc75b4e0ef2df9c';

        // Act:
        const result = await request.get(`/rooms/with-phrase/${phrase}`);

        // Assert:
        expect(result.status).toBe(200);
        expect(result.body.errors).toBeUndefined();
        expect(result.body).toHaveLength(1);
        expect(result.body[0]._id).toBe('5eb91ac8acc75b4e0ef2df9c');
    });
});

describe('GET /rooms/:roomId', () => {
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
        const anyRoomId = '5ea551627698ad8c1c5a4758';

        // Act:
        const result = await request.get(`/rooms/${anyRoomId}`);

        // Assert:
        expect(result.status).toBe(200);
        expect(result.body).toBe(null);
    });

    it('When room exists then it is returned', async () => {
        // Arrange:
        const roomId = '5eb57deb0af1b7089cecace3';

        // Act:
        const result = await request.get(`/rooms/${roomId}`);

        // Assert:
        expect(result.status).toBe(200);
        expect(result.body.errors).toBeUndefined();
        expect(result.body.name).toBe('Conference Room 5eb57deb0af1b7089cecace3');
        expect(result.body.location).toBe('Krakow');
        expect(result.body.capacity).toBe(20);
        expect(result.body.pricePerDay).toBe(300);
        expect(result.body.description).toBe('Some description 1');
        expect(result.body.photoUrl).toBe('/some/path');
        expect(result.body.amenities).toHaveLength(3);
        expect(result.body.dows).toHaveLength(5);
    });
});

describe('GET /rooms/:id/reservations-preview', () => {
    test.each([null, '', undefined])('When room id is invalid - %s - then error is returned', async id => {
        // Act:
        const result = await request.get(`/rooms/${id}/reservations-preview`);

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].param).toBe('id');
        expect(result.body.errors[0].msg.includes('mongo ObjectId')).toBe(true);
    });

    it('When there are accepted reservations then they are returned', async () => {
        // Arrange:
        const roomId = '5eb56bf24630ccf6ebcd8853';

        // Act:
        const result = await request.get(`/rooms/${roomId}/reservations-preview`);

        // Assert:
        expect(result.status).toBe(200);
        expect(result.body.errors).toBeUndefined();
        expect(result.body).toHaveLength(3);
        expect(result.body.some(r => r._id == '5eb56dd66537e93af7419ab7')).toBe(true);
        expect(result.body.some(r => r._id == '5eb56dfbb499cd1fe08ee942')).toBe(true);
        expect(result.body.some(r => r._id == '5eb56df6b5de2905eac47329')).toBe(false);
    });
});

describe('POST /rooms', () => {
    it('When no token is provided then unathorized status is returned', async () => {
        ``
        // Act:
        const result = await request.post('/rooms');

        // Assert:
        expect(result.status).toBe(401);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].includes('no/invalid refresh')).toBe(true);
    });

    it('When header content-type is not multipart/form-data then error is returned', async () => {
        // Act:
        const result = await request.post('/rooms')
            .set('Cookie', [`accessToken=${testUserAccessToken}`])

        // Assert:
        expect(result.status).toBe(400);
    });

    it('When there is some error in body properties then errors are returned', async () => {
        // Act:
        const result = await request.post('/rooms')
            .set('Cookie', [`accessToken=${testUserAccessToken}`])
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
        const result = await request.post('/rooms')
            .set('Cookie', [`accessToken=${testUserAccessToken}`])
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
        const result = await request.post('/rooms')
            .set('Cookie', [`accessToken=${testUserAccessToken}`])
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
                fs.unlink(photoPath, () => { });
            }
        }
    });

    it('When admin token provided and form is filled correctly then room is created', async () => {
        // Arrange:
        const cwd = path.resolve(__dirname, "..", "assets");

        // Act:
        const result = await request.post('/rooms')
            .set('Cookie', [`accessToken=${testAdminAccessToken}`])
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
                fs.unlink(photoPath, () => {});
            }
        }
    });
});

afterAll(() => {
    mongoose.connection.close();
});