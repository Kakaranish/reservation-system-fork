import React, { useState, useEffect } from "react";
import { ObjectID } from "mongodb";
import axios from 'axios';
import '../assets/css/RoomPage.css';
import noImagePlaceholder from "../assets/icons/no-image.svg";
import moment from "moment";
import 'react-big-calendar/lib/css/react-big-calendar.css';
import ReservationCalendar from "../components/ReservationCalendar";
import CreatedReservationModal from '../components/CreatedRervationModal';

const images = require.context('../assets/images/amenities', true);

const RoomPage = ({ match }) => {
    const roomId = match.params.id;

    const dateIntervalToGenerate = {
        start: moment().startOf('day'),
        end: moment().startOf('day').add(6, 'months')
    };

    const [message, setMessage] = useState(null);
    const [room, setRoom] = useState(null);

    useEffect(() => {
        const getRoom = async roomId => {
            try {
                const result = await axios(`/rooms/${roomId}`);
                setRoom(result.data);
            }
            catch (error) {
                setMessage(`Unable to get room with id ${roomId}. Some error occured :C`);
            }
        }
        if (ObjectID.isValid(roomId)) getRoom(roomId);
    }, []);

    const [selectedInterval, setSelectedInterval] = useState(null);
    const onSelectedInterval = passedSelectedInterval => {
        setSelectedInterval(passedSelectedInterval)
    }

    if (!ObjectID.isValid(roomId)) {
        return (
            <div className="row">
                <div className="col-12">
                    <h2>There is no room with {roomId} id!</h2>
                </div>
            </div>
        );
    }

    const makeReservationOnClick = async () => {
        // Temp & not valuable :)
        const secret_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Il9pZCI6IjVlODY1OWIwYzg1M2EzMTU1YzBhNGJlMSIsImVtYWlsIjoic3Rhc2lla2dydXpAZ21haWwuY29tIiwicm9sZSI6IkFETUlOIn0sImlhdCI6MTU4NTg2MzE3OH0.oXtPbMGX31EExflHnFxM8_-jq-DiQbekVBEkL_S7WNc";
        const userId = "5e8659b0c853a3155c0a4be1";

        try {
            await axios.post(`/create-reservation`, {
            }, {
                data: {
                    startDate: selectedInterval.fromDate.format("YYYY-MM-DD"),
                    endDate: selectedInterval.toDate.format("YYYY-MM-DD"),
                    userId: userId,
                    roomId: roomId,
                    pricePerDay: room.pricePerDay,
                    totalPrice: calculateTotalPrice(room, selectedInterval)
                },
                params: {
                    secret_token: secret_token
                }
            });
            window.location = `/`;
        } catch (error) {
            console.log(error);
        }
    }

    if (!room) return <h3>{message}</h3>
    return (
        <div className="row">
            <div className="col-12">

                <div className="container bg-white">
                    <div className="row">
                        <div className="col-12">
                            <h3 className="room-page-title pt-3 pb-3" style={{ borderBottom: "1.2px solid rgba(216, 216, 216, 0.63)" }}>
                                {room.name}
                            </h3>
                        </div>
                    </div>

                    <div className="row mt-2">
                        <div className="col-md-7">
                            <h5 className="title-color">Description</h5>
                            <p className="global-font font-weight-light" style={{ color: "#6A6972" }}>
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin non odio et odio condimentum egestas. Duis viverra pulvinar odio, sit amet luctus nulla mattis quis. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Pellentesque urna libero, ullamcorper ac nunc et, sollicitudin tincidunt ex. Donec pharetra purus sed nibh ultricies ullamcorper. Sed ut urna velit. Sed fringilla neque lorem, tincidunt euismod risus congue eu. Vestibulum libero enim, iaculis at arcu id, suscipit feugiat metus.
                                    </p>
                        </div>

                        <div className="col-md-5">
                            <div className="row">
                                <img className="card-img pr-md-4 mt-1 mb-2 room-page-image" src={room.photo ? room.photo : noImagePlaceholder} />
                            </div>

                            <h5 className="title-color mb-3">Amenities</h5>

                            <div className="row pb-3">
                                <div className="d-flex justify-content-between col-md-10">
                                    {
                                        room.amenities.sort().map(amenity => {
                                            let img_src = images("./" + mapAmenityNameToAssetFilename(amenity));
                                            return <img className="room-page-amenity" src={img_src} alt={amenity} key={amenity} />
                                        })
                                    }
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row mt-3">
                        <div className="col-12 text-center mb-2 ">
                            <h3>Conference Room Timesheet</h3>
                            <p className="subtitle">Drag on calendar to make reservation selection</p>
                        </div>

                        <div className="col-12">
                            <ReservationCalendar
                                onSelectedInterval={onSelectedInterval}
                                dateIntervalToGenerate={dateIntervalToGenerate}
                                dows={room.dows}
                                roomId={roomId} />
                        </div>

                        {
                            !selectedInterval
                                ? <div className="col-12 mt-3">
                                    <button type="submit" className="btn btn-block secondary-btn" disabled={true}>Make reservation</button>
                                </div>
                                : <>
                                    <div className="col-12">
                                        Selected date interval: <b>{selectedInterval.fromDate.format("DD-MM-YYYY")} - {selectedInterval.toDate.format("DD-MM-YYYY")}</b>
                                    </div>

                                    <div className="col-12">
                                        Total Price: <b>{calculateTotalPrice(room, selectedInterval)}PLN</b>
                                    </div>

                                    <div className="col-12 mt-3">
                                        <CreatedReservationModal
                                            selectedDateInterval={selectedInterval}
                                            reservationMakeOnClick={makeReservationOnClick} />
                                    </div>
                                </>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

const mapAmenityNameToAssetFilename = amenityName => {
    switch (amenityName) {
        case "amtTV":
            return "tv.svg";
        case "amtMicrophone":
            return "mic.svg";
        case "amtProjector":
            return "projector.svg";
        case "amtPhone":
            return "phone.svg";
    }
}

const calculateTotalPrice = (room, selectedInterval) => {
    const days = selectedInterval.toDate.diff(selectedInterval.fromDate, 'days') + 1;
    return room.pricePerDay * days;
};

export default RoomPage;