import User from '../models/user-model';
import jwt from 'jsonwebtoken';
import RefreshToken from '../models/refresh-token-model';

require('dotenv').config();

/**
 * @param {User} user 
 */
export const createAccessToken = user => {
    const jwtPayload = {
        userId: user._id,
        email: user.email,
        role: user.role
    };
    return jwt.sign(jwtPayload, process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION });
}

/**
 * @param {User} user 
 */
export const createRefreshToken = async user => {
    const jwtPayload = {
        userId: user._id,
        email: user.email,
        role: user.role
    };
    const token = jwt.sign(jwtPayload, process.env.REFRESH_TOKEN_SECRET);
    const refreshToken = new RefreshToken({
        userId: user._id,
        token: token
    });
    await refreshToken.save();

    return token;
}

/**
 * @param {String} jwtRefreshToken 
 */
export const refreshAccessToken = async jwtRefreshToken => {
    let refreshToken = jwt.decode(jwtRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    if (!await User.exists({ _id: refreshToken.userId })) return null;
    return createAccessToken({
        userId: refreshToken.userId,
        email: refreshToken.email,
        role: refreshToken.role
    });
}

/**
 * @param {String} jwtAccessToken 
 */
export const decodeJwtAccessToken = jwtAccessToken => {
    try {
        return jwt.verify(jwtAccessToken, process.env.ACCESS_TOKEN_SECRET);
    } catch (error) {
        return null;
    }
}

/**
 * @param {String} jwtRefreshToken
 */
export const decodeJwtRefreshToken = async jwtRefreshToken => {
    try {
        const refreshToken = jwt.verify(jwtRefreshToken,
            process.env.REFRESH_TOKEN_SECRET);
        const refreshTokenAssignedToUser = await RefreshToken.exists({
            userId: refreshToken.userId,
            token: jwtRefreshToken
        });
        return refreshTokenAssignedToUser ? refreshToken : null;
    } catch (error) {
        return null;
    }
}
