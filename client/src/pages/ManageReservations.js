import React, { useState, useEffect } from "react";
import axios from 'axios';
import PendingReservation from "../components/admin/PendingReservation";
import AcceptedReservation from "../components/admin/AcceptedReservation";
import CancelledReservation from "../components/admin/CancelledReservation";
import RejectedReservation from "../components/admin/RejectedReservation";

const ManageReservations = () => {
    const [pendingContent, setPendingContent] = useState(null);
    const [acceptedContent, setAcceptedContent] = useState(null);
    const [rejectedContent, setRejectedContent] = useState(null);
    const [cancelledContent, setCancelledContent] = useState(null);
    const [currentTab, setCurrentTab] = useState("pending");


    const onAcceptReservation = async reservationId => {
        const secret_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Il9pZCI6IjVlODY1OWIwYzg1M2EzMTU1YzBhNGJlMSIsImVtYWlsIjoic3Rhc2lla2dydXpAZ21haWwuY29tIiwicm9sZSI6IkFETUlOIn0sImlhdCI6MTU4NTg2MzE3OH0.oXtPbMGX31EExflHnFxM8_-jq-DiQbekVBEkL_S7WNc";
        await axios.post(`/accept-reservation/`, {}, {
            data: {
                reservationId: reservationId
            },
            params: {
                secret_token: secret_token
            }
        });
        window.location.reload();
    };

    const onRejectReservation = async reservationId => {
        // TODO:
    };

    useEffect(() => {
        console.log(currentTab);
        const secret_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Il9pZCI6IjVlODY1OWIwYzg1M2EzMTU1YzBhNGJlMSIsImVtYWlsIjoic3Rhc2lla2dydXpAZ21haWwuY29tIiwicm9sZSI6IkFETUlOIn0sImlhdCI6MTU4NTg2MzE3OH0.oXtPbMGX31EExflHnFxM8_-jq-DiQbekVBEkL_S7WNc";
        const fetchTabContent = async () => {
            if (currentTab === "cancelled") {
                if (cancelledContent) return;
                const content = await axios.get('/admin/cancelled-reservations', {
                    params: {
                        secret_token: secret_token
                    }
                });
                setCancelledContent(content.data);
            }
            else if (currentTab === "accepted") {
                if (acceptedContent) return;
                const content = await axios.get(`/admin/accepted-reservations/`, {
                    params: {
                        secret_token: secret_token
                    }
                });
                setAcceptedContent(content.data);
            }
            else if (currentTab === "rejected") {
                if (rejectedContent) return;
                const content = await axios.get(`/admin/rejected-reservations/`, {
                    params: {
                        secret_token: secret_token
                    }
                });
                setRejectedContent(content.data);
            }
            else {
                if (pendingContent) return;
                const content = await axios.get(`/admin/pending-reservations/`, {
                    params: {
                        secret_token: secret_token
                    }
                });
                setPendingContent(content.data);
            }

        };
        fetchTabContent();
    }, [currentTab]);

    return (
        <>
            <ul class="nav nav-tabs" id="reservation-tabs" role="tablist">
                <li class="nav-item">
                    <a class="nav-link active" id="pending-tab" data-toggle="tab"
                        onClick={() => setCurrentTab("pending")}
                        href="#pending" role="tab" aria-controls="pending" aria-selected="true">Pending</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" id="accepted-tab" data-toggle="tab"
                        onClick={() => setCurrentTab("accepted")}
                        href="#accepted" role="tab" aria-controls="accepted" aria-selected="false">Accepted</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" id="rejected-tab" data-toggle="tab"
                        onClick={() => setCurrentTab("rejected")}
                        href="#rejected" role="tab" aria-controls="rejected" aria-selected="false">Rejected</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" id="cancelled-tab" data-toggle="tab"
                        onClick={() => setCurrentTab("cancelled")}
                        href="#cancelled" role="tab" aria-controls="cancelled" aria-selected="false">Cancelled</a>
                </li>
            </ul>
            <div id="reservationTabsContent" class="tab-content bg-white">
                <div class="tab-pane fade show active" id="pending" role="tabpanel" aria-labelledby="pending-tab">
                    {
                        !pendingContent
                            ? null
                            : <>
                                <div className="container p-4">
                                    {
                                        pendingContent.map(reservation => {
                                            return <PendingReservation reservation={reservation}
                                                onAcceptReservation={onAcceptReservation}
                                                onRejectReservation={onRejectReservation} />
                                        })
                                    }
                                </div>
                            </>
                    }
                </div>
                <div class="tab-pane fade" id="accepted" role="tabpanel" aria-labelledby="accepted-tab">
                    {
                        !acceptedContent
                            ? null
                            : <>
                                <div className="container p-4">
                                    {
                                        acceptedContent.map(reservation => {
                                            return <AcceptedReservation reservation={reservation}
                                                onRejectReservation={onRejectReservation} />
                                        })
                                    }
                                </div>
                            </>
                    }
                </div>
                <div class="tab-pane fade" id="rejected" role="tabpanel" aria-labelledby="rejected-tab">
                    {
                        !rejectedContent
                            ? null
                            : <>
                                <div className="container p-4">
                                    {
                                        rejectedContent.map(reservation => {
                                            return <RejectedReservation reservation={reservation}
                                                onAcceptReservation={onAcceptReservation} />
                                        })
                                    }
                                </div>
                            </>
                    }
                </div>
                <div class="tab-pane fade" id="cancelled" role="tabpanel" aria-labelledby="cancelled-tab">
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