import mongoose from 'mongoose';
import moment from 'moment';
import Room from './models/room-model';
import Reservation from './models/reservation-model';

const getRoomIds = async () => {
    return Room.find({}).select('id');
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

// TODO: !!!!!!!!!!!!!!
/**
 * @param {Object} dateInterval
 * @param {String} dateInterval.fromDate
 * @param {String} dateInterval.toDate
 */
const getAvailableRoomPreviews = async dateInterval => {
    const roomIds = (await getRoomIds()).map(record => record._id);

    let availableRoomIds = [];
    await Promise.all(roomIds.map(async (roomId) => {
        const isAvailable = ! await otherReservationOnGivenRoomAndDateIntervalExists({
            fromDate: dateInterval.fromDate,
            toDate: dateInterval.toDate,
            roomId: roomId
        });
        if (isAvailable) availableRoomIds.push(roomId);
    }));
    return await getRoomPreviews(availableRoomIds);
}

/**
 * @param {Object} searchData
 * @param {mongoose.Types.ObjectId} searchData.roomId 
 * @param {Date} searchData.fromDate
 * @param {Date} searchData.toDate
 */
const otherReservationOnGivenRoomAndDateIntervalExists = async searchData => {
    return Reservation.exists({
        roomId: searchData.roomId,
        status: "ACCEPTED",
        fromDate: { $lte: searchData.toDate },
        toDate: { $gte: searchData.fromDate }
    })
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
 * @param {Object} searchData 
 * @param {mongoose.Types.ObjectId} searchData.roomId
 * @param {Date} searchData.fromDate
 * @param {Date} searchData.toDate
 * @param {String} searchData.status
 */
const getReservationsForDateIntervalForRoomWithStatus = async searchData => {
    return Reservation.find({
        roomId: searchData.roomId,
        status: searchData.status,
        fromDate: { $lte: searchData.toDate },
        toDate: { $gte: searchData.fromDate }
    })
}

/**
 * @param {Object} searchData 
 * @param {mongoose.Types.ObjectId} searchData.roomId
 * @param {Date} searchData.fromDate
 * @param {Date} searchData.toDate
 * @param {String} searchData.status
 */
const getPopulatedReservationsForDateIntervalForRoomWithStatus = async searchData => {
    return Reservation.find({
        roomId: searchData.roomId,
        status: searchData.status,
        fromDate: { $lte: searchData.toDate },
        toDate: { $gte: searchData.fromDate }
    })
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
    getRoomIds,
    changeReservationStatus,
    rejectAllPendingAndSuccessReservationsForRoom,
    otherReservationOnGivenRoomAndDateIntervalExists,
    getRoomPreview,
    getRoomPreviews,
    getAvailableRoomIds,
    getReservationsForRoom,
    getReservationsWithStatus,
    getReservationsWithStatusForUser,
    getAvailableRoomPreviews,
    getReservationsForDateIntervalForRoomWithStatus,
    getPopulatedReservationsForDateIntervalForRoomWithStatus
};