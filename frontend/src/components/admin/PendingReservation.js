import React from "react";
import ReservationInfo from "../ReservationInfo";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import axios from "axios";

const PendingReservation = ({ reservation }) => {

    const history = useHistory();

    const onAccept = async () => {
        const uri = `/reservations/${reservation._id}/modify/accept`;
        const result = await axios.put(uri, {}, { validateStatus: false });
        if (result.status !== 200) {
            alert('Internal error');
            result.data.errors.forEach(e => console.log(e?.msg ?? e));
            return;
        }

        history.push('/refresh');
    };

    const onReject = async () => {
        const uri = `/reservations/${reservation._id}/modify/reject`;
        const result = await axios.put(uri, {}, { validateStatus: false });
        if (result.status !== 200) {
            alert('Internal error');
            result.data.errors.forEach(e => console.log(e?.msg ?? e));
            return;
        }

        history.push('/refresh');
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