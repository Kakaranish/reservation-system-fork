import mongoose from 'mongoose';
import User from '../../src/models/user-model';
import Reservation from '../../src/models/reservation-model';
import { parseObjectId, parseIsoDatetime } from '../../src/common';

export const dummyInterval = {
    fromDate: parseIsoDatetime('2010-01-01T00:00:00.000Z').toDate(),
    toDate: parseIsoDatetime('2010-01-30T00:00:00.000Z').toDate()
};

export const commonUser = new User({
    _id: parseObjectId('5ea54fe32d431462827c2c5e'),
    email: 'user@mail.com',
    password: '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.a29kwv8V6jU5L4nb.F5/EJxDqZ/w6DG', // hashed '123'
    firstName: 'user',
    lastName: 'user-lastname',
    role: 'USER'
});

export const commonAdmin = new User({
    _id: parseObjectId('5ea5501566815162f73bad80'),
    email: 'admin@mail.com',
    password: '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.a29kwv8V6jU5L4nb.F5/EJxDqZ/w6DG', // hashed '123'
    firstName: 'admin',
    lastName: 'admin-lastname',
    role: 'ADMIN'
});

/**
 * @param {String} userId 
 * @param {String} roomId 
 */
export const createDummyReservation = (userId, roomId) => {
    return new Reservation({
        _id: mongoose.Types.ObjectId(),
        fromDate: dummyInterval.fromDate,
        toDate: dummyInterval.toDate,
        userId: userId,
        roomId: roomId,
        pricePerDay: 400,
        totalPrice: 400,
        status: 'ACCEPTED',
        createDate: parseIsoDatetime('2000-01-01T00:00:00.000Z').toDate(),
        updateDate: parseIsoDatetime('2000-01-01T00:00:00.000Z').toDate()
    });
}