import moment from 'moment';
import mongoose from 'mongoose';
import path from "path";
import { v4 as uuid } from 'uuid';
import azure from 'azure-storage';
import sharp from 'sharp';
import 'regenerator-runtime';

require('dotenv').config();

export const cookieSettings = process.env.NODE_ENV === 'development'
    ? {
        httpOnly: true,
        sameSite: 'lax',
    }
    : {
        httpOnly: true,
        sameSite: 'none',
        secure: true
    };

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
};

/**
 * 
 * @param {String} objectId 
 * @returns {mongoose.}
 */
export const parseObjectId = objectId => {
    return mongoose.Types.ObjectId.isValid(objectId)
        ? mongoose.Types.ObjectId(objectId)
        : null;
};

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
};

/**
 * @param {File} file 
 */
export const isImageType = file => {
    const fileExt = path.extname(file.name);
    const validImageTypes = ['.jpg', '.jpeg', '.png'];
    return validImageTypes.some(type => type === fileExt);
};

/**
 * @param {Object} image 
 * @param {String} image.blobName
 * @param {String} image.thumbnailBlobName
 */
export const deleteImage = async image => {
    const blobService = azure.createBlobService();
    blobService.deleteBlobIfExists(process.env.BLOB_CONTAINER, image.blobName,
        err => { if (err) console.log(err) });
    blobService.deleteBlobIfExists(process.env.BLOB_CONTAINER, image.thumbnailBlobName,
        err => { if (err) console.log(err) });
};

/**
 * @param {File} file 
 */
export const uploadImage = async file => {
    if (!file) throw Error('no image');

    const fileExt = path.extname(file.name);

    let blobOptions;
    if (fileExt === '.jpg' || fileExt === '.jpeg')
        blobOptions = { contentSettings: { contentType: 'image/jpeg' } }
    else if (fileExt === '.png')
        blobOptions = { contentSettings: { contentType: 'image/png' } };
    else throw Error('not image type');

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

    return {
        uri: blobService.getUrl(blobContainer, generatedFilename),
        blobName: generatedFilename,
        thumbnailUri: blobService.getUrl(blobContainer, thumbnailGeneratedFilename),
        thumbnailBlobName: thumbnailGeneratedFilename,
    };
};