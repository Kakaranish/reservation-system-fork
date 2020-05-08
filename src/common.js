import moment from 'moment';
import mongoose from 'mongoose';
import 'regenerator-runtime';
import { validationResult } from 'express-validator';
import User from './models/user-model';

/**
 * @param {Number | String} value 
 */
export const preparePrice = value => {
    if (!value) return null;
    else if (typeof (value) === 'number') {
        if (value >= 0) return parseFloat(value.toFixed(2));
        else return null;
    }
    else if (/^\d+(\.\d{1,2})?$/.test(value)) return parseFloat(value);
    else return null;
}

/**
 * @param {String} datetime 
 * @returns {moment.Moment}
 */
export const parseIsoDatetime = datetime => {
    const isoDatetime = moment.utc(datetime, moment.ISO_8601, true)
    return isoDatetime.isValid()
        ? isoDatetime
        : null;
}

/**
 * 
 * @param {String} objectId 
 * @returns {mongoose.}
 */
export const parseObjectId = objectId => {
    return mongoose.Types.ObjectId.isValid(objectId)
        ? mongoose.Types.ObjectId(objectId)
        : null;
}

/**
 * @async
 * @param {Response} res 
 * @param {Function} action 
 */
export const withAsyncRequestHandler = async (res, action) => {
    try {
        await action();
    } catch (error) {
        console.log(`Error: ${error}`);
        res.status(500).json({ errors: ['Internal error'] });
    }
}

/**
 * 
 * @param {Request} req 
 * @param {Response} res 
 * @param {Function} next 
 */
export const queryOptionalDateIntervalValidatorMW = (req, res, next) => {
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
    req.body.errors = [...(req.body.errors ?? []), ...expressValidatorErrors];
    if(!req.body.errors.length) req.body.errors = undefined;
    
    next();
};

/**
 * 
 * @param {Request} req 
 * @param {Response} res 
 * @param {Function} next 
 */
export const userExistenceValidatorMW = async (req, res, next) => {
    if (await User.exists({ _id: req.user._id })) return next();
    res.status(401).json({
        errors: [{
            param: 'token',
            msg: 'user does not exist'
        }]
    });
};