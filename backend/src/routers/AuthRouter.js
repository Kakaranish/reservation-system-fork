import express from "express";
import passport from "passport";
import * as AuthUtils from '../auth/auth-utils';
import { body } from 'express-validator';
import RefreshToken from '../models/refresh-token-model';
import '../auth/passport-config';
import { decodeJwtAccessToken, decodeJwtRefreshToken, refreshAccessToken } from '../auth/auth-utils';
import { validationExaminator } from '../common-middlewares';

const router = express();

router.post('/register', registerValidators(), async (req, res) => {
    passport.authenticate('register', { session: false },
        async (error, user) => {
            if (!user) return res.status(400).json({ errors: [error] });
            
            const refreshToken = await AuthUtils.createRefreshToken(user);
            res.cookie('accessToken', AuthUtils.createAccessToken(user), { httpOnly: true });
            res.cookie('refreshToken', refreshToken, { httpOnly: true });
            res.status(200).json(user.toIdentityJson());
        }
    )(req, res);
});

router.post('/login', loginValidators(), async (req, res, next) => {
    passport.authenticate('login', async (_error, user) => {
        if (!user) return res.status(400).json({
            errors: [{
                param: 'email&password',
                msg: 'invalid email or password',
                location: 'body'
            }]
        });

        const refreshTokenDoc = await RefreshToken.findOne({ userId: user._id });
        res.cookie('accessToken', AuthUtils.createAccessToken(user), { httpOnly: true });
        res.cookie('refreshToken', refreshTokenDoc.token, { httpOnly: true });
        res.status(200).json(user.toIdentityJson());
    })(req, res, next);
});

router.post('/logout', async (req, res) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.sendStatus(200);
});

router.post('/verify', async (req, res) => {
    const accessToken = decodeJwtAccessToken(req.cookies.accessToken);
    if (accessToken) return res.status(200).json({
        user: {
            id: accessToken._id,
            email: accessToken.email,
            role: accessToken.role
        }
    });

    const refreshToken = await decodeJwtRefreshToken(req.cookies.refreshToken);
    if (!refreshToken) return res.status(200).json({ user: null });

    const newAccessToken = await refreshAccessToken(req.cookies.refreshToken);
    if (!newAccessToken) return res.status(200).json({ user: null });
    res.cookie('accessToken', newAccessToken, { httpOnly: true });
    res.status(200).json(user.toIdentityJson());
});

function registerValidators() {
    return [
        body('email').notEmpty().withMessage('cannot be empty').bail()
            .isEmail().withMessage('must have email format'),
        body('password').notEmpty().withMessage('cannot be empty'),
        body('firstName').notEmpty().withMessage('cannot be empty'),
        body('lastName').notEmpty().withMessage('cannot be empty'),
        validationExaminator
    ];
}

function loginValidators() {
    return [
        body('email').notEmpty().withMessage('cannot be empty').bail()
            .isEmail().withMessage('must have email format'),
        body('password').notEmpty().withMessage('cannot be empty'),
        validationExaminator
    ];
}

export default router;