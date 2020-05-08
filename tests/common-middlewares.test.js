import mongoose from 'mongoose';
import * as Mocks from 'node-mocks-http';
import express from 'express';
import { body, validationResult } from 'express-validator';
import { connectTestDb } from '../src/mongo-utils';
import { queryOptionalDateIntervalValidatorMW, userExistenceValidatorMW, queryDateIntervalValidatorMW, errorSummarizerMW } from '../src/common-middlewares';
import supertest from 'supertest';

beforeAll(async () => {
    await connectTestDb();
});

describe('queryDateIntervalValidatorMW', () => {
    it('When fromDate and toDate are not provided then errors are returned', () => {
        // Arrange:
        const req = Mocks.createRequest({ query: {} });
        const res = Mocks.createResponse();
        const next = jest.fn();

        // Act:
        queryDateIntervalValidatorMW(req, res, next);

        // Assert:
        expect(next).toBeCalledTimes(1);
        expect(req.body.errors).toHaveLength(2);
        expect(req.body.errors[0].param).toBe('fromDate');
        expect(req.body.errors[0].msg.includes('ISO8601')).toBe(true);
        expect(req.body.errors[1].param).toBe('toDate');
        expect(req.body.errors[1].msg.includes('ISO8601')).toBe(true);
    });

    test.each([undefined, '', 'INVALID'])
        ('When fromDate is %s and toDate is valid then errors are returned', fromDate => {
            // Arrange:
            const req = Mocks.createRequest({
                query: {
                    fromDate: fromDate,
                    toDate: '2020-01-01T00:00:00.000Z'
                }
            });
            const res = Mocks.createResponse();
            const next = jest.fn();

            // Act:
            queryDateIntervalValidatorMW(req, res, next);

            // Assert:
            expect(next).toBeCalledTimes(1);
            expect(req.body.errors).toHaveLength(1);
            expect(req.body.errors[0].param).toBe('fromDate');
            expect(req.body.errors[0].msg.includes('ISO8601')).toBe(true);
        });

    test.each([undefined, '', 'INVALID'])
        ('When toDate is %s and from is valid then errors are returned', toDate => {
            // Arrange:
            const req = Mocks.createRequest({
                query: {
                    fromDate: '2020-01-01T00:00:00.000Z',
                    toDate: toDate
                }
            });
            const res = Mocks.createResponse();
            const next = jest.fn();

            // Act:
            queryDateIntervalValidatorMW(req, res, next);

            // Assert:
            expect(next).toBeCalledTimes(1);
            expect(req.body.errors).toHaveLength(1);
            expect(req.body.errors[0].param).toBe('toDate');
            expect(req.body.errors[0].msg.includes('ISO8601')).toBe(true);
        });

    it('When fromDate and toDate are both invalid then errors are returned', () => {
        // Arrange:
        const req = Mocks.createRequest({
            query: {
                fromDate: 'INVALID',
                toDate: 'INVALID'
            }
        });
        const res = Mocks.createResponse();
        const next = jest.fn();

        // Act:
        queryDateIntervalValidatorMW(req, res, next);

        // Assert:
        expect(next).toBeCalledTimes(1);
        expect(req.body.errors).toHaveLength(2);
        expect(req.body.errors[0].param).toBe('fromDate');
        expect(req.body.errors[0].msg.includes('ISO8601')).toBe(true);
        expect(req.body.errors[1].param).toBe('toDate');
        expect(req.body.errors[1].msg.includes('ISO8601')).toBe(true);
    });

    it('When fromDate and toDate are both valid then no errors are returned', () => {
        // Arrange:
        const req = Mocks.createRequest({
            query: {
                fromDate: '2020-01-01T00:00:00.000Z',
                toDate: '2020-01-01T00:00:00.000Z'
            }
        });
        const res = Mocks.createResponse();
        const next = jest.fn();

        // Act:
        queryDateIntervalValidatorMW(req, res, next);

        // Assert:
        expect(next).toBeCalledTimes(1);
        expect(req.body.errors).toBeUndefined();
    });

    it('When toDate precedes fromDate then error is returned', () => {
        // Arrange:
        const req = Mocks.createRequest({
            query: {
                fromDate: '2020-01-02T00:00:00.000Z',
                toDate: '2020-01-01T00:00:00.000Z'
            }
        });
        const res = Mocks.createResponse();
        const next = jest.fn();

        // Act:
        queryDateIntervalValidatorMW(req, res, next);

        // Assert:
        expect(next).toBeCalledTimes(1);
        expect(req.body.errors).toHaveLength(1);
        expect(req.body.errors[0].param).toBe('fromDate&toDate');
        expect(req.body.errors[0].msg.includes('must precede')).toBe(true);
    });
});

