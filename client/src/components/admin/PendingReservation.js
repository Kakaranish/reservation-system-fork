import React from "react";

const PendingReservation = ({ reservation, onAcceptReservation, onRejectReservation }) => {

    const onAccept = () => {
        onAcceptReservation(reservation["_id"]);
    }

    const onReject = () => {
        onRejectReservation(reservation["_id"]);
    }

    return (
        <div class="card p-1 border-0">
            <div class="row no-gutters mb-3">
                <div class="col-auto">
                    <img src={reservation.roomPhoto} style={{ width: "20vh" }} />
                </div>
                <div class="col pb-3">
                    <div class="card-block px-4">
                        <h4 class="card-title room-page-title">
                            {reservation.roomName} | <span style={{ color: "gray" }, { fontSize: "18px" }}>{reservation.roomLocation}</span>
                        </h4>
                        <p class="card-text">
                            Who's making reservation?: <b>{reservation.userEmail}</b>
                        </p>
                        <p class="card-text">
                            When?: <b>2020-04-20 - 2020-04-22</b>
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
                        <div className="col-6">
                            <button className="btn btn-block text-uppercase mb-2 btn-success" onClick={onAccept}>
                                Accept
                            </button>
                        </div>

                        <div className="col-6">
                            <button className="btn btn-block text-uppercase mb-2 btn-danger" onClick={onReject}>
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default PendingReservation;