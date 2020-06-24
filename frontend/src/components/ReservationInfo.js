import React from 'react';
import moment from 'moment';

const ReservationInfo = ({ reservation, children }) => {
    return <>
        <div className="card p-1 border-0">
            <div className="row no-gutters mb-3">
                <div className="col-auto">
                    <img src={reservation.room.image.thumbnailUri} style={{ width: "20vh" }} />
                </div>
                <div className="col pb-3">
                    <div className="card-block px-4">
                        <p className="card-text">
                            What's requested room?: <b>{reservation.room.name}</b> | {reservation.room.location}
                        </p>

                        <p className="card-text">
                            When?: <b>{moment(reservation.fromDate).format("YYYY-MM-DD")} - {moment(reservation.toDate).format("YYYY-MM-DD")}</b>
                        </p>

                        <p className="card-text">
                            Pice Per Day: <b>{reservation.pricePerDay}PLN</b>
                        </p>
                        
                        <p className="card-text">
                            Total Price: <b>{reservation.totalPrice}PLN</b>
                        </p>
                    </div>
                </div>

                {children}

            </div>
        </div>
    </>
};

export default ReservationInfo;