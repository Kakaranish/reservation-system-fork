import React from "react";
import moment from "moment";

const CancelledReservation = ({ reservation }) => {
    return (
        <div className="card p-1 border-0">
            <div className="row no-gutters mb-3">
                <div className="col-auto">
                    <img src={reservation.room.photoUrl} style={{ width: "20vh" }} />
                </div>
                <div className="col pb-3">
                    <div className="card-block px-4">
                        <h4 className="card-title room-page-title">
                            {reservation.room.name} | <span style={{ color: "gray" }, { fontSize: "18px" }}>{reservation.room.location}</span>
                        </h4>
                        <p className="card-text">
                            Who's making reservation?: <b>{reservation.user.email}</b>
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
            </div>
        </div>
    );
};

export default CancelledReservation;