import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
require('../auth');

const router = express();

router.post('/singup', async (req, res) => {
    passport.authenticate('singup', { session: false },
        async (error, user, info) => {
            if (!user) return res.status(400).json(info.message);
            return res.json({
                "message": info.message,
                "user": user
            });
        })(req, res);
});

router.post('/login', async (req, res, next) => {
    passport.authenticate('login', async (error, user, info) => {
        try {
            if (error) {
                console.log(error);
                res.status(500).json({
                    message: "Error: Internal server error"
                });
            }
            if (!user) return res.status(400).json(info);

            req.login(user, { session: false }, async error => {
                if (error) return next(error);
                const body = {
                    _id: user._id,
                    email: user.email,
                    role: user.role
                };
                const token = jwt.sign({ user: body }, process.env.JWT_SECRET_KEY);
                return res.json({ token });
            });
        } catch (error) {
            return next(req, res, next);
        }
    })(req, res, next);
});

module.exports = router;