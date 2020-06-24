import passport from "passport";
import bcryptjs from "bcryptjs";
import User from '../models/user-model';
import 'regenerator-runtime';

require('dotenv').config();
const LocalStrategy = require('passport-local').Strategy;

passport.use('register', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, email, password, done) => {
    try {
        const adminToken = req.body.adminToken;
        const isAdminTokenValid = adminToken === process.env.ADMIN_TOKEN;
        if (adminToken && !isAdminTokenValid)
            return done('invalid admin token', false);

        if (await User.exists({ email: email }))
            return done(`email '${email}' is already taken`, false);

        const user = new User({
            "email": email,
            "password": await bcryptjs.hash(password, process.env.HASH),
            "firstName": req.body.firstName,
            "lastName": req.body.lastName,
            "role": adminToken ? "ADMIN" : "USER"
        });
        await user.save();

        return done(null, user);
    } catch (error) {
        done(error, false);
    }
}));

passport.use('login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    try {
        const user = await (User.findOne({ email: email })
            .select("_id email role password"));
        if (!user) return done('no user with such email', false);

        const passwordIsCorrect = await bcryptjs.compare(password, user.password);
        if (!passwordIsCorrect) return done('wrong password', false);

        return done(null, user);
    } catch (error) {
        return done(error, false);
    }
}));