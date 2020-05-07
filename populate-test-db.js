import mongoose from 'mongoose';
import User from './src/models/user-model';
import Room from './src/models/room-model';
import Reservation from './src/models/reservation-model';
import moment, { ISO_8601 } from 'moment';
import { parseObjectId } from './src/common';
import { connectTestDb } from './src/mongo-utils';
import { createRefreshToken } from './src/auth/auth-utils';

require('dotenv').config();

(async () => {

    // -------------------------------------------------------------------------
    // -- CONFIG

    await connectTestDb();
    await mongoose.connection.dropDatabase();

    // -------------------------------------------------------------------------
    // -- HELPERS

    const dummyInterval = {
        fromDate: moment('2020-04-01T00:00:00.000Z', ISO_8601).toDate(),
        toDate: moment('2020-04-30T00:00:00.000Z', ISO_8601).toDate()
    };

    /**
     * @param {String} userId 
     * @param {String} roomId 
     */
    const createDummyReservation = (userId, roomId) => {
        return new Reservation({
            _id: mongoose.Types.ObjectId(),
            fromDate: dummyInterval.fromDate,
            toDate: dummyInterval.toDate,
            userId: userId,
            roomId: roomId,
            pricePerDay: 400,
            totalPrice: 400,
            status: "ACCEPTED",
            createDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate(),
            updateDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate()
        });
    }

    /**
     * @param {String} id
     * @param {String} userId 
     * @param {String} roomId 
     */
    const createDummyReservationWithId = (id, userId, roomId) => {
        return new Reservation({
            _id: parseObjectId(id),
            fromDate: dummyInterval.fromDate,
            toDate: dummyInterval.toDate,
            userId: parseObjectId(userId),
            roomId: parseObjectId(roomId),
            pricePerDay: 400,
            totalPrice: 400,
            status: "ACCEPTED",
            createDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate(),
            updateDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate()
        });
    }

    // -------------------------------------------------------------------------
    // -- COMMON

    const user = new User({
        _id: parseObjectId('5ea54fe32d431462827c2c5e'),
        email: "user@mail.com",
        password: "$2a$10$vI8aWBnW3fID.ZQ4/zo1G.a29kwv8V6jU5L4nb.F5/EJxDqZ/w6DG", // hashed '123'
        firstName: "user",
        lastName: "user-lastname",
        role: "USER"
    });
    await createRefreshToken(user);


    const admin = new User({
        _id: mongoose.Types.ObjectId("5ea5501566815162f73bad80"),
        email: "admin@mail.com",
        password: "$2a$10$vI8aWBnW3fID.ZQ4/zo1G.a29kwv8V6jU5L4nb.F5/EJxDqZ/w6DG", // hashed '123'
        firstName: 'admin',
        lastName: 'admin-lastname',
        role: "ADMIN"
    });
    await createRefreshToken(admin);

    await User.insertMany([
        user, admin
    ]);

    // -------------------------------------------------------------------------
    // -- /rooms

    {
        const room1 = new Room({
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
        });

        await room1.save();

        await Reservation.insertMany([
            new Reservation({
                fromDate: moment('2020-04-03T00:00:00.000Z', ISO_8601).toDate(),
                toDate: moment('2020-04-03T00:00:00.000Z', ISO_8601).toDate(),
                userId: user._id,
                roomId: room1._id,
                pricePerDay: 300,
                totalPrice: 600,
                status: "ACCEPTED",
                createDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate(),
                updateDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate()
            }),
            new Reservation({
                fromDate: moment('2020-04-05T00:00:00.000Z', ISO_8601).toDate(),
                toDate: moment('2020-04-30T00:00:00.000Z', ISO_8601).toDate(),
                userId: user._id,
                roomId: room1._id,
                pricePerDay: 300,
                totalPrice: 600,
                status: "ACCEPTED",
                createDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate(),
                updateDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate()
            })
        ]);

        const room2 = new Room({
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
        });
        await room2.save();

        await Reservation.insertMany([
            new Reservation({
                fromDate: moment('2020-04-02T00:00:00.000Z', ISO_8601).toDate(),
                toDate: moment('2020-04-04T00:00:00.000Z', ISO_8601).toDate(),
                userId: user._id,
                roomId: room2._id,
                pricePerDay: 300,
                totalPrice: 600,
                status: "ACCEPTED",
                createDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate(),
                updateDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate()
            }),
            new Reservation({
                fromDate: moment('2020-04-06T00:00:00.000Z', ISO_8601).toDate(),
                toDate: moment('2020-04-30T00:00:00.000Z', ISO_8601).toDate(),
                userId: user._id,
                roomId: room2._id,
                pricePerDay: 300,
                totalPrice: 600,
                status: "ACCEPTED",
                createDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate(),
                updateDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate()
            })
        ]);
    }

    // -------------------------------------------------------------------------
    // -- /room/:roomId/reservations
    // -- Getting reservations for room 

    {
        const room = new Room({
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
            photoUrl: '/some/path/5ea5e3423724e5ff90e7df45'
        });
        await room.save();

        await Reservation.insertMany([
            new Reservation({
                _id: parseObjectId('5ea5e6b2f0322ac00ff284ac'),
                fromDate: moment('2020-05-01T00:00:00.000Z', ISO_8601).toDate(),
                toDate: moment('2020-05-01T00:00:00.000Z', ISO_8601).toDate(),
                userId: user._id,
                roomId: room._id,
                pricePerDay: 400,
                totalPrice: 400,
                status: "ACCEPTED",
                createDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate(),
                updateDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate()
            }),
            new Reservation({
                _id: parseObjectId('5ea5e3beb9f264420ea8799d'),
                fromDate: moment('2020-05-02T00:00:00.000Z', ISO_8601).toDate(),
                toDate: moment('2020-05-02T00:00:00.000Z', ISO_8601).toDate(),
                userId: user._id,
                roomId: room._id,
                pricePerDay: 400,
                totalPrice: 400,
                status: "ACCEPTED",
                createDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate(),
                updateDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate()
            }),
            createDummyReservation(user._id, room._id)
        ]);
    }


    // -------------------------------------------------------------------------
    // /reservation/create

    {
        const room = await new Room({
            _id: parseObjectId('5ea6fda6e8ecbe2dad9f1c23'),
            name: "Conference Room 5ea6fda6e8ecbe2dad9f1c23",
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
        await room.save();

        await Reservation.insertMany([
            new Reservation({
                _id: parseObjectId('5eac28c830c2bd25d24c4cf4'),
                fromDate: moment('2020-05-01T00:00:00.000Z', ISO_8601).toDate(),
                toDate: moment('2020-05-01T00:00:00.000Z', ISO_8601).toDate(),
                userId: user._id,
                roomId: room._id,
                pricePerDay: 400,
                totalPrice: 400,
                status: "ACCEPTED",
                createDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate(),
                updateDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate()
            })
        ]);

        await createDummyReservation(user._id, room._id).save();
    }

    // -------------------------------------------------------------------------
    // POST /reservation/accept

    {
        const room = await new Room({
            _id: parseObjectId('5eac1e7e7d84dd4f74b8cd97'),
            name: "Conference Room 5eac1e7e7d84dd4f74b8cd97",
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
        await room.save();

        await Reservation.insertMany([
            // Pending reservation cant be accepted because other reservation is accepted
            new Reservation({
                _id: parseObjectId('5eac2249372b7676ffb9c88e'),
                fromDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate(),
                toDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate(),
                userId: user._id,
                roomId: room._id,
                pricePerDay: 400,
                totalPrice: 400,
                status: "PENDING",
                createDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate(),
                updateDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate()
            }),
            new Reservation({
                _id: parseObjectId('5eac2251352b07932183ee63'),
                fromDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate(),
                toDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate(),
                userId: user._id,
                roomId: room._id,
                pricePerDay: 400,
                totalPrice: 400,
                status: "ACCEPTED",
                createDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate(),
                updateDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate()
            }),
            // Accept reservation and then reject others pending
            new Reservation({
                _id: parseObjectId('5eac22acebac85f7dd117a14'),
                fromDate: moment('2020-01-02T00:00:00.000Z', ISO_8601).toDate(),
                toDate: moment('2020-01-02T00:00:00.000Z', ISO_8601).toDate(),
                userId: user._id,
                roomId: room._id,
                pricePerDay: 400,
                totalPrice: 400,
                status: "PENDING",
                createDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate(),
                updateDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate()
            }),
            new Reservation({
                _id: parseObjectId('5eac22a4a4fbab8bc52230a3'),
                fromDate: moment('2020-01-02T00:00:00.000Z', ISO_8601).toDate(),
                toDate: moment('2020-01-02T00:00:00.000Z', ISO_8601).toDate(),
                userId: user._id,
                roomId: room._id,
                pricePerDay: 400,
                totalPrice: 400,
                status: "PENDING",
                createDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate(),
                updateDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate()
            }),
            new Reservation({
                _id: parseObjectId('5eac358cac8b270b1c1863f0'),
                fromDate: moment('2020-01-02T00:00:00.000Z', ISO_8601).toDate(),
                toDate: moment('2020-01-02T00:00:00.000Z', ISO_8601).toDate(),
                userId: user._id,
                roomId: room._id,
                pricePerDay: 400,
                totalPrice: 400,
                status: "CANCELLED",
                createDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate(),
                updateDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate()
            }),
            // Reservation already accepted
            new Reservation({
                _id: parseObjectId('5eac23434fcb4261665be561'),
                fromDate: moment('2020-01-03T00:00:00.000Z', ISO_8601).toDate(),
                toDate: moment('2020-01-03T00:00:00.000Z', ISO_8601).toDate(),
                userId: user._id,
                roomId: room._id,
                pricePerDay: 400,
                totalPrice: 400,
                status: "ACCEPTED",
                createDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate(),
                updateDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate()
            }),

            createDummyReservation(user._id, room._id)
        ]);
    }

    // -------------------------------------------------------------------------
    // DELETE /reservation
    {
        const room = new Room({
            _id: parseObjectId('5eadb09516226578eaebd819'),
            name: "Conference Room 5eadb09516226578eaebd819",
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
        })
        await room.save();

        await Reservation.insertMany([
            new Reservation({
                _id: parseObjectId('5eadb20560fdcfdd1dd4fc10'),
                fromDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate(),
                toDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate(),
                userId: user._id,
                roomId: room._id,
                pricePerDay: 400,
                totalPrice: 400,
                status: "ACCEPTED",
                createDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate(),
                updateDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate()
            }),

            createDummyReservation(user._id, room._id)
        ]);
    }

    // -------------------------------------------------------------------------
    // GET /room/:roomId/reservations/accepted
    {
        const room = new Room({
            _id: parseObjectId('5eae87863a9e88493afd0e58'),
            name: "Conference Room 5eae87863a9e88493afd0e58",
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
        })
        await room.save();

        await Reservation.insertMany([
            new Reservation({
                _id: parseObjectId('5eae87f7e1d6c41dba3a76b0'),
                fromDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate(),
                toDate: moment('2020-01-03T00:00:00.000Z', ISO_8601).toDate(),
                userId: user._id,
                roomId: room._id,
                pricePerDay: 400,
                totalPrice: 400,
                status: "ACCEPTED",
                createDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate(),
                updateDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate()
            }),
            new Reservation({
                _id: parseObjectId('5eae87fef13c8a4a4302dcc6'),
                fromDate: moment('2020-01-05T00:00:00.000Z', ISO_8601).toDate(),
                toDate: moment('2020-01-07T00:00:00.000Z', ISO_8601).toDate(),
                userId: user._id,
                roomId: room._id,
                pricePerDay: 400,
                totalPrice: 400,
                status: "ACCEPTED",
                createDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate(),
                updateDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate()
            }),
            new Reservation({
                _id: parseObjectId('5eae880504a5017179988635'),
                fromDate: moment('2020-01-08T00:00:00.000Z', ISO_8601).toDate(),
                toDate: moment('2020-01-08T00:00:00.000Z', ISO_8601).toDate(),
                userId: user._id,
                roomId: room._id,
                pricePerDay: 400,
                totalPrice: 400,
                status: "ACCEPTED",
                createDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate(),
                updateDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate()
            }),
            createDummyReservation(user._id, room._id)
        ]);
    }

    // -------------------------------------------------------------------------
    // POST /reservation/reject
    {
        const room = new Room({
            _id: parseObjectId('5eae95c0479a93ffbbc6550e'),
            name: "Conference Room 5eae95c0479a93ffbbc6550e",
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
        })
        await room.save();

        await Reservation.insertMany([
            new Reservation({
                _id: parseObjectId('5eae965024496e1a07f59774'),
                fromDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate(),
                toDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate(),
                userId: user._id,
                roomId: room._id,
                pricePerDay: 400,
                totalPrice: 400,
                status: "ACCEPTED",
                createDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate(),
                updateDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate()
            }),

            createDummyReservation(user._id, room._id)
        ]);
    }

    // -------------------------------------------------------------------------
    // POST /reservation/cancel
    {
        const room = new Room({
            _id: parseObjectId('5eae9e302b082a4e75a8ff8e'),
            name: "Conference Room 5eae95c0479a93ffbbc6550e",
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
        })
        await room.save();

        await Reservation.insertMany([
            new Reservation({
                _id: parseObjectId('5eae9e372a81fdb8b32c8380'),
                fromDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate(),
                toDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate(),
                userId: user._id,
                roomId: room._id,
                pricePerDay: 400,
                totalPrice: 400,
                status: "ACCEPTED",
                createDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate(),
                updateDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate()
            }),

            createDummyReservation(user._id, room._id)
        ]);
    }

    // -------------------------------------------------------------------------
    // GET /user/reservations

    {
        const someUser = new User({
            _id: parseObjectId('5eaed6dbe29cf07a4caf2993'),
            email: "5eaed6dbe29cf07a4caf2993@mail.com",
            password: "$2a$10$vI8aWBnW3fID.ZQ4/zo1G.a29kwv8V6jU5L4nb.F5/EJxDqZ/w6DG", // hashed '123'
            firstName: "5eaed6dbe29cf07a4caf2993",
            lastName: "5eaed6dbe29cf07a4caf2993-lastname",
            role: "USER"
        });
        await someUser.save();

        const room = new Room({
            _id: parseObjectId('5eaed70a36fede718a526ecf'),
            name: "Conference Room 5eaed70a36fede718a526ecf",
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
        })
        await room.save();

        const room2 = new Room({
            _id: parseObjectId('5eaed7712abd17338aa9ec77'),
            name: "Conference Room 5eaed7712abd17338aa9ec77",
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
        })
        await room2.save();

        await Reservation.insertMany([
            new Reservation({
                _id: parseObjectId('5eaed7106c51add6137165bf'),
                fromDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate(),
                toDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate(),
                userId: someUser._id,
                roomId: room._id,
                pricePerDay: 400,
                totalPrice: 400,
                status: "ACCEPTED",
                createDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate(),
                updateDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate()
            }),

            new Reservation({
                _id: parseObjectId('5eaed71f226ebfcca1ffe3d2'),
                fromDate: moment('2020-01-02T00:00:00.000Z', ISO_8601).toDate(),
                toDate: moment('2020-01-03T00:00:00.000Z', ISO_8601).toDate(),
                userId: someUser._id,
                roomId: room2._id,
                pricePerDay: 400,
                totalPrice: 400,
                status: "ACCEPTED",
                createDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate(),
                updateDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate()
            }),

            new Reservation({
                _id: parseObjectId('5eaed75c69523d30e9fd8c32'),
                fromDate: moment('2020-01-02T00:00:00.000Z', ISO_8601).toDate(),
                toDate: moment('2020-01-03T00:00:00.000Z', ISO_8601).toDate(),
                userId: someUser._id,
                roomId: room._id,
                pricePerDay: 400,
                totalPrice: 400,
                status: "REJECTED",
                createDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate(),
                updateDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate()
            }),

            // Dummy
            new Reservation({
                _id: parseObjectId('5eaed969c8c9d41e955920c0'),
                fromDate: dummyInterval.fromDate,
                toDate: dummyInterval.toDate,
                userId: someUser._id,
                roomId: room._id,
                pricePerDay: 400,
                totalPrice: 400,
                status: "ACCEPTED",
                createDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate(),
                updateDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate()
            }),

            // Dummy
            new Reservation({
                _id: parseObjectId('5eaedda00c360c503ef1831e'),
                fromDate: dummyInterval.fromDate,
                toDate: dummyInterval.toDate,
                userId: someUser._id,
                roomId: room2._id,
                pricePerDay: 400,
                totalPrice: 400,
                status: "ACCEPTED",
                createDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate(),
                updateDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate()
            })
        ]);
    }

    // -------------------------------------------------------------------------
    // GET /user/reservations

    {
        const room = new Room({
            _id: parseObjectId('5eaee6bb71194629d5f50140'),
            name: "Conference Room 5eaee6bb71194629d5f50140",
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
        await room.save();

        await Reservation.insertMany([
            new Reservation({
                _id: parseObjectId('5eaee6b6f43ee9c80fddca0f'),
                fromDate: moment('2019-01-01T00:00:00.000Z', ISO_8601).toDate(),
                toDate: moment('2019-01-01T00:00:00.000Z', ISO_8601).toDate(),
                userId: user._id,
                roomId: room._id,
                pricePerDay: 400,
                totalPrice: 400,
                status: "ACCEPTED",
                createDate: moment('2019-01-01T00:00:00.000Z', ISO_8601).toDate(),
                updateDate: moment('2019-01-01T00:00:00.000Z', ISO_8601).toDate()
            }),

            new Reservation({
                _id: parseObjectId('5eaee6b01808121f3ca90884'),
                fromDate: moment('2019-01-02T00:00:00.000Z', ISO_8601).toDate(),
                toDate: moment('2019-01-03T00:00:00.000Z', ISO_8601).toDate(),
                userId: user._id,
                roomId: room._id,
                pricePerDay: 400,
                totalPrice: 400,
                status: "ACCEPTED",
                createDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate(),
                updateDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate()
            }),

            new Reservation({
                _id: parseObjectId('5eaee6ad3b1c7302153d59a0'),
                fromDate: moment('2019-01-02T00:00:00.000Z', ISO_8601).toDate(),
                toDate: moment('2019-01-03T00:00:00.000Z', ISO_8601).toDate(),
                userId: user._id,
                roomId: room._id,
                pricePerDay: 400,
                totalPrice: 400,
                status: "REJECTED",
                createDate: moment('2019-01-01T00:00:00.000Z', ISO_8601).toDate(),
                updateDate: moment('2019-01-01T00:00:00.000Z', ISO_8601).toDate()
            }),

            createDummyReservation(user._id, room._id)
        ]);
    }

    // -------------------------------------------------------------------------
    // changeReservationStatus

    await new Reservation({
        _id: parseObjectId('5ea5ee95db7d4bdb587a6952'),
        fromDate: moment('2020-05-03T00:00:00.000Z', ISO_8601).toDate(),
        toDate: moment('2020-05-03T00:00:00.000Z', ISO_8601).toDate(),
        userId: parseObjectId('5ea5501566815162f73bad80'), // user2
        roomId: parseObjectId('5ea5e3423724e5ff90e7df45'),
        pricePerDay: 400,
        totalPrice: 400,
        status: "ACCEPTED",
        createDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate(),
        updateDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate()
    }).save()

    await mongoose.connection.close();

    const dbName = process.env.DB_NAME_TEST;
    console.log(`OK - '${dbName}' has been populated.`);
})();