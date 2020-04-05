import React, { useState, useEffect } from "react";
import axios from 'axios';
import CancellableReservation from "../../components/user/CancellableReservation";
import OtherReservation from '../../components/user/OtherReservation';

const ManageReservations = () => {
    const [pendingContent, setPendingContent] = useState(null);
    const [acceptedContent, setAcceptedContent] = useState(null);
    const [rejectedContent, setRejectedContent] = useState(null);
    const [cancelledContent, setCancelledContent] = useState(null);
    const [currentTab, setCurrentTab] = useState("pending");

    const onCancelReservation = async reservationId => {
        const secret_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Il9pZCI6IjVlOGEyY2JjNTQzYWU0MDNhYWI3NWQxMiIsImVtYWlsIjoic3Rhc2lla2dydXoxQGdtYWlsLmNvbSIsInJvbGUiOiJVU0VSIn0sImlhdCI6MTU4NjExMzc0Mn0.7rOzSpnsHDtrLwnCLgRroQ6ldwiFklxUT2ih_WOm16g";
        try {
            await axios.post(`/user/cancel-reservation/${reservationId}`, {}, {
                params: {
                    secret_token: secret_token
                }
            });
            window.location.reload();
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        const secret_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Il9pZCI6IjVlOGEyY2JjNTQzYWU0MDNhYWI3NWQxMiIsImVtYWlsIjoic3Rhc2lla2dydXoxQGdtYWlsLmNvbSIsInJvbGUiOiJVU0VSIn0sImlhdCI6MTU4NjExMzc0Mn0.7rOzSpnsHDtrLwnCLgRroQ6ldwiFklxUT2ih_WOm16g";
        const userId = "5e8659b0c853a3155c0a4be1";
        const fetchTabContent = async () => {
            if (currentTab === "cancelled") {
                if (cancelledContent) return;
                const content = await axios.get(`/user/cancelled-reservations/${userId}`, {
                    params: {
                        secret_token: secret_token
                    },
                });
                setCancelledContent(content.data);
            }
            else if (currentTab === "accepted") {
                if (acceptedContent) return;
                const content = await axios.get(`/user/accepted-reservations/${userId}`, {
                    params: {
                        secret_token: secret_token
                    }
                });
                setAcceptedContent(content.data);
            }
            else if (currentTab === "rejected") {
                if (rejectedContent) return;
                const content = await axios.get(`/user/rejected-reservations/${userId}`, {
                    params: {
                        secret_token: secret_token
                    }
                });
                setRejectedContent(content.data);
            }
            else {
                if (pendingContent) return;
                const content = await axios.get(`/user/pending-reservations/${userId}`, {
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
                        !pendingContent
                            ? null
                            : <>
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
                        !acceptedContent
                            ? null
                            : <>
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
                        !rejectedContent
                            ? null
                            : <>
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
                        !cancelledContent
                            ? null
                            : <>
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