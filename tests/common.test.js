import mongoose from 'mongoose';
import * as Mocks from 'node-mocks-http';
import { preparePrice, parseIsoDatetime, parseObjectId, withAsyncRequestHandler } from '../src/common';

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

describe('parseIsoDatetime', () => {
    test.each([
        "2020-04-01T20:00:00Z",
        "2020-04-01T20:00:00.000Z",
    ])('Valid datetime %s', datetime => {
        // Act:
        const result = parseIsoDatetime(datetime);

        // Assert:
        expect.anything(result);
        expect(result.date()).toBe(1);
        expect(result.month() + 1).toBe(4);
        expect(result.year()).toBe(2020);
        expect(result.hours()).toBe(20);
        expect(result.minutes()).toBe(0);
        expect(result.seconds()).toBe(0);
        expect(result.milliseconds()).toBe(0);
    });

    it('Valid datetime without time', () => {
        // Arrange:
        const datetime = "2020-04-01";

        // Act:
        const result = parseIsoDatetime(datetime);

        // Assert:
        expect.anything(result);
        expect(result.date()).toBe(1);
        expect(result.month() + 1).toBe(4);
        expect(result.year()).toBe(2020);
        expect(result.hours()).toBe(0);
        expect(result.minutes()).toBe(0);
        expect(result.seconds()).toBe(0);
        expect(result.milliseconds()).toBe(0);
    })

    test.each([
        "2020-04-01T25:00:11Z",
        "02.20.2013 20:13",
        "1/12/2020"
    ])('Invalid datetime format %s', datetime => {
        // Act:
        const result = parseIsoDatetime(datetime);

        // Assert:
        expect(result).toBe(null);
    });
});

describe('parseObjectId', () => {
    it('When objectId is valid', () => {
        // Arrange:
        const objectId = "5ea5d93c76eb57eb03627dbf";

        // Act:
        const result = parseObjectId(objectId);

        // Assert:
        expect(result).toStrictEqual(mongoose.Types.ObjectId(objectId));
    });

    it('When objectId is invalid', () => {
        // Arrange:
        const objectId = "INVALID";

        // Act:
        const result = parseObjectId(objectId);

        // Assert:
        expect(result).toBe(null);
    })
});

describe('withAsyncRequestHandler', () => {
    it('When action throws exception then error is sent', async () => {
        // Arrange:
        const res = Mocks.createResponse();
        const action = jest.fn(async () => { throw Error('error') });

        // Act:
        await withAsyncRequestHandler(res, action);

        // Assert:
        expect(action).toBeCalledTimes(1);
        expect(res._getStatusCode()).toBe(500);
    });

    it('When everything is ok then no error status is sent', async () => {
        // Arrange:
        const res = Mocks.createResponse();
        const action = jest.fn(async () => { });

        // Act:
        await withAsyncRequestHandler(res, action);

        // Assert:
        expect(action).toBeCalledTimes(1);
        expect(res._getStatusCode()).toBe(200);
    });
});

// describe('middlewareContext', () => {
//     it('Test', () => {
//         middlewareContext();
//     });
// }); 

// function middlewareContext() {
//     const middlewares = [
//         (req, res, next) => {
//             console.log('1');
//             next();
//         },
//         (req, res, next) => {
//             console.log('2');
//             next();
//         }
//     ];
//     let req, res;
//     middlewares[0](req, res, middlewares[1]);
//     // for (let i = 0; i < middlewares.length; i++) {
//     //     let next = middlewares[i + 1];
//     // }
// }