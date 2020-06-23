import User from '../../src/models/user-model';
import Room from '../../src/models/room-model';
import Reservation from '../../src/models/reservation-model';
import { parseObjectId, parseIsoDatetime } from '../../src/common';
import * as Common from './populate-common';

export const populateReservations = (async () => {
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
                fromDate: parseIsoDatetime('2020-05-01T00:00:00.000Z').toDate(),
                toDate: parseIsoDatetime('2020-05-01T00:00:00.000Z').toDate(),
                userId: Common.user._id,
                roomId: room._id,
                pricePerDay: 400,
                totalPrice: 400,
                status: "ACCEPTED",
                createDate: parseIsoDatetime('2020-01-01T00:00:00.000Z').toDate(),
                updateDate: parseIsoDatetime('2020-01-01T00:00:00.000Z').toDate()
            }),
            new Reservation({
                _id: parseObjectId('5ea5e3beb9f264420ea8799d'),
                fromDate: parseIsoDatetime('2020-05-02T00:00:00.000Z').toDate(),
                toDate: parseIsoDatetime('2020-05-02T00:00:00.000Z').toDate(),
                userId: Common.user._id,
                roomId: room._id,
                pricePerDay: 400,
                totalPrice: 400,
                status: "ACCEPTED",
                createDate: parseIsoDatetime('2020-01-01T00:00:00.000Z').toDate(),
                updateDate: parseIsoDatetime('2020-01-01T00:00:00.000Z').toDate()
            }),
            Common.createDummyReservation(Common.user._id, room._id)
        ]);
    }


    // -------------------------------------------------------------------------
    // /reservations

    // /reservations/room/asd786g123/accepted
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
                fromDate: parseIsoDatetime('2020-05-01T00:00:00.000Z').toDate(),
                toDate: parseIsoDatetime('2020-05-01T00:00:00.000Z').toDate(),
                userId: Common.user._id,
                roomId: room._id,
                pricePerDay: 400,
                totalPrice: 400,
                status: "ACCEPTED",
                createDate: parseIsoDatetime('2020-01-01T00:00:00.000Z').toDate(),
                updateDate: parseIsoDatetime('2020-01-01T00:00:00.000Z').toDate()
            })
        ]);

        await Common.createDummyReservation(Common.user._id, room._id).save();
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
                fromDate: parseIsoDatetime('2020-01-01T00:00:00.000Z').toDate(),
                toDate: parseIsoDatetime('2020-01-01T00:00:00.000Z').toDate(),
                userId: Common.user._id,
                roomId: room._id,
                pricePerDay: 400,
                totalPrice: 400,
                status: "ACCEPTED",
                createDate: parseIsoDatetime('2020-01-01T00:00:00.000Z').toDate(),
                updateDate: parseIsoDatetime('2020-01-01T00:00:00.000Z').toDate()
            }),

            Common.createDummyReservation(Common.user._id, room._id)
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
                fromDate: parseIsoDatetime('2020-01-01T00:00:00.000Z').toDate(),
                toDate: parseIsoDatetime('2020-01-03T00:00:00.000Z').toDate(),
                userId: Common.user._id,
                roomId: room._id,
                pricePerDay: 400,
                totalPrice: 400,
                status: "ACCEPTED",
                createDate: parseIsoDatetime('2020-01-01T00:00:00.000Z').toDate(),
                updateDate: parseIsoDatetime('2020-01-01T00:00:00.000Z').toDate()
            }),
            new Reservation({
                _id: parseObjectId('5eae87fef13c8a4a4302dcc6'),
                fromDate: parseIsoDatetime('2020-01-05T00:00:00.000Z').toDate(),
                toDate: parseIsoDatetime('2020-01-07T00:00:00.000Z').toDate(),
                userId: Common.user._id,
                roomId: room._id,
                pricePerDay: 400,
                totalPrice: 400,
                status: "ACCEPTED",
                createDate: parseIsoDatetime('2020-01-01T00:00:00.000Z').toDate(),
                updateDate: parseIsoDatetime('2020-01-01T00:00:00.000Z').toDate()
            }),
            new Reservation({
                _id: parseObjectId('5eae880504a5017179988635'),
                fromDate: parseIsoDatetime('2020-01-08T00:00:00.000Z').toDate(),
                toDate: parseIsoDatetime('2020-01-08T00:00:00.000Z').toDate(),
                userId: Common.user._id,
                roomId: room._id,
                pricePerDay: 400,
                totalPrice: 400,
                status: "ACCEPTED",
                createDate: parseIsoDatetime('2020-01-01T00:00:00.000Z').toDate(),
                updateDate: parseIsoDatetime('2020-01-01T00:00:00.000Z').toDate()
            }),

            new Reservation({
                _id: parseObjectId('5eb47148feac1f6e42ebf7f0'),
                fromDate: parseIsoDatetime('2000-12-31T00:00:00.000Z').toDate(),
                toDate: parseIsoDatetime('2000-12-31T00:00:00.000Z').toDate(),
                userId: Common.user._id,
                roomId: room._id,
                pricePerDay: 400,
                totalPrice: 400,
                status: "PENDING",
                createDate: parseIsoDatetime('2020-01-01T00:00:00.000Z').toDate(),
                updateDate: parseIsoDatetime('2020-01-01T00:00:00.000Z').toDate()
            }),
            Common.createDummyReservation(Common.user._id, room._id)
        ]);
    }

    // -------------------------------------------------------------------------
    // GET /reservations/:id/user

    {
        const room = new Room({
            _id: parseObjectId('5eb870bcc32e3d4b7cb8af1c'),
            name: "Conference Room 5eb870bcc32e3d4b7cb8af1c",
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
                _id: parseObjectId('5eb870bcc32e3d4b7cb8af1c'),
                fromDate: parseIsoDatetime('2020-02-01T00:00:00.000Z').toDate(),
                toDate: parseIsoDatetime('2020-02-03T00:00:00.000Z').toDate(),
                userId: Common.user._id,
                roomId: room._id,
                pricePerDay: 400,
                totalPrice: 400,
                status: "ACCEPTED",
                createDate: parseIsoDatetime('2020-01-01T00:00:00.000Z').toDate(),
                updateDate: parseIsoDatetime('2020-01-01T00:00:00.000Z').toDate()
            }),

            Common.createDummyReservation(Common.user._id, room._id)
        ]);
    }

    // -------------------------------------------------------------------------
    // PUT /reservations/:id/user

    {
        const room = new Room({
            _id: parseObjectId('5eb8793a6cd93061c15e263d'),
            name: "Conference Room 5eb8793a6cd93061c15e263d",
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
                _id: parseObjectId('5eb8793a6cd93061c15e263d'),
                fromDate: parseIsoDatetime('2020-03-01T00:00:00.000Z').toDate(),
                toDate: parseIsoDatetime('2020-03-03T00:00:00.000Z').toDate(),
                userId: Common.user._id,
                roomId: room._id,
                pricePerDay: 400,
                totalPrice: 400,
                status: "REJECTED",
                createDate: parseIsoDatetime('2020-01-01T00:00:00.000Z').toDate(),
                updateDate: parseIsoDatetime('2020-01-01T00:00:00.000Z').toDate()
            }),

            new Reservation({
                _id: parseObjectId('5eb8795ea7644880b7c215ad'),
                fromDate: parseIsoDatetime('2020-03-01T00:00:00.000Z').toDate(),
                toDate: parseIsoDatetime('2020-03-03T00:00:00.000Z').toDate(),
                userId: Common.user._id,
                roomId: room._id,
                pricePerDay: 400,
                totalPrice: 400,
                status: "ACCEPTED",
                createDate: parseIsoDatetime('2020-01-01T00:00:00.000Z').toDate(),
                updateDate: parseIsoDatetime('2020-01-01T00:00:00.000Z').toDate()
            }),

            Common.createDummyReservation(Common.user._id, room._id)
        ]);
    }

});