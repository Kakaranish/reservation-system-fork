import Reservation from '../models/reservation-model';
import ReservationQueryBuilder from './ReservationQueryBuilder';

class FindReservationQueryBuilder extends ReservationQueryBuilder {
    build() {
        if (this.selectedProperties) {
            return Reservation.find(this.filter, this.opts)
                .select(this.selectedProperties)
        }
        return Reservation.find(this.filter, this.opts);
    }
}

export default FindReservationQueryBuilder;