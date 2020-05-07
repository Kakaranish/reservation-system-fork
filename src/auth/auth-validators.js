import './passport-config';
import {
    refreshAccessToken,
    decodeJwtAccessToken,
    decodeJwtRefreshToken
} from '../auth/auth-utils';

export const tokenValidatorMW = async (req, res, next) => {
    const accessToken = decodeJwtAccessToken(req.cookies.accessToken)
    if (accessToken) {
        setUserInReq(req, accessToken);
        return next();
    }

    const refreshToken = await decodeJwtRefreshToken(req.cookies.refreshToken);
    if (!refreshToken) return res.status(401).json({
        errors: ['cannot refresh access token - no/invalid refresh token provided']
    });

    const newAccessToken = await refreshAccessToken(req.cookies.refreshToken);
    if (!newAccessToken) return res.status(401).json({
        errors: ['cannot refresh access token - such user does not exist']
    });
    

    res.cookie('accessToken', newAccessToken, { httpOnly: true });
    setUserInReq(req, refreshToken);
    next();
};

export const adminValidatorMW = (req, res, next) => {
    if (req.user.role !== 'ADMIN')
        return res.status(401).json({ errors: ['admin role required'] });
    next();
}

export const userValidatorMW = (req, res, next) => {
    if (req?.user?.role !== 'USER')
        return res.status(401).json({ errors: ['user role required'] });
    next();
}

/**
 * @param {Object} req
 * @param {Object} dataSource 
 * @param {String} dataSource.userId
 * @param {String} dataSource.email
 * @param {String} dataSource.role
 */
const setUserInReq = (req, dataSource) => {
    req.user = {
        _id: dataSource.userId,
        email: dataSource.email,
        role: dataSource.role
    };
};