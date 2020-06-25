import { validationResult } from 'express-validator';
import 'regenerator-runtime';
import { parseIsoDatetime, isImageType, uploadImage } from './common'
import User from './models/user-model';

require('dotenv').config();

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
export const bodyDateIntervalValidatorMW = (req, res, next) => {
    req.body.fromDate = parseIsoDatetime(req.body.fromDate);
    req.body.toDate = parseIsoDatetime(req.body.toDate);
    if (req.body.fromDate && req.body.toDate) {
        if (req.body.fromDate.toDate() > req.body.toDate.toDate()) {
            if (!req.body.errors) req.body.errors = [];
            req.body.errors.push({
                param: 'fromDate&toDate',
                msg: 'fromDate must precede toDate',
                location: 'body'
            });
            return next();
        }
    }

    if (!req.body.fromDate) {
        if (!req.body.errors) req.body.errors = [];
        req.body.errors.push({
            param: 'fromDate',
            msg: 'not in ISO8601 format',
            location: 'body'
        });
    }

    if (!req.body.toDate) {
        if (!req.body.errors) req.body.errors = [];
        req.body.errors.push({
            param: 'toDate',
            msg: 'not in ISO8601 format',
            location: 'body'
        });
    }

    next();
}

/**
 * @param {Request} req 
 * @param {Response} res 
 * @param {Function} next 
 */
export const errorSummarizerMW = (req, res, next) => {
    const expressValidatorErrors = validationResult(req).errors;
    if (!req.body) req.body = {};
    req.body.errors = [...(req.body.errors ?? []), ...expressValidatorErrors];
    if (!req.body.errors.length) req.body.errors = undefined;

    next();
};

/**
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

/**
 * @param {Request} req 
 * @param {Response} res 
 * @param {Function} next 
 */
export const uploadImageMW = async (req, res, next) => {
    if (!req.files?.file)
        return res.status(400).json({ errors: ["No file uploaded"] });

    const file = req.files.file;
    if (!isImageType(file))
        return res.status(400).json({ errors: ['must be image type'] });

    req.image = await uploadImage(file);

    next();
};

/**
 * @param {Request} req 
 * @param {Response} res 
 * @param {Function} next 
 */
export const validationExaminator = async (req, res, next) => {
    if (validationResult(req).errors.length > 0)
        return res.status(400).json(validationResult(req).errors);
    next();
};