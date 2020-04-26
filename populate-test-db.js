import mongoose from 'mongoose';
import User from './src/models/user-model';
import Room from './src/models/room-model';
import Reservation from './src/models/reservation-model';
import moment, { ISO_8601 } from 'moment';

const parseObjectId = require('./src/common').parseObjectId;
require('dotenv').config();

const currentDbVarName = process.env.MONGO_CURRENT_DB_URI;
const dbName = process.env.DB_NAME_TEST;

mongoose.connect(process.env[currentDbVarName], {
    dbName: dbName,
    useNewUrlParser: true,
    useUnifiedTopology: true
});
mongoose.connection.dropDatabase();

const rooms = [
    new Room({
        _id: parseObjectId('5ea55125e95cc70df70870f7'),
        name: "Conference Room #1",
        location: "Krakow",
        capacity: 20,
        pricePerDay: 300,
        description: "Some description 1",
        amenities: [
            "amtTV", "amtMicrophone", "amtProjector"
        ],
        dows: [
            "dowMonday", "dowTuesday", "dowThursday", "dowFriday", "dowSunday"
        ],
        photoUrl: '/some/path'
    }),
    new Room({
        _id: parseObjectId('5ea551627698ad8c1c5a4759'),
        name: "Conference Room #2",
        location: "Warsaw",
        capacity: 10,
        pricePerDay: 400.99,
        description: "Some description 2",
        amenities: [
            "amtTV", "amtMicrophone", "amtProjector", "amtPhone"
        ],
        dows: [
            "dowMonday", "dowThursday", "dowFriday"
        ],
        photoUrl: '/some/path2'
    })
];

const users = [
    new User({
        _id: parseObjectId('5ea54fe32d431462827c2c5e'),
        email: "user@mail.com",
        password: "$2a$10$vI8aWBnW3fID.ZQ4/zo1G.a29kwv8V6jU5L4nb.F5/EJxDqZ/w6DG", // hashed '123'
        firstName: "user",
        lastName: "user-lastname",
        role: "USER"
    }),
    new User({
        _id: mongoose.Types.ObjectId("5ea5501566815162f73bad80"),
        email: "admin@mail.com",
        password: "$2a$10$vI8aWBnW3fID.ZQ4/zo1G.a29kwv8V6jU5L4nb.F5/EJxDqZ/w6DG", // hashed '123'
        firstName: 'admin',
        lastName: 'admin-lastname',
        role: "ADMIN"
    })
];

