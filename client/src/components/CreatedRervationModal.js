import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";

const CreatedReservationModal = ({ selectedDateInterval, reservationMakeOnClick }) => {
    const [show, setShow] = useState(false);

    const handleClose = () => {
        setShow(false)
        reservationMakeOnClick();
    };
    const handleShow = () => setShow(true);

    return (
        <>
            <button type="submit" className="btn btn-block primary-btn" onClick={handleShow}>
                Make reservation
            </button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Body>
                    {
                        !selectedDateInterval
                            ? null :
                            <>
                                Your reservation request has been created.<br />
                                Now wait for administrator approval <br />
                                Selected date interval:
                                <b> {selectedDateInterval.fromDate.format("DD-MM-YYYY")} - {selectedDateInterval.toDate.format("DD-MM-YYYY")}</b><br />
                            </>
                    }
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleClose}>
                        OK
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default CreatedReservationModal;