describe('queryOptionalDateIntervalValidatorMW', () => {
    it('When fromDate and toDate are not provided then no errors are returned', () => {
        // Arrange:
        const req = Mocks.createRequest({ query: {} });
        const res = Mocks.createResponse();
        const next = jest.fn();

        // Act:
        queryOptionalDateIntervalValidatorMW(req, res, next);

        // Assert:
        expect(next).toBeCalledTimes(1);
        expect(req.body.errors).toBeUndefined();
    });

    test.each([undefined, '', 'INVALID'])
        ('When fromDate is %s and toDate is valid then errors are returned', fromDate => {
            // Arrange:
            const req = Mocks.createRequest({
                query: {
                    fromDate: fromDate,
                    toDate: '2020-01-01T00:00:00.000Z'
                }
            });
            const res = Mocks.createResponse();
            const next = jest.fn();

            // Act:
            queryOptionalDateIntervalValidatorMW(req, res, next);

            // Assert:
            expect(next).toBeCalledTimes(1);
            expect(req.body.errors).toHaveLength(1);
            expect(req.body.errors[0].param).toBe('fromDate');
            expect(req.body.errors[0].msg.includes('ISO8601')).toBe(true);
        });

    test.each([undefined, '', 'INVALID'])
        ('When toDate is %s and from is valid then errors are returned', toDate => {
            // Arrange:
            const req = Mocks.createRequest({
                query: {
                    fromDate: '2020-01-01T00:00:00.000Z',
                    toDate: toDate
                }
            });
            const res = Mocks.createResponse();
            const next = jest.fn();

            // Act:
            queryOptionalDateIntervalValidatorMW(req, res, next);

            // Assert:
            expect(next).toBeCalledTimes(1);
            expect(req.body.errors).toHaveLength(1);
            expect(req.body.errors[0].param).toBe('toDate');
            expect(req.body.errors[0].msg.includes('ISO8601')).toBe(true);
        });

    it('When fromDate and toDate are both invalid then errors are returned', () => {
        // Arrange:
        const req = Mocks.createRequest({
            query: {
                fromDate: 'INVALID',
                toDate: 'INVALID'
            }
        });
        const res = Mocks.createResponse();
        const next = jest.fn();

        // Act:
        queryOptionalDateIntervalValidatorMW(req, res, next);

        // Assert:
        expect(next).toBeCalledTimes(1);
        expect(req.body.errors).toHaveLength(2);
        expect(req.body.errors[0].param).toBe('fromDate');
        expect(req.body.errors[0].msg.includes('ISO8601')).toBe(true);
        expect(req.body.errors[1].param).toBe('toDate');
        expect(req.body.errors[1].msg.includes('ISO8601')).toBe(true);
    });

    it('When fromDate and toDate are both valid then no errors are returned', () => {
        // Arrange:
        const req = Mocks.createRequest({
            query: {
                fromDate: '2020-01-01T00:00:00.000Z',
                toDate: '2020-01-01T00:00:00.000Z'
            }
        });
        const res = Mocks.createResponse();
        const next = jest.fn();

        // Act:
        queryOptionalDateIntervalValidatorMW(req, res, next);

        // Assert:
        expect(next).toBeCalledTimes(1);
        expect(req.body.errors).toBeUndefined();
    });

    it('When toDate precedes fromDate then error is returned', () => {
        // Arrange:
        const req = Mocks.createRequest({
            query: {
                fromDate: '2020-01-02T00:00:00.000Z',
                toDate: '2020-01-01T00:00:00.000Z'
            }
        });
        const res = Mocks.createResponse();
        const next = jest.fn();

        // Act:
        queryOptionalDateIntervalValidatorMW(req, res, next);

        // Assert:
        expect(next).toBeCalledTimes(1);
        expect(req.body.errors).toHaveLength(1);
        expect(req.body.errors[0].param).toBe('fromDate&toDate');
        expect(req.body.errors[0].msg.includes('must precede')).toBe(true);
    });
});

