import mongoose from 'mongoose';
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
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'room'
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

reservationSchema.virtual('user', {
    ref: 'user',
    localField: 'userId',
    foreignField: '_id',
    justOne: true
});

reservationSchema.virtual('room', {
    ref: 'room',
    localField: 'roomId',
    foreignField: '_id',
    justOne: true
});

export default ReservationModel;