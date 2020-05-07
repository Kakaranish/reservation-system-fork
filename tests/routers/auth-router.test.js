import app from '../../src/app';
import supertest from 'supertest';
import mongoose from 'mongoose';
import { connectTestDb } from '../../src/mongo-utils';
import User from '../../src/models/user-model';
import * as AuthUtils from '../../src/auth/auth-utils';
import cookie from 'cookie';

const request = supertest(app);

beforeAll(async () => {
    await connectTestDb();
});

describe('/register', () => {
    it('When some required fields are not filled then errors are returned', async () => {
        // Act:
        const result = await request.post('/auth/register')
            .send({
                email: 'someuser@mail.com',
                lastName: 'lastname'
            });

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(2);
        expect(result.body.errors.some(e => e.param === 'password' &&
            e.msg.includes('cannot be empty'))).toBe(true);
        expect(result.body.errors.some(e => e.param === 'firstName' &&
            e.msg.includes('cannot be empty'))).toBe(true);
    });

    it('When email field value does not match to general email regex then error is returned', async () => {
        // Act:
        const result = await request.post('/auth/register')
            .send({
                email: 'INVALID',
                password: '123',
                firstName: 'firstname',
                lastName: 'lastname'
            });

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].param).toBe('email');
        expect(result.body.errors[0].msg.includes('must have email format')).toBe(true);
    });

    it('When invalid admin token is provided then error is returned', async () => {
        // Act:
        const result = await request.post('/auth/register')
            .send({
                email: 'someuser@mail.com',
                password: '123',
                firstName: 'firstname',
                lastName: 'lastname',
                adminToken: 'INVALID'
            });

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].includes('invalid admin token')).toBe(true);
    });

    it('When user with given email already exists then error is returned', async () => {
        // Act:
        const result = await request.post('/auth/register')
            .send({
                email: 'user@mail.com',
                password: '123',
                firstName: 'firstname',
                lastName: 'lastname'
            });

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].includes('is already taken')).toBe(true);
    });

    it('When everything is ok and admin token is not provided then account is created and USER tokens are returned', async () => {
        // Arrange:
        const userEmail = 'usertocreate@mail.com';
        await User.deleteOne({ email: userEmail })

        // Act:
        const result = await request.post('/auth/register')
            .send({
                email: userEmail,
                password: '123',
                firstName: 'firstname',
                lastName: 'lastname'
            });

        // Assert:
        let user;
        try {
            expect(result.status).toBe(200);
            user = await User.findOne({ email: userEmail });
            expect(user).not.toBeNull();

            const cookiesStr = result.header['set-cookie'][0].split(',');
            const cookies = cookiesStr.map(cookieStr => cookie.parse(cookieStr));
            const decodedAccessToken = AuthUtils.decodeJwtAccessToken(cookies[0].accessToken);
            const decodedRefreshToken = AuthUtils.decodeJwtRefreshToken(cookies[1].refreshToken);
            expect(decodedAccessToken).not.toBeNull();
            expect(decodedRefreshToken).not.toBeNull();
            expect(decodedAccessToken.userId).toBe(user._id.toHexString());
            expect(decodedAccessToken.email).toBe(userEmail);
            expect(decodedAccessToken.role).toBe('USER');
            expect(decodedRefreshToken.userId).toBe(user._id.toHexString());
            expect(decodedRefreshToken.email).toBe(userEmail);
            expect(decodedRefreshToken.role).toBe('USER');
        } catch (error) {
            throw error;
        } finally {
            if (user) user.remove();
        }
    });

    it('When everything is ok and admin token is provided then account is created and ADMIN tokens are returned', async () => {

    });
});

describe('/login', () => {
    it('When some fields are not filled then errors are returned', async () => {
        // Act:
        const result = await request.post('/auth/login');

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(2);
        expect(result.body.errors.some(e => e.param === 'email'
            && e.msg.includes('cannot be empty'))).toBe(true);
        expect(result.body.errors.some(e => e.param === 'password'
            && e.msg.includes('cannot be empty'))).toBe(true);
    });

    it('When provided email does not match to general email regex then error is returned', async () => {
        // Act:
        const result = await request.post('/auth/login')
            .send({
                email: 'INVALID',
                password: '123'
            });

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].param).toBe('email');
        expect(result.body.errors[0].msg.includes('email format')).toBe(true);
    });

    it('When user with given email does not exist then error is returned', async () => {
        // Act:
        const result = await request.post('/auth/login')
            .send({
                email: 'nonexistinguser@mail.com',
                password: '123'
            });

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].includes('no user with such email')).toBe(true);
    });

    it('When provided password is not valid then error is returned', async () => {
        // Act:
        const result = await request.post('/auth/login')
            .send({
                email: 'user@mail.com',
                password: '1234' // valid is 123
            });

        // Assert:
        expect(result.status).toBe(400);
        expect(result.body.errors).toHaveLength(1);
        expect(result.body.errors[0].includes('wrong password')).toBe(true);
    });

    it('When everything is ok then tokens are sent as cookies', async () => {
        // Arrange:
        const userId = '5ea54fe32d431462827c2c5e';

        // Act:
        const result = await request.post('/auth/login')
            .send({
                email: 'user@mail.com',
                password: '123'
            });

        // Assert:
        expect(result.status).toBe(200);

        const cookiesStr = result.header['set-cookie'][0].split(',');
        const cookies = cookiesStr.map(cookieStr => cookie.parse(cookieStr));
        const decodedAccessToken = AuthUtils.decodeJwtAccessToken(cookies[0].accessToken);
        const decodedRefreshToken = AuthUtils.decodeJwtRefreshToken(cookies[1].refreshToken);
        expect(decodedAccessToken).not.toBeNull();
        expect(decodedRefreshToken).not.toBeNull();
        expect(decodedAccessToken.userId).toBe(userId);
        expect(decodedAccessToken.email).toBe('user@mail.com');
        expect(decodedAccessToken.role).toBe('USER');
        expect(decodedRefreshToken.userId).toBe(userId);
        expect(decodedRefreshToken.email).toBe('user@mail.com');
        expect(decodedRefreshToken.role).toBe('USER');
    });
});

afterAll(() => {
    mongoose.connection.close();
});