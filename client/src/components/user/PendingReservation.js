import React from "react";
import moment from "moment";

const PendingReservation = ({ reservation, onCancelReservation }) => {
    const onCancel = () => {
        onCancelReservation(reservation["_id"]);
    }

    return (
        <div class="card p-1 border-0">
            <div class="row no-gutters mb-3">
                <div class="col-auto">
                    <img src={reservation.roomPhoto} style={{ width: "20vh" }} />
                </div>
                <div class="col pb-3">
                    <div class="card-block px-4">
                        <p class="card-text">
                            Who's making reservation?: <b>{reservation.userEmail}</b>
                        </p>
                        <p class="card-text">
                            When?: <b>{moment(reservation.startDate).format("YYYY-MM-DD")} - {moment(reservation.endDate).format("YYYY-MM-DD")}</b>
                        </p>
                        <p class="card-text">
                            Pice Per Day: <b>{reservation.pricePerDay}PLN</b>
                        </p>
                        <p class="card-text">
                            Total Price: <b>{reservation.totalPrice}PLN</b>
                        </p>
                    </div>
                </div>
                <div className="card-footer w-100 bg-white border-0 mt-sm-2 px-0">
                    <div className="row">
                        <div className="col-12">
                            <button className="btn btn-block text-uppercase mb-2 btn-success" onClick={onCancel}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PendingReservation;