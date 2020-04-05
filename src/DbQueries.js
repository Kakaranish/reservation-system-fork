import { Db } from "mongodb";
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
 * @param {ObjectID} reservationId
 */
const changeReservationStatus = async (db, reservationId, newStatus) => {
    const reservation = await db.collection('reservations').findOne({
        "_id": reservationId
    });
    if (!reservation) return null;

    await db.collection('reservations').updateOne(
        { '_id': reservationId },
        { $set: { status: newStatus } }
    );
    return reservation
}

/**
 * @param {Db} db 
 * @param {ObjectID} roomId
 */
const rejectAllPendingReservationsForRoom = async (db, roomId) => {
    await db.collection('reservations').updateMany({
        roomId: roomId,
        status: "PENDING"
    }, {
        $set: {
            status: "REJECTED"
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
    const reservations = await db.collection('reservations').find({
        "roomId": searchData.roomId,
        "status": "ACCEPTED",
        $and: [
            { "fromDate": { $gte: searchData.fromDate } },
            { "toDate": { $lte: searchData.toDate } }
        ]
    }).toArray();
    console.log(reservations);
    return reservations;
};

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
    rejectAllPendingReservationsForRoom
};