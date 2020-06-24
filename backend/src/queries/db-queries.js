import mongoose from 'mongoose';
import moment from 'moment';
import Reservation from '../models/reservation-model';
import Room from '../models/room-model';
import ExistReservationQueryBuilder from './ExistReservationQueryBuilder';

/**
 * @param {Function} action 
 */
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
 * @param {mongoose.Types.ObjectId} reservationId 
 * @param {String} newStatus 
 */
export const setReservationStatus = async (reservationId, newStatus) => {
    return Reservation.findByIdAndUpdate(reservationId, {
        $set: {
            status: newStatus,
            updateDate: moment.utc().toDate()
        }
    });
}

/**
 * @param {Object} searchData
 * @param {Date} searchData.fromDate
 * @param {Date} searchData.toDate
 * @param {number} searchData.fromPrice
 * @param {number} searchData.toPrice
 */
export const getAvailableRoomPreviews = async searchData => {
    const roomIds = (await Room.find({}).select('id'))
        .map(record => record._id);

    const availableRoomIds = [];
    await Promise.all(roomIds.map(async roomId => {
        const queryBuilder = new ExistReservationQueryBuilder();
        const isAvailable = !await queryBuilder
            .overlappingDateIterval(searchData.fromDate, searchData.toDate)
            .withRoomId(roomId)
            .build();
        if (isAvailable) availableRoomIds.push(roomId);
    }));

    return await Room.find({
        _id: { $in: availableRoomIds },
        pricePerDay: {
            $gte: searchData.fromPrice,
            $lte: searchData.toPrice
        }
    }).select('_id name location capacity pricePerDay amenities image');
}