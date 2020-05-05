import passport from "passport";
import './passport-config';

export async function authValidator(req, res, next) {
    passport.authenticate('jwt', { session: false }, async (error, user) => {
        if (!user.role)
            return res.status(401).json({ errors: ['Unauthorized access'] });
        req.user = user;
        next();
    })(req, res, next);
}

export async function adminValidator(req, res, next) {
    passport.authenticate('jwt', { session: false }, async (error, user) => {
        if (!user.role)
            return res.status(401).json({ errors: ['Unauthorized access'] });
        if (user.role !== "ADMIN")
            return res.status(401).json({ errors: ['Admin role required'] });
        req.user = user;
        next();
    })(req, res, next);
}

export async function userValidator(req, res, next) {
    passport.authenticate('jwt', { session: false }, async (error, user) => {
        if (!user.role)
            return res.status(401).json({ errors: ['Unauthorized access'] });
        if (user.role !== "USER")
            return res.status(401).json({ errors: ['User role required'] });
        req.user = user;
        next();
    })(req, res, next);
}