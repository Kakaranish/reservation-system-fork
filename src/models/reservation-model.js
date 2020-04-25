import mongoose from 'mongoose';
import { ObjectID } from 'mongodb';
import moment from 'moment';
const Schema = mongoose.Schema;

const reservationSchema = new Schema({
    fromDate: {
        type: Date,
        required: true
    },
    toDate: {
        type: Date,
        required: true
    },
    userId: {
        type: ObjectID,
        required: true
    },
    roomId: {
        type: ObjectID,
        required: true
    },
    pricePerDay: {
        type: Number,
        get: v => v.toFixed(2),
        set: v => v.toFixed(2),
        alias: 'i'
    },
    totalPrice: {
        type: Number,
        get: v => v.toFixed(2),
        set: v => v.toFixed(2),
        alias: 'i'
    },
    status: {
        type: String,
        required: true
    },
    createDate: {
        type: Date,
        required: true
    },
    updateDate: {
        type: Date,
        required: true
    }
});

const ReservationModel = mongoose.model('reservation', reservationSchema);

export default ReservationModel;