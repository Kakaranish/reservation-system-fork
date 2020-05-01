import mongoose from 'mongoose';
import moment from 'moment';
import Room from './models/room-model';
import Reservation from './models/reservation-model';

const getRoomIds = async () => {
    return Room.find({}).select('id');
}

// TODO: Change name to SetReservationStatus

/**
 * @param {mongoose.Types.ObjectId} reservationId 
 * @param {String} newStatus 
 */
const changeReservationStatus = async (reservationId, newStatus) => {
    return Reservation.updateOne({ _id: reservationId }, {
        $set: {
            status: newStatus,
            updateDate: moment.utc().toDate()
        }
    });
}

// /**
//  * @param {Object} searchData
//  * @param {mongoose.Types.ObjectId} searchData.roomId 
//  * @param {mongoose.Types.ObjectId} searchData.reservationId 
//  */
// const rejectAllPendingAndSuccessReservationsForRoom = async searchData => {
//     return Reservation.updateMany({
//         roomId: searchData.roomId,
//         "_id": {
//             "$ne": searchData.reservationId
//         },
//         $or: [
//             {
//                 status: "PENDING"
//             },
//             {
//                 status: "ACCEPTED"
//             }
//         ]
//     }, {
//         $set: {
//             status: "REJECTED",
//             updateDate: moment.utc().toDate()
//         }
//     });
// }



// return Reservation.exists({
//     roomId: searchData.roomId,
//     status: "ACCEPTED",
//     fromDate: { $lte: searchData.toDate },
//     toDate: { $gte: searchData.fromDate }
// })

/**
* @param {Object} searchData
* @param {mongoose.Types.ObjectId} searchData.excludedReservationId 
* @param {mongoose.Types.ObjectId} searchData.roomId
* @param {Date} searchData.fromDate
* @param {Date} searchData.toDate
*/
const rejectReservations = async searchData => {
    return Reservation.updateMany({
        roomId: searchData.roomId,
        _id: {
            $ne: searchData.excludedReservationId
        },
        status: "PENDING",
        fromDate: { $lte: searchData.toDate },
        toDate: { $gte: searchData.fromDate }
    }, {
        $set: {
            status: "REJECTED",
            updateDate: moment.utc().toDate()
        }
    });
}

/**
 * @param {Object} searchData
 * @param {mongoose.Types.ObjectId} searchData.roomId 
 * @param {mongoose.Types.ObjectId} searchData.reservationId 
 */
const rejectAllPendingAndSuccessReservationsForRoom = async (searchData, opts = {}) => {
    return Reservation.updateMany({
        roomId: searchData.roomId,
        "_id": {
            "$ne": searchData.reservationId
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
    }, opts);
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
        const isAvailable = ! await acceptedReservationExists({
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
const acceptedReservationExists = async searchData => {
    return Reservation.exists({
        roomId: searchData.roomId,
        status: "ACCEPTED",
        fromDate: { $lte: searchData.toDate },
        toDate: { $gte: searchData.fromDate }
    })
}

// Without validation

/**
 * @param {Object} searchData 
 * @param {String} searchData.withStatus
 * @param {mongoose.Types.ObjectId} searchData.forRoomWithId
 * @param {Object} searchData.forDateInterval
 * @param {Date} searchData.forDateInterval.start
 * @param {Date} searchData.forDateInterval.end
 */
const reservationExists = async searchData => {
    const withStatus = searchData.withStatus || "ACCEPTED";
    const forRoomWithId = searchData.forRoomWithId;
    const forDateInterval = {
        start: searchData.forDateInterval.start || moment.utc().startOf('day').toDate(),
        end: searchData.forDateInterval.end || moment.utc().startOf('day').toDate()
    };

    return Reservation.exists({
        roomId: forRoomWithId,
        status: withStatus,
        fromDate: { $lte: forDateInterval.end },
        toDate: { $gte: forDateInterval.start }
    });
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
    otherReservationOnGivenRoomAndDateIntervalExists: acceptedReservationExists,
    getRoomPreview,
    getRoomPreviews,
    getAvailableRoomIds,
    getReservationsForRoom,
    getReservationsWithStatus,
    getReservationsWithStatusForUser,
    getAvailableRoomPreviews,
    getReservationsForDateIntervalForRoomWithStatus,
    getPopulatedReservationsForDateIntervalForRoomWithStatus,
    rejectReservations,
    reservationExists
};