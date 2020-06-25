import express from 'express';
import { withAsyncRequestHandler } from '../common';
import User from '../models/user-model';
import RefreshToken from '../models/refresh-token-model';
import { tokenValidatorMW, adminValidatorMW } from '../auth/auth-validators';
import { validationExaminator } from '../common-middlewares';
import { param, body } from 'express-validator';
import { createRefreshToken } from '../auth/auth-utils';

const router = express.Router();

router.get('/', getUsersValidationMWs(), async (req, res) => {
    withAsyncRequestHandler(res, async () => {
        const users = await User.find({});
        res.status(200).json(users);
    });
});

router.get('/me', tokenValidatorMW, async (req, res) => {
    withAsyncRequestHandler(res, async () => {
        const user = await User.findById(req.user._id);
        res.status(200).json(user);
    });
});

router.put('/:id/role/:role', updateUserValidationMWs(), async (req, res) => {
    withAsyncRequestHandler(res, async () => {
        req.user.role = req.params.role;
        await req.user.save();
        await RefreshToken.deleteOne({ userId: req.user._id });
        await createRefreshToken(req.user);

        res.sendStatus(200);
    });
});

router.put('/me', updateMeValidationMWs(), async (req, res) => {
    withAsyncRequestHandler(res, async () => {
        const user = await User.findById(req.user._id);
        user.firstName = req.body.firstName;
        user.lastName = req.body.lastName;
        await user.save();

        res.sendStatus(200);
    });
});

function getUsersValidationMWs() {
    return [
        tokenValidatorMW,
        adminValidatorMW
    ];
}

function updateUserValidationMWs() {
    return [
        tokenValidatorMW,
        adminValidatorMW,
        param('id').notEmpty().withMessage('cannot be empty').bail()
            .custom(async (value, { req }) => {
                const user = await User.findById(value);
                if (!user) return Promise.reject('no such user');

                req.user = user;
            }),
        param('role').isIn(['USER', 'OWNER', 'ADMIN']).withMessage('illegal role'),
        validationExaminator
    ];
}

function updateMeValidationMWs() {
    return [
        tokenValidatorMW,
        body('firstName').notEmpty().withMessage('cannot be empty'),
        body('lastName').notEmpty().withMessage('cannot be empty'),
        validationExaminator
    ];
}

export default router;