import Room from '../../src/models/room-model';
import Reservation from '../../src/models/reservation-model';
import { parseObjectId, parseIsoDatetime } from '../../src/common';
import * as Common from './populate-common';

// Year 2010
export const populateRoomRouter = async () => {

    // -------------------------------------------------------------------------
    // -- GET /rooms

    {
        const room = new Room({
            _id: parseObjectId('5ea55125e95cc70df70870f7'),
            name: 'Conference Room 5ea55125e95cc70df70870f71',
            location: 'Krakow',
            capacity: 20,
            pricePerDay: 300,
            description: 'Some description 1',
            amenities: [
                'amtTV', 'amtMicrophone', 'amtProjector'
            ],
            dows: [
                'dowMonday', 'dowTuesday', 'dowThursday', 'dowFriday', 'dowSunday'
            ],
            photoUrl: '/some/path'
        });

        await room.save();

        await Reservation.insertMany([
            new Reservation({
                fromDate: parseIsoDatetime('2010-01-03T00:00:00.000Z').toDate(),
                toDate: parseIsoDatetime('2010-01-03T00:00:00.000Z').toDate(),
                userId: Common.user._id,
                roomId: room._id,
                pricePerDay: 300,
                totalPrice: 600,
                status: 'ACCEPTED',
                createDate: parseIsoDatetime('2010-01-01T00:00:00.000Z').toDate(),
                updateDate: parseIsoDatetime('2010-01-01T00:00:00.000Z').toDate()
            }),
            new Reservation({
                fromDate: parseIsoDatetime('2010-01-05T00:00:00.000Z').toDate(),
                toDate: parseIsoDatetime('2010-01-30T00:00:00.000Z').toDate(),
                userId: Common.user._id,
                roomId: room._id,
                pricePerDay: 300,
                totalPrice: 600,
                status: 'ACCEPTED',
                createDate: parseIsoDatetime('2010-01-01T00:00:00.000Z').toDate(),
                updateDate: parseIsoDatetime('2010-01-01T00:00:00.000Z').toDate()
            })
        ]);

        const room2 = new Room({
            _id: parseObjectId('5ea551627698ad8c1c5a4759'),
            name: 'Conference Room 5ea551627698ad8c1c5a4759',
            location: 'Warsaw',
            capacity: 10,
            pricePerDay: 400.99,
            description: 'Some description 2',
            amenities: [
                'amtTV', 'amtMicrophone', 'amtProjector', 'amtPhone'
            ],
            dows: [
                'dowMonday', 'dowThursday', 'dowFriday'
            ],
            photoUrl: '/some/path2'
        });
        await room2.save();

        await Reservation.insertMany([
            new Reservation({
                fromDate: parseIsoDatetime('2010-01-02T00:00:00.000Z').toDate(),
                toDate: parseIsoDatetime('2010-01-04T00:00:00.000Z').toDate(),
                userId: Common.user._id,
                roomId: room2._id,
                pricePerDay: 300,
                totalPrice: 600,
                status: 'ACCEPTED',
                createDate: parseIsoDatetime('2010-01-01T00:00:00.000Z').toDate(),
                updateDate: parseIsoDatetime('2010-01-01T00:00:00.000Z').toDate()
            }),
            new Reservation({
                fromDate: parseIsoDatetime('2010-01-06T00:00:00.000Z').toDate(),
                toDate: parseIsoDatetime('2010-01-30T00:00:00.000Z').toDate(),
                userId: Common.user._id,
                roomId: room2._id,
                pricePerDay: 300,
                totalPrice: 600,
                status: 'ACCEPTED',
                createDate: parseIsoDatetime('2010-01-01T00:00:00.000Z').toDate(),
                updateDate: parseIsoDatetime('2010-01-01T00:00:00.000Z').toDate()
            })
        ]);
    }

    // -------------------------------------------------------------------------
    // -- GET /rooms/:id

    {
        const room = new Room({
            _id: parseObjectId('5eb57deb0af1b7089cecace3'),
            name: 'Conference Room 5eb57deb0af1b7089cecace3',
            location: 'Krakow',
            capacity: 20,
            pricePerDay: 300,
            description: 'Some description 1',
            amenities: [
                'amtTV', 'amtMicrophone', 'amtProjector'
            ],
            dows: [
                'dowMonday', 'dowTuesday', 'dowThursday', 'dowFriday', 'dowSunday'
            ],
            photoUrl: '/some/path'
        });
        await room.save();

        await Common.createDummyReservation(Common.user, room._id).save();
    }

    // -------------------------------------------------------------------------
    // -- GET /rooms/:id/reservations-preview

    {
        const room = new Room({
            _id: parseObjectId('5eb56bf24630ccf6ebcd8853'),
            name: 'Conference Room 5eb56bf24630ccf6ebcd8853',
            location: 'Krakow',
            capacity: 20,
            pricePerDay: 300,
            description: 'Some description 1',
            amenities: [
                'amtTV', 'amtMicrophone', 'amtProjector'
            ],
            dows: [
                'dowMonday', 'dowTuesday', 'dowThursday', 'dowFriday', 'dowSunday'
            ],
            photoUrl: '/some/path'
        });
        await room.save();

        await Common.createDummyReservation(Common.user, room._id).save();

        await Reservation.insertMany([
            new Reservation({
                _id: parseObjectId('5eb56dd66537e93af7419ab7'),
                fromDate: parseIsoDatetime('2010-03-01T00:00:00.000Z').toDate(),
                toDate: parseIsoDatetime('2010-03-01T00:00:00.000Z').toDate(),
                userId: Common.user._id,
                roomId: room._id,
                pricePerDay: 300,
                totalPrice: 600,
                status: 'ACCEPTED',
                createDate: parseIsoDatetime('2010-03-01T00:00:00.000Z').toDate(),
                updateDate: parseIsoDatetime('2010-03-01T00:00:00.000Z').toDate()
            }),
            new Reservation({
                _id: parseObjectId('5eb56dfbb499cd1fe08ee942'),
                fromDate: parseIsoDatetime('2010-03-02T00:00:00.000Z').toDate(),
                toDate: parseIsoDatetime('2010-03-04T00:00:00.000Z').toDate(),
                userId: Common.user._id,
                roomId: room._id,
                pricePerDay: 300,
                totalPrice: 600,
                status: 'ACCEPTED',
                createDate: parseIsoDatetime('2010-03-01T00:00:00.000Z').toDate(),
                updateDate: parseIsoDatetime('2010-03-01T00:00:00.000Z').toDate()
            }),
            new Reservation({
                _id: parseObjectId('5eb56df6b5de2905eac47329'),
                fromDate: parseIsoDatetime('2010-03-05T00:00:00.000Z').toDate(),
                toDate: parseIsoDatetime('2010-03-06T00:00:00.000Z').toDate(),
                userId: Common.user._id,
                roomId: room._id,
                pricePerDay: 300,
                totalPrice: 600,
                status: 'PENDING',
                createDate: parseIsoDatetime('2010-03-01T00:00:00.000Z').toDate(),
                updateDate: parseIsoDatetime('2010-03-01T00:00:00.000Z').toDate()
            })
        ]);
    }
};