import React, { useState, useEffect } from "react";
import axios from 'axios';

const ManageReservations = () => {
    const [pendingContent, setPendingContent] = useState(null);
    const [acceptedContent, setAcceptedContent] = useState(null);
    const [rejectedContent, setRejectedContent] = useState(null);
    const [cancelledContent, setCancelledContent] = useState(null);
    const [currentTab, setCurrentTab] = useState("pending");



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
                setCancelledContent(content);
            }
            else if (currentTab === "accepted") {
                if (acceptedContent) return;
                const content = await axios.get(`/admin/accepted-reservations/`, {
                    params: {
                        secret_token: secret_token
                    }
                });
                setAcceptedContent(content);
            }
            else if (currentTab === "rejected") {
                if (rejectedContent) return;
                const content = await axios.get(`/admin/rejected-reservations/`, {
                    params: {
                        secret_token: secret_token
                    }
                });
                setRejectedContent(content);
            }
            else {
                if (pendingContent) return;
                const content = await axios.get(`/admin/pending-reservations/`, {
                    params: {
                        secret_token: secret_token
                    }
                });
                setPendingContent(content);
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
                                    <div class="card p-1 border-0">
                                        <div class="row no-gutters">
                                            <div class="col-auto">
                                                <img src="https://picsum.photos/200" class="img-fluid" alt="" />
                                            </div>
                                            <div class="col pb-3">
                                                <div class="card-block px-4">
                                                    <h4 class="card-title room-page-title">Some title</h4>
                                                    <p class="card-text">
                                                        Who's making reservation?: <b>Stanislaw Gruz</b>
                                                    </p>
                                                    <p class="card-text">
                                                        When?: <b>2020-04-20 - 2020-04-22</b>
                                                    </p>
                                                    <p class="card-text">
                                                        Pice Per Day: <b>222PLN</b>
                                                    </p>
                                                    <p class="card-text">
                                                        Total Price: <b>444PLN</b>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="card-footer w-100 bg-white border-0 mt-sm-2 px-0">
                                                <div className="row">
                                                    <div className="col-6">
                                                        <button className="btn btn-block text-uppercase mb-2 btn-success" type="submit">
                                                            Accept
                                                        </button>
                                                    </div>

                                                    <div className="col-6">
                                                        <button className="btn btn-block text-uppercase mb-2 btn-danger" type="submit">
                                                            Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                    }
                </div>
                <div class="tab-pane fade" id="accepted" role="tabpanel" aria-labelledby="accepted-tab">
                    {
                        !acceptedContent
                            ? null
                            : <>
                            </>
                    }
                </div>
                <div class="tab-pane fade" id="rejected" role="tabpanel" aria-labelledby="rejected-tab">
                    {
                        !rejectedContent
                            ? null
                            : <>
                            </>
                    }
                </div>
                <div class="tab-pane fade" id="cancelled" role="tabpanel" aria-labelledby="cancelled-tab">
                    {
                        !cancelledContent
                            ? null
                            : <>
                            </>
                    }
                </div>
            </div>
        </>
    );
};

export default ManageReservations;