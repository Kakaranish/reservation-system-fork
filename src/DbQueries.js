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
 * @param {ObjectID} roomId
 */
const reservationWithIdExists = async (db, reservationId) => {
    return await db.collection('reservations').findOne({ "_id": reservationId }) ? true : false;
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
    const startDate = dateInterval.startDate;
    const endDate = dateInterval.endDate;
    const reservation = await db.collection('reservations').findOne({
        "roomId": roomId,
        $or: [
            {
                $and: [
                    { "startDate": { $gte: startDate } },
                    { "startDate": { $lte: endDate } }
                ]
            },
            {
                "startDate": { $lte: startDate },
                "endDate": { $gte: startDate }
            }
        ]
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
        availability: 0,
        photo: 0
    });
    return (await roomsCursor.toArray()).map(x => x["_id"]);
};

const getAvailableRoomsIds = async (db, dateInterval) => {
    const roomIds = await getRoomsIds(db);
    let availableRooms = [];
    await Promise.all(roomIds.map(async (roomId) => {
        const isAvailable = ! await otherReservationOnGivenRoomAndDateIntervalExists(db, roomId, dateInterval);
        if (isAvailable) availableRooms.push(roomId);
    }));
    return availableRooms;
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
        pricePerday: room.pricePerDay,
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
    getRoomPreviews
};