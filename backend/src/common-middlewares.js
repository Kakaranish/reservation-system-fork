import { validationResult } from 'express-validator';
import path from "path";
import { v4 as uuid } from 'uuid';
import azure from 'azure-storage';
import sharp from 'sharp';
import { parseIsoDatetime } from './common'
import 'regenerator-runtime';
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
 * 
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
    if (!req.files?.file) return res.status(400).json({
        errors: ["No file uploaded"]
    });

    const file = req.files.file;
    const fileExt = path.extname(file.name);

    let blobOptions;
    if (fileExt === '.jpg' || fileExt === '.jpeg')
        blobOptions = { contentSettings: { contentType: 'image/jpeg' } }
    else if (fileExt === '.png')
        blobOptions = { contentSettings: { contentType: 'image/png' } };
    else return res.json({ errors: ['must be image type'] });

    const blobService = azure.createBlobService();
    const img = await sharp(file.data)
        .resize({ width: 400 })
        .toBuffer();

    const commonUuid = uuid();
    const generatedFilename = commonUuid + fileExt;
    const thumbnailGeneratedFilename = commonUuid + '-thumbnail' + fileExt;

    await blobService.createBlockBlobFromText(process.env.BLOB_CONTAINER,
        generatedFilename, file.data, blobOptions, err => { if (err) throw err; });
    await blobService.createBlockBlobFromText(process.env.BLOB_CONTAINER,
        thumbnailGeneratedFilename, img, blobOptions, err => { if (err) throw err; });

    const blobContainer = process.env.BLOB_CONTAINER;
    req.image = {
        uri: blobService.getUrl(blobContainer, generatedFilename),
        blobName: generatedFilename,
        thumbnailUri: blobService.getUrl(blobContainer, thumbnailGeneratedFilename),
        thumbnailBlobName: thumbnailGeneratedFilename,
    };
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