import Reservation from '../models/reservation-model';
import ReservationQueryBuilder from './ReservationQueryBuilder';

class FindReservationQueryBuilder extends ReservationQueryBuilder {
    build() {
        let query = Reservation.find(this.filter, this.opts);
        if (this.userFieldsToPopulate) {
            query = this.userFieldsToPopulate === "*"
                ? query.populate('user')
                : query.populate('user', this.userFieldsToPopulate);
        }
        if (this.roomFieldsToPopulate) {
            query = this.roomFieldsToPopulate === "*"
                ? query.populate('room')
                : query.populate('room', this.roomFieldsToPopulate);
        }
        if (this.selectedProperties) query = query.select(this.selectedProperties);

        return query;
    }

    withPopulatedUserData(fieldsToPopulate = "*") {
        this.userFieldsToPopulate = fieldsToPopulate;
        return this;
    }

    withPopulatedRoomData(fieldsToPopulate = "*") {
        this.roomFieldsToPopulate = fieldsToPopulate;
        return this;
    }
}

export default FindReservationQueryBuilder;