/*
    Room1: 14-15 | 17-18
    Room2: 16
*/
const reservations = [
    new Reservation({
        fromDate: moment('2020-04-14T00:00:00.000Z', ISO_8601).toDate(),
        toDate: moment('2020-04-15T00:00:00.000Z', ISO_8601).toDate(),
        userId: parseObjectId('5ea54fe32d431462827c2c5e'), // user1
        roomId: parseObjectId('5ea55125e95cc70df70870f7'), // room1
        pricePerDay: 300,
        totalPrice: 600,
        status: "ACCEPTED",
        createDate: moment('2020-04-15T10:00:00.000Z', ISO_8601).toDate(),
        updateDate: moment('2020-04-15T22:00:00.000Z', ISO_8601).toDate(),
    }),
    new Reservation({
        fromDate: moment('2020-04-17T00:00:00.000Z', ISO_8601).toDate(),
        toDate: moment('2020-04-18T00:00:00.000Z', ISO_8601).toDate(),
        userId: parseObjectId('5ea5501566815162f73bad80'), // user2
        roomId: parseObjectId('5ea55125e95cc70df70870f7'), // room1
        pricePerDay: 300,
        totalPrice: 600,
        status: "ACCEPTED",
        createDate: moment('2020-04-13T16:00:00.000Z', ISO_8601).toDate(),
        updateDate: moment('2020-04-14T17:00:00.000Z', ISO_8601).toDate(),
    }),
    new Reservation({
        fromDate: moment('2020-04-16T00:00:00.000Z', ISO_8601).toDate(),
        toDate: moment('2020-04-16T00:00:00.000Z', ISO_8601).toDate(),
        userId: parseObjectId('5ea5501566815162f73bad80'), // user2
        roomId: parseObjectId('5ea551627698ad8c1c5a4759'), // room1
        pricePerDay: 400,
        totalPrice: 400,
        status: "ACCEPTED",
        createDate: moment('2020-04-12T16:00:00.000Z', ISO_8601).toDate(),
        updateDate: moment('2020-04-12T16:00:00.000Z', ISO_8601).toDate(),
    }),
    // TO ACCEPT vvv
    new Reservation({
        _id: parseObjectId('5ea5dfe746ab3ac895676e8d'),
        fromDate: moment('2020-04-21T00:00:00.000Z', ISO_8601).toDate(),
        toDate: moment('2020-04-22T00:00:00.000Z', ISO_8601).toDate(),
        userId: parseObjectId('5ea5501566815162f73bad80'), // user2
        roomId: parseObjectId('5ea551627698ad8c1c5a4759'), // room1
        pricePerDay: 400,
        totalPrice: 400,
        status: "PENDING",
        createDate: moment('2020-04-12T16:00:00.000Z', ISO_8601).toDate(),
        updateDate: moment('2020-04-12T16:00:00.000Z', ISO_8601).toDate(),
    }),
    new Reservation({
        _id: parseObjectId('5ea5dfa9ee444b59962eed8b'),
        fromDate: moment('2020-04-21T00:00:00.000Z', ISO_8601).toDate(),
        toDate: moment('2020-04-22T00:00:00.000Z', ISO_8601).toDate(),
        userId: parseObjectId('5ea5501566815162f73bad80'), // user2
        roomId: parseObjectId('5ea551627698ad8c1c5a4759'), // room1
        pricePerDay: 400,
        totalPrice: 400,
        status: "PENDING",
        createDate: moment('2020-04-12T16:00:00.000Z', ISO_8601).toDate(),
        updateDate: moment('2020-04-12T16:00:00.000Z', ISO_8601).toDate(),
    }),
    new Reservation({
        _id: parseObjectId('5ea5e692c9cdf584830696fb'),
        fromDate: moment('2020-04-21T00:00:00.000Z', ISO_8601).toDate(),
        toDate: moment('2020-04-22T00:00:00.000Z', ISO_8601).toDate(),
        userId: parseObjectId('5ea5501566815162f73bad80'), // user2
        roomId: parseObjectId('5ea551627698ad8c1c5a4759'), // room1
        pricePerDay: 400,
        totalPrice: 400,
        status: "PENDING",
        createDate: moment('2020-04-12T16:00:00.000Z', ISO_8601).toDate(),
        updateDate: moment('2020-04-12T16:00:00.000Z', ISO_8601).toDate(),
    }),
    // TO REJECT1 vvv
    new Reservation({
        _id: parseObjectId('5ea5e134cbce7e8d149337c5'),
        fromDate: moment('2020-04-23T00:00:00.000Z', ISO_8601).toDate(),
        toDate: moment('2020-04-24T00:00:00.000Z', ISO_8601).toDate(),
        userId: parseObjectId('5ea5501566815162f73bad80'), // user2
        roomId: parseObjectId('5ea551627698ad8c1c5a4759'), // room1
        pricePerDay: 400,
        totalPrice: 400,
        status: "PENDING",
        createDate: moment('2020-04-12T16:00:00.000Z', ISO_8601).toDate(),
        updateDate: moment('2020-04-12T16:00:00.000Z', ISO_8601).toDate(),
    }),
    // TO REJECT2 vvv
    new Reservation({
        _id: parseObjectId('5ea5e6ae7c6670faf3e4806d'),
        fromDate: moment('2020-04-23T00:00:00.000Z', ISO_8601).toDate(),
        toDate: moment('2020-04-24T00:00:00.000Z', ISO_8601).toDate(),
        userId: parseObjectId('5ea5501566815162f73bad80'), // user2
        roomId: parseObjectId('5ea551627698ad8c1c5a4759'), // room1
        pricePerDay: 400,
        totalPrice: 400,
        status: "ACCEPTED",
        createDate: moment('2020-04-12T16:00:00.000Z', ISO_8601).toDate(),
        updateDate: moment('2020-04-12T16:00:00.000Z', ISO_8601).toDate(),
    }),
    // TO REJECT2 vvv
    new Reservation({
        _id: parseObjectId('5ea5e15130d8031744b3f00f'),
        fromDate: moment('2020-04-23T00:00:00.000Z', ISO_8601).toDate(),
        toDate: moment('2020-04-24T00:00:00.000Z', ISO_8601).toDate(),
        userId: parseObjectId('5ea5501566815162f73bad80'), // user2
        roomId: parseObjectId('5ea551627698ad8c1c5a4759'), // room1
        pricePerDay: 400,
        totalPrice: 400,
        status: "PENDING",
        createDate: moment('2020-04-12T16:00:00.000Z', ISO_8601).toDate(),
        updateDate: moment('2020-04-12T16:00:00.000Z', ISO_8601).toDate(),
    }),
];

