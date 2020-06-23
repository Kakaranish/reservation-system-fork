import React, { useState, useEffect } from "react";
import axios from 'axios';
import PendingReservation from "../../components/admin/PendingReservation";
import AcceptedReservation from "../../components/admin/AcceptedReservation";
import CancelledReservation from "../../components/admin/CancelledReservation";
import RejectedReservation from "../../components/admin/RejectedReservation";

const ManageReservations = () => {
    const [pendingContent, setPendingContent] = useState(null);
    const [acceptedContent, setAcceptedContent] = useState(null);
    const [rejectedContent, setRejectedContent] = useState(null);
    const [cancelledContent, setCancelledContent] = useState(null);
    const [currentTab, setCurrentTab] = useState("pending");

    const onAcceptReservation = async reservationId => {
        const uri = `/reservations/${reservationId}/modify/accept`;
        const result = await axios.put(uri, {}, { validateStatus: false });
        if (result.status !== 200) {
            alert('Internal error');
            result.data.errors.forEach(e => console.log(e?.msg ?? e));
            return;
        }

        window.location.reload();
    };

    const onRejectReservation = async reservationId => {
        const uri = `/reservations/${reservationId}/modify/reject`;
        const result = await axios.put(uri, {}, { validateStatus: false });
        if (result.status !== 200) {
            alert('Internal error');
            result.data.errors.forEach(e => console.log(e?.msg ?? e));
            return;
        }

        window.location.reload();
    };

    useEffect(() => {
        const fetchTabContent = async () => {
            if (currentTab === "cancelled") {
                if (cancelledContent) return;
                const content = await axios.get('/reservations?status=CANCELLED',
                    { validateStatus: false });
                setCancelledContent(content.data);
            }
            else if (currentTab === "accepted") {
                if (acceptedContent) return;
                const content = await axios.get('/reservations?status=ACCEPTED',
                    { validateStatus: false });
                setAcceptedContent(content.data);
            }
            else if (currentTab === "rejected") {
                if (rejectedContent) return;
                const content = await axios.get('/reservations?status=REJECTED',
                    { validateStatus: false });
                setRejectedContent(content.data);
            }
            else {
                if (pendingContent) return;
                const content = await axios.get('/reservations?status=PENDING',
                    { validateStatus: false });
                setPendingContent(content.data);
            }
        };
        fetchTabContent();
    }, [currentTab]);

    return (
        <>
            <h3 className="title">Manage Users Reservations</h3>
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
                        !pendingContent
                            ? null
                            : <>
                                <div className="container p-4">
                                    {
                                        pendingContent.map(reservation => {
                                            return <PendingReservation
                                                key={reservation["_id"]}
                                                reservation={reservation}
                                                onAcceptReservation={onAcceptReservation}
                                                onRejectReservation={onRejectReservation} />
                                        })
                                    }
                                </div>
                            </>
                    }
                </div>
                <div className="tab-pane fade" id="accepted" role="tabpanel" aria-labelledby="accepted-tab">
                    {
                        !acceptedContent
                            ? null
                            : <>
                                <div className="container p-4">
                                    {
                                        acceptedContent.map(reservation => {
                                            return <AcceptedReservation
                                                key={reservation["_id"]}
                                                reservation={reservation}
                                                onRejectReservation={onRejectReservation} />
                                        })
                                    }
                                </div>
                            </>
                    }
                </div>
                <div className="tab-pane fade" id="rejected" role="tabpanel" aria-labelledby="rejected-tab">
                    {
                        !rejectedContent
                            ? null
                            : <>
                                <div className="container p-4">
                                    {
                                        rejectedContent.map(reservation => {
                                            return <RejectedReservation
                                                key={reservation["_id"]}
                                                reservation={reservation}
                                                onAcceptReservation={onAcceptReservation} />
                                        })
                                    }
                                </div>
                            </>
                    }
                </div>
                <div className="tab-pane fade" id="cancelled" role="tabpanel" aria-labelledby="cancelled-tab">
                    {
                        !cancelledContent
                            ? null
                            : <>
                                <div className="container p-4">
                                    {
                                        cancelledContent.map(reservation => {
                                            return <CancelledReservation reservation={reservation} />
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