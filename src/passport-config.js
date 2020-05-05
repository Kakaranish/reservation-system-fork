import passport from "passport";
import bcryptjs from "bcryptjs";
import User from './models/user-model';
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
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
        if (adminToken && !isAdminTokenValid) {
            return done(null, false, {
                message: "Unable to create admin account. Invalid admin token."
            });
        }
        const userRole = adminToken
            ? "ADMIN"
            : "USER";

        const encryptedPassword = await bcryptjs.hash(password, process.env.HASH);

        const user = new User({
            "email": email,
            "password": encryptedPassword,
            "firstName": req.body.firstName,
            "lastName": req.body.lastName,
            "role": userRole
        });

        const userWithEmailAlreadyExists = await User.exists({ email: email });
        if (userWithEmailAlreadyExists) {
            return done(null, false, {
                message: `User with email '${email}' already exists`
            });
        }
        await user.save();
        
        return done(null, user, { message: "Sing up successful" });
    } catch (error) {
    done(error);
}
}));

passport.use('login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    try {
        const user = await User.findOne({ email: email });
        if (!user) return done(null, false, {
            message: "There is no user with such email"
        });

        // bcryptjs.genSalt()
        const passwordIsCorrect = await bcryptjs.compare(password, user.password);
        if (!passwordIsCorrect) return done(null, false, { message: "Error: Wrong password" });
        return done(null, user, { message: "Error: Logged in successfully" });
    } catch (error) {
        return done(error);
    }
}));

passport.use(new JWTStrategy({
    secretOrKey: process.env.ACCESS_TOKEN_SECRET,
    jwtFromRequest: ExtractJWT.fromUrlQueryParameter('secret_token')
}, async (token, done) => {
    try {
        return done(null, token.user);
    } catch (error) {
        done(error);
    }
}));