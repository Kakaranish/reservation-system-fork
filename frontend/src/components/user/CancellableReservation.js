import React from "react";
import { Link } from 'react-router-dom';
import axios from "axios";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import ReservationInfo from "../ReservationInfo";

const CancellableReservation = ({ reservation }) => {

    const history = useHistory();

    const onCancel = async () => {
        const uri = `/reservations/${reservation._id}/modify/cancel`;
        const result = await axios.put(uri, {}, { validateStatus: false });
        if (result.status !== 200) {
            result.data.forEach(e => console.log(e?.msg ?? e));
            alert('Internal error');
            return;
        }

        history.push('/refresh');
    };

    return <ReservationInfo reservation={reservation}>
        <div className="card-footer w-100 bg-white border-0 mt-sm-2 px-0">
            <div className="row">
                <div className="col-12">
                    <Link to={`/edit-reservation/${reservation._id}`}
                        className="btn btn-block text-uppercase mb-2 btn-info text-white">
                        Edit
                    </Link>

                    <button className="btn btn-block text-uppercase mb-2 btn-danger"
                        onClick={onCancel}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    </ReservationInfo>
};

export default CancellableReservation;