import React from "react";
import ReservationInfo from "../ReservationInfo";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import axios from "axios";
import { requestHandler } from "../../common/utils";

const PendingReservation = ({ reservation }) => {

    const history = useHistory();

    const onAccept = async () => {
        const uri = `/owner/reservations/${reservation._id}/accept`;
        const action = async () => axios.put(uri, {}, { validateStatus: false });
        await requestHandler(action, {
            status: 200,
            callback: async () => history.push('/refresh')
        });
    };

    const onReject = async () => {
        const uri = `/owner/reservations/${reservation._id}/reject`;
        const action = async () => axios.put(uri, {}, { validateStatus: false });
        await requestHandler(action, {
            status: 200,
            callback: async () => history.push('/refresh')
        });
    };

    return <>
        <ReservationInfo reservation={reservation}>
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
        </ReservationInfo>
    </>
};

export default PendingReservation;