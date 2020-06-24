import express from 'express';
import { withAsyncRequestHandler } from '../common';
import User from '../models/user-model';
import { tokenValidatorMW, adminValidatorMW } from '../auth/auth-validators';
import { validationExaminator } from '../common-middlewares';
import { param } from 'express-validator';

const router = express.Router();

router.get('/', getUsersValidationMWs(), async (req, res) => {
    withAsyncRequestHandler(res, async () => {
        const users = await User.find({});
        res.status(200).json(users);
    });
});

router.put('/:id/role/:role', updateUserValidationMWs(), async (req, res) => {
    withAsyncRequestHandler(res, async () => {
        req.user.role = req.params.role;
        await req.user.save();

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

export default router;