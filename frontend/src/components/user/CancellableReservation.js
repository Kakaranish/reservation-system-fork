import React from "react";
import { Link } from 'react-router-dom';
import axios from "axios";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import ReservationInfo from "../user/ReservationInfo";
import { requestHandler } from "../../common/utils";

const CancellableReservation = ({ reservation }) => {

    const history = useHistory();

    const onCancel = async () => {
        const uri = `/user/reservations/${reservation._id}/cancel`;
        const action = async () => axios.put(uri, {}, { validateStatus: false });
        await requestHandler(action, {
            status: 200,
            callback: async () => history.push('/refresh')
        });
    };

    return <ReservationInfo reservation={reservation}>
        <div className="card-footer w-100 bg-white border-0 mt-sm-2 px-0">
            <div className="row">
                <div className="col-12">
                    <Link to={`/user/reservations/${reservation._id}/edit`}
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