import moment from 'moment';

/**
 * @param {Number | String} value 
 */
const preparePrice = value => {
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
const parseIsoDatetime = datetime => {
    const isoDatetime = moment.utc(datetime, moment.ISO_8601, true)
    return isoDatetime.isValid()
        ? isoDatetime
        : null;
}

exports.preparePrice = preparePrice;
exports.parseIsoDatetime = parseIsoDatetime;