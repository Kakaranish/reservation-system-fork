import { validationResult } from 'express-validator';
import User from './models/user-model';
import { parseIsoDatetime } from './common'
import 'regenerator-runtime';

/**
 * @param {Request} req 
 * @param {Response} _res 
 * @param {Function} next 
 */
export const queryOptionalDateIntervalValidatorMW = (req, _res, next) => {
    if (!req.query.fromDate && !req.query.toDate) return next();

    req.query.fromDate = parseIsoDatetime(req.query.fromDate);
    req.query.toDate = parseIsoDatetime(req.query.toDate);
    if (req.query.fromDate && req.query.toDate) {
        if (req.query.fromDate.toDate() > req.query.toDate.toDate()) {
            if (!req.body.errors) req.body.errors = [];
            req.body.errors.push({
                param: 'fromDate&toDate',
                msg: 'fromDate must precede toDate',
                location: 'query'
            });
            return next();
        }
    }

    if (!req.query.fromDate) {
        if (!req.body.errors) req.body.errors = [];
        req.body.errors.push({
            param: 'fromDate',
            msg: 'not in ISO8601 format',
            location: 'query'
        });
    }

    if (!req.query.toDate) {
        if (!req.body.errors) req.body.errors = [];
        req.body.errors.push({
            param: 'toDate',
            msg: 'not in ISO8601 format',
            location: 'query'
        });
    }

    next();
}

/**
 * 
 * @param {Request} req 
 * @param {Response} res 
 * @param {Function} next 
 */
export const queryDateIntervalValidatorMW = (req, res, next) => {
    req.query.fromDate = parseIsoDatetime(req.query.fromDate);
    req.query.toDate = parseIsoDatetime(req.query.toDate);
    if (req.query.fromDate && req.query.toDate) {
        if (req.query.fromDate.toDate() > req.query.toDate.toDate()) {
            if (!req.body.errors) req.body.errors = [];
            req.body.errors.push({
                param: 'fromDate&toDate',
                msg: 'fromDate must precede toDate',
                location: 'query'
            });
            return next();
        }
    }

    if (!req.query.fromDate) {
        if (!req.body.errors) req.body.errors = [];
        req.body.errors.push({
            param: 'fromDate',
            msg: 'not in ISO8601 format',
            location: 'query'
        });
    }

    if (!req.query.toDate) {
        if (!req.body.errors) req.body.errors = [];
        req.body.errors.push({
            param: 'toDate',
            msg: 'not in ISO8601 format',
            location: 'query'
        });
    }

    next();
}

/**
 * 
 * @param {Request} req 
 * @param {Response} res 
 * @param {Function} next 
 */
export const errorSummarizerMW = (req, res, next) => {
    const expressValidatorErrors = validationResult(req).errors;
    if(!req.body) req.body = {};
    req.body.errors = [...(req.body.errors ?? []), ...expressValidatorErrors];
    if (!req.body.errors.length) req.body.errors = undefined;

    next();
};

/**
 * 
 * @param {Request} req 
 * @param {Response} res 
 * @param {Function} next 
 */
export const userExistenceValidatorMW = async (req, res, next) => {
    if (!req?.user?._id || !await User.exists({ _id: req.user._id })) {
        return res.status(401).json({
            errors: [{
                param: 'token',
                msg: 'user does not exist'
            }]
        });
    }
    next();
};