// -- /room/:roomId/reservations

const roomForGettingReservation = new Room({
    _id: parseObjectId('5ea5e3423724e5ff90e7df45'),
    name: "Room to get reservations",
    location: "Krakow",
    capacity: 20,
    pricePerDay: 300,
    description: "Some description 1",
    amenities: [
        "amtTV", "amtMicrophone", "amtProjector"
    ],
    dows: [
        "dowMonday", "dowTuesday", "dowThursday", "dowFriday", "dowSunday"
    ],
    photoUrl: '/some/path'
});
const reservationsForRoom = [
    new Reservation({
        _id: parseObjectId('5ea5e6b2f0322ac00ff284ac'),
        fromDate: moment('2020-05-01T00:00:00.000Z', ISO_8601).toDate(),
        toDate: moment('2020-05-01T00:00:00.000Z', ISO_8601).toDate(),
        userId: parseObjectId('5ea5501566815162f73bad80'), // user2
        roomId: parseObjectId('5ea5e3423724e5ff90e7df45'),
        pricePerDay: 400,
        totalPrice: 400,
        status: "ACCEPTED",
        createDate: moment('2020-04-12T16:00:00.000Z', ISO_8601).toDate(),
        updateDate: moment('2020-04-12T16:00:00.000Z', ISO_8601).toDate(),
    }),
    new Reservation({
        _id: parseObjectId('5ea5e3beb9f264420ea8799d'),
        fromDate: moment('2020-05-02T00:00:00.000Z', ISO_8601).toDate(),
        toDate: moment('2020-05-02T00:00:00.000Z', ISO_8601).toDate(),
        userId: parseObjectId('5ea5501566815162f73bad80'), // user2
        roomId: parseObjectId('5ea5e3423724e5ff90e7df45'),
        pricePerDay: 400,
        totalPrice: 400,
        status: "ACCEPTED",
        createDate: moment('2020-04-12T16:00:00.000Z', ISO_8601).toDate(),
        updateDate: moment('2020-04-12T16:00:00.000Z', ISO_8601).toDate(),
    })
];
(async () => {
    await roomForGettingReservation.save();
    await Promise.all(reservationsForRoom.map(async (reservation) => {
        await reservation.save()
    }));
})();

const populate = async () => {
    await Promise.all(rooms.map(async (room) => {
        await room.save()
    }));

    await Promise.all(users.map(async (user) => {
        await user.save()
    }));

    await Promise.all(reservations.map(async (reservation) => {
        await reservation.save()
    }));

    await mongoose.connection.close();
}

populate();

console.log(`OK - '${dbName}' has been populated.`);