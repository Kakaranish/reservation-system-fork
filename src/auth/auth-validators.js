import './passport-config';
import {
    refreshAccessToken,
    decodeJwtAccessToken,
    decodeJwtRefreshToken
} from '../auth/auth-utils';

export const tokenValidatorMW = async (req, res, next) => {
    const accessToken = decodeJwtAccessToken(req.cookies.accessToken)
    if (accessToken) return next();

    const refreshToken = await decodeJwtRefreshToken(req.cookies.refreshToken);
    if (!refreshToken) return res.status(400).json({
        errors: ['cannot refresh access token - no/invalid refresh token provided']
    });

    const newAccessToken = await refreshAccessToken(jwtRefreshToken);
    if (!newAccessToken) return res.status(400).json({
        errors: ['unable to refresh access token - such user does not exist']
    });

    res.cookie('accessToken', newAccessToken, { httpOnly: true });
    req.user = {
        _id: refreshToken.userId,
        email: refreshToken.email,
        role: refreshToken.role
    };

    next();
};

export const adminValidatorMW = async (req, res, next) => {
    if (req.user.role !== 'ADMIN')
        return res.status(401).json({ errors: ['Admin role required'] });
    next();
}

export const userValidatorMW = async (req, res, next) => {
    if (req.user.role !== 'USER')
        return res.status(401).json({ errors: ['Admin role required'] });
    next();
}