import Room from '../../src/models/room-model';
import Reservation from '../../src/models/reservation-model';
import { parseObjectId, parseIsoDatetime } from '../../src/common';
import * as Common from './populate-common';

export const populateReservationModifyRouter = async () => {
    // -------------------------------------------------------------------------
    // POST /reservations/modify/accept

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
                fromDate: parseIsoDatetime('2020-01-01T00:00:00.000Z').toDate(),
                toDate: parseIsoDatetime('2020-01-01T00:00:00.000Z').toDate(),
                userId: Common.user._id,
                roomId: room._id,
                pricePerDay: 400,
                totalPrice: 400,
                status: "PENDING",
                createDate: parseIsoDatetime('2020-01-01T00:00:00.000Z').toDate(),
                updateDate: parseIsoDatetime('2020-01-01T00:00:00.000Z').toDate()
            }),
            new Reservation({
                _id: parseObjectId('5eac2251352b07932183ee63'),
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
            // Accept reservation and then reject others pending
            new Reservation({
                _id: parseObjectId('5eac22acebac85f7dd117a14'),
                fromDate: parseIsoDatetime('2020-01-02T00:00:00.000Z').toDate(),
                toDate: parseIsoDatetime('2020-01-02T00:00:00.000Z').toDate(),
                userId: Common.user._id,
                roomId: room._id,
                pricePerDay: 400,
                totalPrice: 400,
                status: "PENDING",
                createDate: parseIsoDatetime('2020-01-01T00:00:00.000Z').toDate(),
                updateDate: parseIsoDatetime('2020-01-01T00:00:00.000Z').toDate()
            }),
            new Reservation({
                _id: parseObjectId('5eac22a4a4fbab8bc52230a3'),
                fromDate: parseIsoDatetime('2020-01-02T00:00:00.000Z').toDate(),
                toDate: parseIsoDatetime('2020-01-02T00:00:00.000Z').toDate(),
                userId: Common.user._id,
                roomId: room._id,
                pricePerDay: 400,
                totalPrice: 400,
                status: "PENDING",
                createDate: parseIsoDatetime('2020-01-01T00:00:00.000Z').toDate(),
                updateDate: parseIsoDatetime('2020-01-01T00:00:00.000Z').toDate()
            }),
            new Reservation({
                _id: parseObjectId('5eac358cac8b270b1c1863f0'),
                fromDate: parseIsoDatetime('2020-01-02T00:00:00.000Z').toDate(),
                toDate: parseIsoDatetime('2020-01-02T00:00:00.000Z').toDate(),
                userId: Common.user._id,
                roomId: room._id,
                pricePerDay: 400,
                totalPrice: 400,
                status: "CANCELLED",
                createDate: parseIsoDatetime('2020-01-01T00:00:00.000Z').toDate(),
                updateDate: parseIsoDatetime('2020-01-01T00:00:00.000Z').toDate()
            }),
            // Reservation already accepted
            new Reservation({
                _id: parseObjectId('5eac23434fcb4261665be561'),
                fromDate: parseIsoDatetime('2020-01-03T00:00:00.000Z').toDate(),
                toDate: parseIsoDatetime('2020-01-03T00:00:00.000Z').toDate(),
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
    // POST /reservations/modify/reject
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
    // POST /reservations/modify/cancel
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
};