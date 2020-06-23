import React from "react";
import '../assets/css/RoomCard.css';
import { Link } from "react-router-dom";
import noImagePlaceholder from "../assets/icons/no-image.svg";
var images = require.context('../assets/images/amenities', true);

const RoomCard = ({ roomData }) => {
    return (
        <div className="col-12 col-sm-6 col-xl-4" >
            <div className="card mb-3">
                <div className="card-body primary-font" style={{ fontSize: "14px" }}>
                    <div className="card-title">
                        <div className="pt-1 pb-3 room-card-title-box">
                            <div className="room-card-title">
                                {roomData.name}
                            </div>

                            {
                                roomData.totalPrice &&
                                <div className="room-price-color">
                                    Total Price:
                                    <span className="px-1"></span>
                                    {roomData.totalPrice}PLN
                                </div>
                            }
                        </div>
                    </div>

                    <img className="card-img mt-1 mb-2 room-card-image" src={roomData.photoUrl ? roomData.photoUrl : noImagePlaceholder} />

                    <div className="text-right room-price-color mb-1">
                        Price/Day: {roomData.pricePerDay}PLN
                    </div>

                    <div className="row mb-4">
                        <div className="col-6">
                            Location:
                            <span className="px-1" style={{ fontWeight: "300" }}>
                                {roomData.location}
                            </span>
                        </div>

                        <div className="col-6 text-right">
                            Capacity:
                            <span className="px-1" style={{ fontWeight: "300" }}>
                                {roomData.capacity} people
                            </span>
                        </div>
                    </div>

                    <div className="row mb-4">
                        <div className="d-flex col-12 justify-content-around">
                            {
                                roomData.amenities.sort().map(amenity => {
                                    let img_src = images("./" + mapAmenityNameToAssetFilename(amenity));
                                    return <img className="room-card-amenity" src={img_src} alt={amenity} key={`${amenity}-${roomData["_id"]}`} />
                                })
                            }
                        </div>
                    </div>
                    <Link to={`/rooms/${roomData["_id"]}`}>
                        <button type="button" className="btn btn-lg btn-block mt-2 primary-btn show-more-details-btn">
                            Show more information
                        </button>
                    </Link>

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

export default RoomCard;