import Reservation from '../models/reservation-model';
import ReservationQueryBuilder from './ReservationQueryBuilder';

class ExistReservationQueryBuilder extends ReservationQueryBuilder {
    build() {
        return Reservation.exists(this.filter, this.opts);
    }
}

export default ExistReservationQueryBuilder;