import { Db } from "mongodb";
import moment from "moment";
/**
 * @param {Db} db 
 * @param {ObjectID} roomId
 */
const roomWithIdExists = async (db, roomId) => {
    return await db.collection('rooms').findOne({ "_id": roomId }) ? true : false;
};

/**
 * @param {Db} db 
 * @param {ObjectID} reservationId
 */
const reservationWithIdExists = async (db, reservationId) => {
    return await db.collection('reservations').findOne({ "_id": reservationId }) ? true : false;
};

/**
 * @param {Db} db 
 * @param {ObjectID} roomId
 */
const getAcceptedReservationsForDateIntervalForRoom = async (db, roomId, dateInterval) => {
    console.log(dateInterval)
    return await db.collection('reservations').find({
        roomId: roomId,
        status: "ACCEPTED",
        startDate: { $lte: dateInterval.endDate },
        endDate: { $gte: dateInterval.startDate }
    }).toArray();
}

/**
 * @param {Db} db 
 * @param {ObjectID} reservationId
 */
const changeReservationStatus = async (db, reservationId, newStatus) => {
    const reservation = await db.collection('reservations').findOne({
        "_id": reservationId
    });
    if (!reservation) return null;

    await db.collection('reservations').updateOne(
        { '_id': reservationId },
        {
            $set: {
                status: newStatus,
                updateDate: moment.utc().toDate()
            }
        }
    );
    return reservation
}

/**
 * @param {Db} db 
 * @param {ObjectID} roomId
 */
const rejectAllPendingAndSuccessReservationsForRoom = async (db, roomId, reservationId) => {
    await db.collection('reservations').updateMany({
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
};

/**
 * @param {Db} db 
 * @param {ObjectID} userId
 */
const userWithIdExists = async (db, userId) => {
    return await db.collection('users').findOne({ "_id": userId }) ? true : false;
};

/**
 * @param {Db} db 
 * @param {ObjectID} 
 */
const otherReservationOnGivenRoomAndDateIntervalExists = async (db, roomId, dateInterval) => {
    const reservation = await db.collection('reservations').findOne({
        "roomId": roomId,
        "status": "ACCEPTED",
        "startDate": { $lte: dateInterval.endDate },
        "endDate": { $gte: dateInterval.startDate }
    });
    return reservation ? true : false;
};

/**
 * @param {Db} db 
 * @returns {Array}
 */
const getRoomsIds = async db => {
    let roomsCursor = db.collection('rooms').find({}, '_id');
    roomsCursor.project({
        name: 0,
        description: 0,
        location: 0,
        capacity: 0,
        pricePerDay: 0,
        amenities: 0,
        dows: 0,
        photo: 0
    });
    return (await roomsCursor.toArray()).map(x => x["_id"]);
};

const getAvailableRoomsIds = async (db, searchData) => {
    const roomIds = await getRoomsIds(db);
    const dateInterval = {
        fromDate: searchData.fromDate,
        toDate: searchData.toDate
    };
    let availableRooms = [];

    await Promise.all(roomIds.map(async (roomId) => {
        const isAvailable = ! await otherReservationOnGivenRoomAndDateIntervalExists(db, roomId, dateInterval);
        if (isAvailable) availableRooms.push(roomId);
    }));
    return availableRooms;
};

/**
 * @param {Db} db
 */
const getReservationsForRoom = async (db, searchData) => {
    return await db.collection('reservations').find({
        "roomId": searchData.roomId,
        "status": "ACCEPTED",
        $and: [
            { "fromDate": { $gte: searchData.fromDate } },
            { "toDate": { $lte: searchData.toDate } }
        ]
    }).toArray();
};

/**
 * @param {Db} db
 * @param {String} status
 */
const getReservationsWithStatus = async (db, status) => {
    const reservations = await db.collection('reservations').aggregate([
        {
            "$match": {
                status: status
            }
        },
        {
            "$lookup": {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "user"
            }
        },
        {
            "$unwind": "$user"
        },
        {
            "$project": {
                "user._id": 0,
                "user.role": 0,
                "user.password": 0
            }
        },
        {
            "$lookup": {
                from: "rooms",
                localField: "roomId",
                foreignField: "_id",
                as: "room"
            }
        },
        {
            "$unwind": "$room"
        },
        {
            "$project": {
                "room._id": 0,
                "room.capacity": 0,
                "room.description": 0,
                "room.pricePerDay": 0,
                "room.amenities": 0,
                "room.dows": 0
            }
        }
    ]).toArray();

    return reservations.map(reservation => {
        return {
            "_id": reservation["_id"],
            startDate: reservation.startDate,
            endDate: reservation.endDate,
            pricePerDay: reservation.pricePerDay,
            totalPrice: reservation.totalPrice,
            userEmail: reservation.user.email,
            roomName: reservation.room.name,
            roomLocation: reservation.room.location,
            roomPhoto: reservation.room.photo
        }
    });
}

/**
 * @param {Db} db
 * @param {ObjectID} roomId 
 */
const getRoomPreview = async (db, roomId) => {
    const room = await db.collection('rooms').findOne({ "_id": roomId });
    const roomPreview = {
        _id: room["_id"],
        name: room.name,
        location: room.location,
        capacity: room.capacity,
        photo: room.photo,
        pricePerDay: room.pricePerDay,
        amenities: room.amenities
    }
    return roomPreview;
}
/**
 * @param {Db} db 
 * @param {Array} roomIds 
 */
const getRoomPreviews = async (db, roomIds) => {
    let roomPreviews = [];
    await Promise.all(roomIds.map(async (roomId) => {
        roomPreviews.push(await getRoomPreview(db, roomId));
    }));
    return roomPreviews;
}

/**
 * @param {Db} db 
 * @param {ObjectID} userId
 * @param {String} status
 */

const getReservationsWithStatusForUser = async (db, userId, status) => {
    return await db.collection('reservations').find({
        userId: userId,
        status: status
    }).toArray();
};

module.exports = {
    roomWithIdExists,
    userWithIdExists,
    reservationWithIdExists,
    otherReservationOnGivenRoomAndDateIntervalExists,
    getRoomsIds,
    getAvailableRoomsIds,
    getRoomPreviews,
    getReservationsForRoom,
    changeReservationStatus,
    rejectAllPendingAndSuccessReservationsForRoom,
    getReservationsWithStatus,
    getAcceptedReservationsForDateIntervalForRoom,
    getReservationsWithStatusForUser
};