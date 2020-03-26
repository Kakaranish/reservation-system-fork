import passport from "passport";
import dbClient from "./DbClient";
import bcryptjs from "bcryptjs";

require('dotenv').config();

const localStrategy = require('passport-local').Strategy;
const resSystemClient = dbClient();

passport.use('singup', new localStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, email, password, done) => {
    try {
        const adminToken = req.body.adminToken;
        const isAdminTokenValid = adminToken === process.env.ADMIN_TOKEN;
        if (adminToken && !isAdminTokenValid) {
            return done(null, false, { message: "Unable to create admin account. Invalid admin token." });
        }
        const userRole = adminToken
            ? "ADMIN"
            : "USER";

        const encryptedPassword = await bcryptjs.hash(password, process.env.HASH);
        const user = {
            "email": email,
            "password": encryptedPassword,
            "role": userRole
        };

        const nInserted = await resSystemClient.withDb(async db => {
            const existingUser = await db.collection('users').findOne({ "email": email });
            if (existingUser) return 0;

            const nInserted = await db.collection('users').insertOne(user)
                .then(result => result.insertedCount);
            return nInserted;
        });

        if (!nInserted) return done(null, false, { message: `User with email '${email}' already exists` });
        return done(null, user, { message: "Sing up successful" });
    } catch (error) {
        done(error);
    }
}));

passport.use('login', new localStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    try {
        const user = await resSystemClient.withDb(async db => {
            return await db.collection('users').findOne({ "email": email });
        });
        if (!user) return done(null, false, { message: "There is no user with such email" });

        const passwordIsCorrect = await bcryptjs.compare(password, user.password);
        if (!passwordIsCorrect) return done(null, false, { message: "Error: Wrong password" });
        return done(null, user, { message: "Error: Logged in successfully" });
    } catch (error) {
        return done(error);
    }
}));

const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

passport.use(new JWTStrategy({
    secretOrKey: process.env.JWT_SECRET_KEY,
    jwtFromRequest: ExtractJWT.fromUrlQueryParameter('secret_token')
}, async (token, done) => {
    try {
        return done(null, token.user);
    } catch (error) {
        done(error);
    }
}));