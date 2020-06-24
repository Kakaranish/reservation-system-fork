import React, { useState, useEffect } from "react";
import axios from 'axios';
import CancellableReservation from "../../components/user/CancellableReservation";
import OtherReservation from '../../components/user/OtherReservation';
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

const ManageReservations = () => {

    const history = useHistory();

    const [pendingContent, setPendingContent] = useState(null);
    const [acceptedContent, setAcceptedContent] = useState(null);
    const [rejectedContent, setRejectedContent] = useState(null);
    const [cancelledContent, setCancelledContent] = useState(null);
    const [currentTab, setCurrentTab] = useState("pending");

    const onCancelReservation = async reservationId => {
        const result = await axios.put(`/reservations/${reservationId}/modify/cancel`,
            {}, { validateStatus: false });
        if (result.status !== 200) {
            result.data.forEach(e => console.log(e?.msg ?? e));
            alert('Internal error');
            return;
        }

        history.push('/refresh');
    }

    useEffect(() => {
        const fetchTabContent = async () => {
            if (currentTab === "cancelled") {
                if (cancelledContent) return;
                const content = await axios.get(`/reservations/user?status=CANCELLED`,
                    { validateStatus: false });
                setCancelledContent(content.data);
            }
            else if (currentTab === "accepted") {
                if (acceptedContent) return;
                const content = await axios.get(`/reservations/user?status=ACCEPTED`,
                    { validateStatus: false });
                setAcceptedContent(content.data);
            }
            else if (currentTab === "rejected") {
                if (rejectedContent) return;
                const content = await axios.get(`/reservations/user?status=REJECTED`,
                    { validateStatus: false });
                setRejectedContent(content.data);
            }
            else {
                if (pendingContent) return;
                const content = await axios.get(`/reservations/user?status=PENDING`,
                    { validateStatus: false });
                setPendingContent(content.data);
            }
        };
        fetchTabContent();
    }, [currentTab]);

    return (
        <>
            <h3 className="title">Manage Your Reservations</h3>
            <ul className="nav nav-tabs" id="reservation-tabs" role="tablist">
                <li className="nav-item">
                    <a className="nav-link active" id="pending-tab" data-toggle="tab"
                        onClick={() => setCurrentTab("pending")}
                        href="#pending" role="tab" aria-controls="pending" aria-selected="true">Pending</a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" id="accepted-tab" data-toggle="tab"
                        onClick={() => setCurrentTab("accepted")}
                        href="#accepted" role="tab" aria-controls="accepted" aria-selected="false">Accepted</a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" id="rejected-tab" data-toggle="tab"
                        onClick={() => setCurrentTab("rejected")}
                        href="#rejected" role="tab" aria-controls="rejected" aria-selected="false">Rejected</a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" id="cancelled-tab" data-toggle="tab"
                        onClick={() => setCurrentTab("cancelled")}
                        href="#cancelled" role="tab" aria-controls="cancelled" aria-selected="false">Cancelled</a>
                </li>
            </ul>
            <div id="reservationTabsContent" className="tab-content bg-white">
                <div className="tab-pane fade show active" id="pending" role="tabpanel" aria-labelledby="pending-tab">
                    {
                        pendingContent &&
                        <>
                            <div className="container p-4">
                                {
                                    pendingContent.map(reservation => {
                                        return <CancellableReservation
                                            key={reservation["_id"]}
                                            reservation={reservation}
                                            onCancelReservation={onCancelReservation} />
                                    })
                                }
                            </div>
                        </>
                    }
                </div>
                <div className="tab-pane fade" id="accepted" role="tabpanel" aria-labelledby="accepted-tab">
                    {
                        acceptedContent &&
                        <>
                            <div className="container p-4">
                                {
                                    acceptedContent.map(reservation => {
                                        return <CancellableReservation
                                            key={reservation["_id"]}
                                            reservation={reservation}
                                            onCancelReservation={onCancelReservation} />
                                    })
                                }
                            </div>
                        </>
                    }
                </div>
                <div className="tab-pane fade" id="rejected" role="tabpanel" aria-labelledby="rejected-tab">
                    {
                        rejectedContent &&
                        <>
                            <div className="container p-4">
                                {
                                    rejectedContent.map(reservation => {
                                        return <OtherReservation
                                            key={reservation["_id"]}
                                            reservation={reservation} />
                                    })
                                }
                            </div>
                        </>
                    }
                </div>
                <div className="tab-pane fade" id="cancelled" role="tabpanel" aria-labelledby="cancelled-tab">
                    {
                        cancelledContent &&
                        <>
                            <div className="container p-4">
                                {
                                    cancelledContent.map(reservation => {
                                        return <OtherReservation
                                            key={reservation["_id"]}
                                            reservation={reservation} />
                                    })
                                }
                            </div>
                        </>
                    }
                </div>
            </div>
        </>
    );
};

export default ManageReservations;