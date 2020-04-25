import mongoose from 'mongoose';
import moment from 'moment';
import Room from './models/room-model';
import Reservation from './models/reservation-model';
import User from './models/user-model';

/**
 * @param {mongoose.Types.ObjectId} roomId 
 */
const roomWithIdExists = async roomId => {
    return Room.exists({ _id: roomId });
}

/**
 * @param {mongoose.Types.ObjectId} reservationId 
 */
const reservationWithIdExists = async reservationId => {
    return Reservation.exists({ _id: reservationId });
}

/**
 * @param {mongoose.Types.ObjectId} userId 
 */
const userWithIdExists = async userId => {
    return User.exists({ _id: userId });
}

/**
 * @param {String} email 
 */
const userWithEmailExists = async email => {
    return User.exists({ email: email });
}

const getRoomIds = async () => {
    return Room.find({}).select('id');
}

/**
 * @param {Object} searchData 
 * @param {mongoose.Types.ObjectId} searchData.roomId
 * @param {Date} searchData.fromDate
 * @param {Date} searchData.toDate
 */
const getAcceptedReservationsForDateIntervalForRoom = async searchData => {
    return Reservation.find({
        roomId: roomId,
        status: "ACCEPTED",
        startDate: { $lte: dateInterval.endDate },
        endDate: { $gte: dateInterval.startDate }
    })
}

/**
 * @param {mongoose.Types.ObjectId} reservationId 
 * @param {String} newStatus 
 */
const changeReservationStatus = async (reservationId, newStatus) => {
    return Reservation.updateOne({ _id: reservationId },
        {
            $set: {
                status: newStatus,
                updateDate: moment.utc().toDate()
            }
        }
    );
}

/**
 * @param {mongoose.Types.ObjectId} roomId 
 * @param {mongoose.Types.ObjectId} reservationId 
 */
const rejectAllPendingAndSuccessReservationsForRoom = (roomId, reservationId) => {
    return Reservation.updateMany({
        roomId: roomId,
        "_id": {
            "$ne": reservationId
        },
        $or: [
            {
                status: "PENDING"
            },
            {
                status: "ACCEPTED"
            }
        ]
    }, {
        $set: {
            status: "REJECTED",
            updateDate: moment.utc().toDate()
        }
    });
}

/**
 * @param {mongoose.Types.ObjectId} roomId 
 * @param {Object} dateInterval
 * @param {Date} dateInterval.startDate
 * @param {Date} dateInterval.endDate
 */
const otherReservationOnGivenRoomAndDateIntervalExists = async (roomId, dateInterval) => {
    return Reservation.exists({
        "roomId": roomId,
        "status": "ACCEPTED",
        "startDate": { $lte: dateInterval.endDate },
        "endDate": { $gte: dateInterval.startDate }
    })
}

/**
 * @param {mongoose.Types.ObjectId} roomId 
 */
const getRoomPreview = async (roomId) => {
    return Room.findById(roomId)
        .select('_id name location capacity photoUrl pricePerDay amenities');
}

/**
 * @param {Array[mongoose.Types.ObjectId]} roomIds 
 */
const getRoomPreviews = async (roomIds) => {
    return Room.find({
        _id: {
            $in: roomIds
        }
    }).select('_id name location capacity photoUrl pricePerDay amenities');
}

/**
 * @param {Object} searchData
 * @param {String} searchData.fromDate
 * @param {String} searchData.toDate
 */
const getAvailableRoomIds = async (dateInterval) => {
    return Reservation.find({
        status: {
            $ne: "ACCEPTED"
        },
        fromDate: { $lte: dateInterval.fromDate },
        toDate: { $lte: dateInterval.toDate }
    }).select('_id');
}

/**
 * @param {Object} searchData 
 * @param {mongoose.Types.ObjectId} searchData.roomId
 * @param {Date} searchData.fromDate
 * @param {Date} searchData.toDate
 */
const getReservationsForRoom = async searchData => {
    return Reservation.find({
        roomId: searchData.roomId,
        status: "ACCEPTED",
        $and: [
            {
                fromDate: {
                    $gte: searchData.fromDate
                }
            },
            {
                toDate: {
                    $lte: searchData.toDate
                }
            }
        ]
    })
}

/**
 * @param {String} status 
 */
const getReservationsWithStatus = async status => {
    return Reservation
        .find({
            status: status
        })
        .select('id userId roomId fromDate toDate pricePerDay totalPrice status')
        .populate('user', 'email firstName lastName')
        .populate('room', 'name location phototoUrl');
}

/**
 * @param {mongoose.Types.ObjectId} userId 
 * @param {String} status 
 */
const getReservationsWithStatusForUser = async (userId, status) => {
    return Reservation.find({
        userId: userId,
        status: status
    }).select('id userId roomId fromDate toDate pricePerDay totalPrice status')
        .populate('user', 'email firstName lastName')
        .populate('room', 'name location phototoUrl');
}

module.exports = {
    roomWithIdExists,
    reservationWithIdExists,
    userWithIdExists,
    userWithEmailExists,
    getRoomIds,
    getAcceptedReservationsForDateIntervalForRoom,
    changeReservationStatus,
    rejectAllPendingAndSuccessReservationsForRoom,
    otherReservationOnGivenRoomAndDateIntervalExists,
    getRoomPreview,
    getRoomPreviews,
    getAvailableRoomIds,
    getReservationsForRoom,
    getReservationsWithStatus,
    getReservationsWithStatusForUser
};