import mongoose from 'mongoose';

class ReservationQueryBuilder {
    constructor() {
        if (this.constructor == ReservationQueryBuilder) {
            throw Error('ReservationQueryBuilder cannot be instantiated');
        }
        this.filter = {};
        this.opts = {};
        this.selectedProperties = null;
    }
    build() {
        throw Error('build() must be implemented');
    }

    withRoomId(roomId) {
        if (typeof roomId !== 'string' && !mongoose.Types.ObjectId.isValid(roomId))
            throw Error(`'roomId' is invalid ObjectId`)
        this.filter.roomId = roomId;
        return this;
    }

    withUserId(userId) {
        if (typeof userId !== 'string' && !mongoose.Types.ObjectId.isValid(userId))
            throw Error(`'userId' is invalid ObjectId`)
        this.filter.userId = userId;
        return this;
    }

    withStatus(status) {
        const availableStatuses = ["PENDING", "ACCEPTED", "REJECTED", "CANCELLED"];
        if (!availableStatuses.includes(status)) throw Error(`Invalid 'status'`);
        this.filter.status = status;
        return this;
    }

    withStatuses(statuses) {
        if (!Array.isArray(statuses)) throw Error(`'statuses' must be type of array`);

        const availableStatuses = ["PENDING", "ACCEPTED", "REJECTED", "CANCELLED"];
        const illegalStatusProvided = statuses.some(status =>
            !availableStatuses.includes(status))
        if (illegalStatusProvided) {
            throw Error('Provided illegal reservation status/es')
        }

        this.filter.status = { $in: statuses };
        
        return this;
    }

    /**
     * @param {Date} startDate 
     * @param {Date} endDate 
     */
    overlappingDateIterval(startDate, endDate) {
        if (!isValidDate(startDate)) throw Error(`'startDate' must be Date type`)
        if (!isValidDate(endDate)) throw Error(`'endDate' must be Date type`)
        if (startDate > endDate) throw Error(`'startDate' is after 'endDate'`);

        this.filter.fromDate = { $lte: endDate };
        this.filter.toDate = { $gte: startDate }
        
        return this;
    }

    select(properties) {
        this.selectedProperties = properties;
        return this;
    }
}

function isValidDate(date) {
    return date && Object.prototype.toString.call(date) === "[object Date]" && !isNaN(date);
}

export default ReservationQueryBuilder;