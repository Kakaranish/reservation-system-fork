import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { parseObjectId } from '../../src/common';
import { connectTestDb } from '../../src/mongo-utils';
import * as AuthUtils from '../../src/auth/auth-utils';
import { tokenValidatorMW, adminValidatorMW, userValidatorMW } from '../../src/auth/auth-validators';
import User from '../../src/models/user-model';
import RefreshToken from '../../src/models/refresh-token-model';

import * as Mocks from 'node-mocks-http';

const userId = '5ea54fe32d431462827c2c5e';
let user;
let refreshToken;
beforeAll(async () => {
    await connectTestDb();

    user = await User.findById(userId);
    if (!user) throw Error('cannot get test user');

    refreshToken = await RefreshToken.findOne({ userId: user._id });
    if (!refreshToken) throw Error('cannot get test user token');
});

describe('tokenValidatorMW', () => {
    it('When access token is valid and not expired then next middleware is called', async () => {
        // Arrange:
        const anyUserId = '5eb3ea7adc39c3c9fc66caaa';
        const anyUser = {
            _id: anyUserId,
            email: 'anyuser@mail.com',
            role: 'USER'
        };
        const accessToken = createTestAccessToken(anyUser, 10 * 1000);

        const req = Mocks.createRequest({
            cookies: { accessToken: accessToken }
        });
        const res = Mocks.createResponse();
        const next = jest.fn();

        // Act:
        await tokenValidatorMW(req, res, next);

        // Assert:
        expect(next).toBeCalledTimes(1);
        res.on('end', () => {
            expect(res._getStatusCode()).toBe(200);
            expect(res._getJSONData().errors).toBeUndefined();
            expect(parseObjectId(res._getJSONData().body.user._id)).not.toBeNull();
            expect(parseObjectId(res._getJSONData().body.user._id)).not.toBeUndefined();
            expect(res._getJSONData().body.user.email).not.toBeUndefined();
            expect(res._getJSONData().body.user.role).not.toBeUndefined();
        });
    });

    it('When refresh token is invalid or not matching to user then error is returned', async () => {
        // Arrange:
        const req = Mocks.createRequest({
            cookies: { accessToken: 'INVALID' }
        });
        const res = Mocks.createResponse({
            eventEmitter: require('events').EventEmitter
        });
        const next = jest.fn();

        // Act:
        await tokenValidatorMW(req, res, next);

        // Assert:
        expect(next).toBeCalledTimes(0);
        res.on('end', () => {
            expect(res._getStatusCode()).toBe(400);
            expect(res._getJSONData().errors).toHaveLength(1);
            expect(res._getJSONData().errors[0].includes('no/invalid refresh'));
        });
    });

    it('When new access token cannot be generated then error is returned', async () => {
        // Arrange:
        const invalidUser = {
            _id: mongoose.Types.ObjectId(),
            email: 'nosuchuser@mail.com',
            role: 'USER'
        };
        const refreshToken = createTestRefreshToken(invalidUser);
        const req = Mocks.createRequest({
            cookies: {
                accessToken: 'INVALID',
                refreshToken: refreshToken
            }
        });
        const res = Mocks.createResponse({
            eventEmitter: require('events').EventEmitter
        });
        const next = jest.fn();

        // Act:
        await tokenValidatorMW(req, res, next);

        // Assert:
        expect(next).toBeCalledTimes(0);
        res.on('end', () => {
            expect(res._getStatusCode()).toBe(400);
            expect(res._getJSONData().errors).toHaveLength(1);
            expect(res._getJSONData().errors[0].includes('such user does not exist'));
        });
    });

    it('When access token is expired then new access token is generated and sent as cookie and user is set in req body and next middleware is called', async () => {
        // Arrange:
        const expiredAccessToken = createTestAccessToken(user, 1);
        const req = Mocks.createRequest({
            cookies: {
                accessToken: expiredAccessToken,
                refreshToken: refreshToken.token
            }
        });
        const res = Mocks.createResponse();
        const next = jest.fn();

        // Act:
        await tokenValidatorMW(req, res, next);

        // Assert:
        expect(next).toBeCalledTimes(1);
        expect(res.cookies.accessToken).not.toBeUndefined();
        expect(res.cookies.accessToken.options.httpOnly).toBe(true);
        const accessToken = AuthUtils.decodeJwtAccessToken(res.cookies.accessToken.value);
        expect(accessToken.userId).toBe('5ea54fe32d431462827c2c5e');
        expect(accessToken.email).toBe('user@mail.com');
        expect(accessToken.role).toBe("USER");
        expect(req.body.errors).toBeUndefined();
        expect(req.user._id).toBe('5ea54fe32d431462827c2c5e');
        expect(req.user.email).toBe('user@mail.com');
        expect(req.user.role).toBe("USER");
    });
});

describe('adminValidatorMW', () => {
    it('When user role is different than USER then error message is returned', async () => {
        // Arrange:
        const req = Mocks.createRequest();
        req.user = { role: 'USER' };
        const res = Mocks.createResponse();
        const next = jest.fn();

        // Act:
        adminValidatorMW(req, res, next);

        // Assert:
        expect(next).not.toBeCalled();
        expect(res._getStatusCode()).toBe(401);
        expect(res._getJSONData().errors).toHaveLength(1);
        expect(res._getJSONData().errors[0].includes('admin role required'));
    });

    it('When everything is OK then next middleware is called', async () => {
        // Arrange:
        const req = Mocks.createRequest();
        req.user = { role: 'ADMIN' };
        const res = Mocks.createResponse();
        const next = jest.fn();

        // Act:
        adminValidatorMW(req, res, next);

        // Assert:
        expect(next).toBeCalled();
        expect(res._getStatusCode()).toBe(200);
        expect(res._getData()).toBe("");
    });
});

describe('userValidatorMW', () => {
    it('When admin role is different than USER then error message is returned', async () => {
        // Arrange:
        const req = Mocks.createRequest();
        req.user = { role: 'USER' };
        const res = Mocks.createResponse();
        const next = jest.fn();

        // Act:
        adminValidatorMW(req, res, next);

        // Assert:
        expect(next).not.toBeCalled();
        expect(res._getStatusCode()).toBe(401);
        expect(res._getJSONData().errors).toHaveLength(1);
        expect(res._getJSONData().errors[0].includes('admin role required'));
    });

    it('When everything is OK then next middleware is called', async () => {
        // Arrange:
        const req = Mocks.createRequest();
        req.user = { role: 'USER' };
        const res = Mocks.createResponse();
        const next = jest.fn();

        // Act:
        userValidatorMW(req, res, next);

        // Assert:
        expect(next).toBeCalled();
        expect(res._getStatusCode()).toBe(200);
        expect(res._getData()).toBe("");
    });
});

/**
 * @param {User} user 
 */
function createTestAccessToken(user, expiresInMs) {
    const jwtPayload = {
        userId: user._id,
        email: user.email,
        role: user.role
    };
    return jwt.sign(jwtPayload, process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: `${expiresInMs}` });
}

function createTestRefreshToken(user) {
    const jwtPayload = {
        userId: user._id,
        email: user.email,
        role: user.role
    };
    return jwt.sign(jwtPayload, process.env.REFRESH_TOKEN_SECRET);
}

afterAll(() => {
    mongoose.connection.close();
});