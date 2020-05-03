import mongoose from 'mongoose';
import moment from 'moment';
import Reservation from './models/reservation-model';
import Room from './models/room-model';

// TODO: Change name to SetReservationStatus
/**
 * @param {mongoose.Types.ObjectId} reservationId 
 * @param {String} newStatus 
 */
export const changeReservationStatus = async (reservationId, newStatus) => {
    return Reservation.findByIdAndUpdate(reservationId, {
        $set: {
            status: newStatus,
            updateDate: moment.utc().toDate()
        }
    });
}

// TODO: PRICES
/**
 * @param {Object} dateInterval
 * @param {String} dateInterval.fromDate
 * @param {String} dateInterval.toDate
 */
export const getAvailableRoomPreviews = async dateInterval => {
    const roomIds = (await Room.find({}).select('id'))
        .map(record => record._id);

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
 * @param {String} status 
 */
export const getReservationsWithStatus = async status => {
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
export const getReservationsWithStatusForUser = async (userId, status) => {
    return Reservation.find({
        userId: userId,
        status: status
    }).select('id userId roomId fromDate toDate pricePerDay totalPrice status')
        .populate('user', 'email firstName lastName')
        .populate('room', 'name location phototoUrl');
}

// TODO: To be moved
export const withTransaction = async action => {
    let session = null;
    try {
        session = await mongoose.connection.startSession();
        session.startTransaction();

        await action(session);

        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
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

// TODO: To remove
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