import moment from 'moment';
import mongoose from 'mongoose';
import 'regenerator-runtime';

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