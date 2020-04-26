import app from '../../src/app';
import supertest from 'supertest';
import mongoose from 'mongoose';
import 'regenerator-runtime';
const parseIsoDatetime = require('../../src/common').parseIsoDatetime;
const parseObjectId = require('../../src/common').parseObjectId;
const prepareReservation = require('../../src/routers/ReservationsRouter').prepareReservation;
const validateReservation = require('../../src/routers/ReservationsRouter').validateReservation;

require('dotenv').config();
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

describe('prepareReservation', () => {
    it('Preparing reservation always returns valid result', () => {
        // Arrange: 
        const request = {
            body: {
                fromDate: '2020-04-15T20:00:00Z',
                toDate: '2020-04-15T20:00:00Z',
                userId: '5ea5dae40d4ecf0afbd84dc9',
                roomId: '5ea5daff8eba612e9374625d',
                pricePerDay: '22.22',
                totalPrice: '22.22'
            }
        };

        // Act:
        const result = prepareReservation(request);

        // Assert
        expect.anything(result.fromDate);
        expect.anything(result.toDate);
        expect.anything(result.userId);
        expect.anything(result.roomId);
        expect(result.pricePerDay).toBe(22.22);
        expect(result.totalPrice).toBe(22.22);
    })
})

describe('validateReservation', () => {
    it('When one of dates is null/undefined then error is returned', () => {
        // Arrange: 
        const reservation = {
            fromDate: null,
            toDate: parseIsoDatetime('2020-04-15T20:00:00Z'),
            userId: parseObjectId('5ea5dae40d4ecf0afbd84dc9'),
            roomId: parseObjectId('5ea5daff8eba612e9374625d'),
            pricePerDay: 22.22,
            totalPrice: 22.22
        };

        // Act:
        const result = validateReservation(reservation);

        // Assert:
        expect(result).toHaveLength(1);
        expect(result[0].includes(`'fromDate'`)).toBe(true);
    });

    it('When one of objectIds is null/undefined then error is returned', () => {
        // Arrange: 
        const reservation = {
            fromDate: parseIsoDatetime('2020-04-15T20:00:00Z'),
            toDate: parseIsoDatetime('2020-04-15T20:00:00Z'),
            userId: null,
            roomId: parseObjectId('5ea5daff8eba612e9374625d'),
            pricePerDay: 22.22,
            totalPrice: 22.22
        };

        // Act:
        const result = validateReservation(reservation);

        // Assert:
        expect(result).toHaveLength(1);
        expect(result[0].includes(`'userId'`)).toBe(true);
    });

    it('When one of objectIds is null/undefined then error is returned', () => {
        // Arrange: 
        const reservation = {
            fromDate: parseIsoDatetime('2020-04-15T20:00:00Z'),
            toDate: parseIsoDatetime('2020-04-15T20:00:00Z'),
            userId: parseObjectId('5ea5dae40d4ecf0afbd84dc9'),
            roomId: parseObjectId('5ea5daff8eba612e9374625d'),
            pricePerDay: null,
            totalPrice: 22.22
        };

        // Act:
        const result = validateReservation(reservation);

        // Assert:
        expect(result).toHaveLength(1);
        expect(result[0].includes(`'pricePerDay'`)).toBe(true);
    });
});

const roomForGettingReservation = '5ea5e3423724e5ff90e7df45';
const reservationsForRoom = [
    '5ea5e6b2f0322ac00ff284ac',
    '5ea5e3beb9f264420ea8799d'
];

describe('/room/:roomId/reservations', () => {
    it('When roomId is not valid ObjectId then error is returned', async () => {
        // Assert: 
        const invalidObjectId = "INALID";

        // Act:
        const result = await request.get(`/rooms/${invalidObjectId}/reservations`)
        .query({
            fromDate: '2020-05-01T00:00:00.000Z',
            toDate: '2020-05-02T00:00:00.000Z'
        });

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].includes('ObjectId')).toBe(true);
    });

    it('When one of dates is not valid iso datetime then error is returned', async () => {
        // Act:
        const result = await request.get(`/rooms/${roomForGettingReservation}/reservations`)
        .query({
            fromDate: 'INVALID',
            toDate: '2020-05-02T00:00:00.000Z'
        });

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].includes('fromDate')).toBe(true);
    });

    it('When correct query values and parameter are provided then valid reservation are returned', async () => {
        // Act:
        const result = await request.get(`/rooms/${roomForGettingReservation}/reservations`)
        .query({
            fromDate: '2020-05-01T00:00:00.000Z',
            toDate: '2020-05-02T00:00:00.000Z'
        });
    
        // Assert:
        expect(result.status).toBe(200);
        expect(result.body).toHaveLength(2);
        reservationsForRoom.forEach(reservationId => {
            expect(result.body.some(x => x._id === reservationId)).toBe(true)
        });

        const reservation1 = result.body.filter(x => x._id === reservationsForRoom[0])[0];
        expect(reservation1.fromDate).toBe('2020-05-01T00:00:00.000Z');
        expect(reservation1.toDate).toBe('2020-05-01T00:00:00.000Z');
        
        const reservation2 = result.body.filter(x => x._id === reservationsForRoom[1])[0];
        expect(reservation2.fromDate).toBe('2020-05-02T00:00:00.000Z');
        expect(reservation2.toDate).toBe('2020-05-02T00:00:00.000Z');
    });
});

afterAll(() => {
    mongoose.connection.close();
});