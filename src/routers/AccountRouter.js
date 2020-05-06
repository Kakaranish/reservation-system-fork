import express from "express";
import passport from "passport";
import * as AuthUtils from './../auth/auth-utils';
import { body, cookie, validationResult } from 'express-validator';
import RefreshToken from '../models/refresh-token-model';
require('../auth/passport-config');
import { tokenValidatorMW } from '../auth/auth-validators';

const router = express();

router.post('/singup', async (req, res) => {
    passport.authenticate('singup', { session: false },
        async (error, user, info) => {
            if (!user) return res.status(400).json(info.message);
            return res.json({
                "message": info.message,
                "user": user
            });
});

router.post('/token/refresh', [
    cookie('refreshToken').notEmpty().withMessage('non-empty required').bail()
        .isJWT().withMessage('must be JWT')
],
    async (req, res) => {
        console.log('cookies');
        console.log(req.cookies);
        if (validationResult(req).errors.length > 0)
            return res.status(400).json(validationResult(req));
        try {
            const jwtRefreshToken = req.cookies.refreshToken;
            res.cookie('accessToken', await AuthUtils.refreshAccessToken(jwtRefreshToken),
                { httpOnly: true });
            res.cookie('refreshToken', jwtRefreshToken, { httpOnly: true });
            res.status(200).send();
        } catch (error) {
            res.status(400).json({ errors: [error.message] });
        }
    }
);

router.post('/verify', [
    cookie('accessToken').notEmpty().withMessage('cannot be empty').bail()
        .isJWT().withMessage('must be JWT')
], async (req, res) => {
    if (validationResult(req).errors.length > 0)
        return res.status(400).json(validationResult(req));
    try {
        res.status(200).json({
            isExpired: AuthUtils.isJwtAccessTokenExpired(req.cookies.accessToken)
        });
    } catch (error) {
        res.status(400).json({ errors: [error] });
    }
});

router.post('/register', registerValidators(), async (req, res) => {
    if (validationResult(req).errors.length > 0)
        return res.status(400).json(validationResult(req));

    passport.authenticate('register', { session: false },
        async (error, user) => {
            if (!user) return res.status(400).json({ errors: [error] });

            return res.json({
                accessToken: AuthUtils.createAccessToken(user),
                refreshToken: await AuthUtils.createRefreshToken(user)
            });
        }
    )(req, res);
});

router.post('/login', loginValidators(), async (req, res, next) => {
    if (validationResult(req).errors.length > 0)
        return res.status(400).json(validationResult(req));
    passport.authenticate('login', async (error, user) => {
        if (!user) return res.status(400).json({ errors: [error] });

        const refreshTokenDoc = await RefreshToken.findOne({ userId: user._id });
        res.cookie('accessToken', AuthUtils.createAccessToken(user), { httpOnly: true });
        res.cookie('refreshToken', refreshTokenDoc.token, { httpOnly: true });
        return res.sendStatus(200);
    })(req, res, next);
});

function registerValidators() {
    return [
        body('email').notEmpty().withMessage('cannot be empty').bail()
            .isEmail().withMessage('must have email format'),
        body('password').notEmpty().withMessage('cannot be empty'),
        body('firstName').notEmpty().withMessage('cannnot be empty'),
        body('lastName').notEmpty().withMessage('cannnot be empty')
    ];
}

function loginValidators() {
    return [
        body('email').notEmpty().withMessage('cannot be empty').bail()
            .isEmail().withMessage('must have email format'),
        body('password').notEmpty().withMessage('cannot be empty')
    ];
}

export default router;