describe('errorSummarizerMW', () => {
    it('When there is no express-validator errors then req.body.errors are not changed', async () => {
        // Arrange:
        const expressValidators = [
            body('test').equals('123').withMessage('must be 123'),
            body('name').notEmpty().withMessage('non-empty required')
        ];
        const app = express();
        app.use(async (req, res, next) => {
            req.body = {
                errors: ['some error'],
                test: '123',
                name: 'John'
            };
            next();
        })
        let reqBodyResult;
        app.get('/test', expressValidators, errorSummarizerMW, async (req, res, next) => {
            reqBodyResult = req.body;
            next();
        });

        // Act:
        const request = supertest(app);
        await request.get('/test');

        // Assert:
        expect(reqBodyResult.errors).toHaveLength(1);
        expect(reqBodyResult.errors[0]).toBe('some error');
    });

    it('When req.body does is already undefined then express-validator errors are assigned to it', async () => {
        // Arrange:
        const expressValidators = [
            body('test').equals('123').withMessage('must be 123'),
            body('name').notEmpty().withMessage('non-empty required')
        ];
        const app = express();
        const request = supertest(app);
        let reqBody;
        app.get('/test', expressValidators, errorSummarizerMW, async (req, res, next) => {
            reqBody = req.body;
            next();
        });

        // Act:
        await request.get('/test');

        // Assert:
        expect(reqBody.errors).toHaveLength(2);
        expect(reqBody.errors.some(e => e.param === 'test' && e.msg.includes('must be 123'))).toBe(true);
        expect(reqBody.errors.some(e => e.param === 'name' && e.msg.includes('non-empty required'))).toBe(true);
    });

    it('When req.body.errors is already defined then express-validator errors are appended to it', async () => {
        // Arrange:
        const expressValidators = [
            body('test').equals('123').withMessage('must be 123'),
            body('name').notEmpty().withMessage('non-empty required')
        ];
        const app = express();
        const request = supertest(app);
        app.use(async (req, res, next) => {
            req.body = {
                errors: ['some error'],
                test: '1234',
                name: 'John'
            };
            next();
        });
        let reqBodyResult;
        app.get('/test', expressValidators, errorSummarizerMW, async (req, res, next) => {
            reqBodyResult = req.body;
            next();
        });

        // Act:
        await request.get('/test');

        // Assert:
        expect(reqBodyResult.errors).toHaveLength(2);
        expect(reqBodyResult.errors[0]).toBe('some error');
        expect(reqBodyResult.errors[1].param).toBe('test');
        expect(reqBodyResult.errors[1].msg).toBe('must be 123');
    });
});

describe('userExistenceValidatorMW', () => {
    it('When there is no user in req body then error is sent', async () => {
        // Arrange:
        const req = Mocks.createRequest({ body: {} });
        const res = Mocks.createResponse();
        const next = jest.fn();

        // Act:
        await userExistenceValidatorMW(req, res, next);

        // Assert:
        expect(next).not.toBeCalled();
        expect(res._getStatusCode()).toBe(401);
        expect(res._getJSONData().errors).toHaveLength(1);
        expect(res._getJSONData().errors[0].param).toBe('token');
        expect(res._getJSONData().errors[0].msg.includes('user does not exist')).toBe(true);
    });

    it('When id is provided but such user does not exist then error is sent', async () => {
        // Arrange:
        const anyUserId = '5eb59999d2fa5dd58cc6373f'
        const req = Mocks.createRequest();
        req.user = { _id: anyUserId };
        const res = Mocks.createResponse();
        const next = jest.fn();

        // Act:
        await userExistenceValidatorMW(req, res, next);

        // Assert:
        expect(next).not.toBeCalled();
        expect(res._getStatusCode()).toBe(401);
        expect(res._getJSONData().errors).toHaveLength(1);
        expect(res._getJSONData().errors[0].param).toBe('token');
        expect(res._getJSONData().errors[0].msg.includes('user does not exist')).toBe(true);
    });

    it('When user with id does exists then next middleware is called', async () => {
        // Arrange:
        const existingUserId = '5ea54fe32d431462827c2c5e'
        const req = Mocks.createRequest();
        req.user = { _id: existingUserId }
        const res = Mocks.createResponse();
        const next = jest.fn();

        // Act:
        await userExistenceValidatorMW(req, res, next);

        // Assert:
        expect(next).toBeCalledTimes(1);
    });
});

afterAll(() => {
    mongoose.connection.close();
});