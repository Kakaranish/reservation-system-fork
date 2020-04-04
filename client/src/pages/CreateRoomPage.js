import React, { useState } from "react";
import { Redirect } from "react-router-dom";
import Checkbox from "../components/Checkbox";
import ImageUploader from "../components/ImageUploader";
import axios from 'axios';

const amenities = [
    { name: "amtTV", label: "TV", "checkedByDefault": false },
    { name: "amtMicrophone", label: "Microphone", "checkedByDefault": false },
    { name: "amtProjector", label: "Projector", "checkedByDefault": true },
    { name: "amtPhone", label: "Phone", "checkedByDefault": false }
];
const dows = [
    { name: "dowMonday", label: "Monday", "checkedByDefault": true },
    { name: "dowTuesday", label: "Tuesday", "checkedByDefault": true },
    { name: "dowWednesday", label: "Wednesday", "checkedByDefault": true },
    { name: "dowThursday", label: "Thursday", "checkedByDefault": true },
    { name: "dowFriday", label: "Friday", "checkedByDefault": true },
    { name: "dowSaturday", label: "Satursday", "checkedByDefault": false },
    { name: "dowSunday", label: "Sunday", "checkedByDefault": false },
]

function processFormData(formData) {
    const formDataKeyValues = Array.from(formData.entries()).map(x => {
        return { "name": x[0], "value": x[1] }
    });

    const amenities = formDataKeyValues.filter(x => x.name.startsWith("amt")).map(x => x.name);
    amenities.forEach(amenity => formData.delete(amenity));
    formData.append("amenities", JSON.stringify(amenities));

    const dows = formDataKeyValues.filter(x => x.name.startsWith("dow")).map(x => x.name);
    dows.forEach(dow => formData.delete(dow));
    formData.append("dows", JSON.stringify(dows))
}

const CreateRoomPage = () => {
    const [file, setFile] = useState(null);
    const handleFileChange = passedFile => {
        setFile(passedFile);
    };
    const [created, setCreated] = useState(null);

    const handleSubmit = async event => {
        event.preventDefault();

        const formData = new FormData(event.target);
        formData.append('file', file);
        processFormData(formData);

        try {
            const res = await axios.post(`/create-room?secret_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Il9pZCI6IjVlODY1OWIwYzg1M2EzMTU1YzBhNGJlMSIsImVtYWlsIjoic3Rhc2lla2dydXpAZ21haWwuY29tIiwicm9sZSI6IkFETUlOIn0sImlhdCI6MTU4NTg2MzE3OH0.oXtPbMGX31EExflHnFxM8_-jq-DiQbekVBEkL_S7WNc`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            const roomId = res.data.roomId;
            // setCreated(true);
        } catch (error) {
            if (error.response.status === 500) {
                console.log("There was a problem with the server.");
            } else {
                console.log(error.response.data.errors);
            }
        }
    };

    return (
        <React.Fragment>
            {
                !created ? null : <Redirect to="/"></Redirect>
            }
            <div className="py-3 px-4" >
                <div className="row" className="text-center" style={{ "marginBottom": "30px" }}>
                    <h2>Create room</h2>
                </div>
                <form id="createRoomForm" onSubmit={handleSubmit}>
                    <div className="form-group row">
                        <label htmlFor="Name" className="col-sm-2 col-form-label">Name</label>
                        <div className="col-sm-10">
                            <input type="name" className="form-control" id="name" name="name" placeholder="Name..." />
                        </div>
                    </div>
                    <div className="form-group row">
                        <label htmlFor="Capacity" className="col-sm-2 col-form-label">Capacity</label>
                        <div className="col-sm-10">
                            <input type="number" className="form-control" id="capacity" name="capacity" placeholder="Capacity..." />
                        </div>
                    </div>
                    <div className="form-group row">
                        <label htmlFor="Location" className="col-sm-2 col-form-label">Location</label>
                        <div className="col-sm-10">
                            <input type="location" className="form-control" id="location" name="location" placeholder="Location..." />
                        </div>
                    </div>
                    <div className="form-group row">
                        <label htmlFor="PricePerDay" className="col-2 col-form-label" placeholder="Price Per Day">Price/Day [PLN]</label>
                        <div className="col-sm-10">
                            <input className="form-control" type="number" name="pricePerDay" id="pricePerDay" />
                        </div>
                    </div>
                    <div className="form-group row">
                        <label htmlFor="description" className="col-2 col-form-label" placeholder="Description...">Description</label>
                        <div className="col-sm-10">
                            <textarea className="form-control" id="description" name="description" rows="3"></textarea>
                        </div>
                    </div>
                    <div className="form-group row">
                        <label htmlFor="Amenities" className="col-sm-2 col-form-label">Amenities</label>
                        <div id="amenities" className="col-10 text-left align-self-center">
                            {amenities.map(x => < Checkbox key={x.name} name={x.name} label={x.label} checkedByDefault={x.checkedByDefault} />)}
                        </div>
                    </div>
                    <div className="form-group row">
                        <label htmlFor="Availability" className="col-sm-2 col-form-label">Availability</label>
                        <div className="col-10 text-left align-self-center ">
                            {dows.map(x => <Checkbox key={x.name} name={x.name} label={x.label} checkedByDefault={x.checkedByDefault} />)}
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12">
                            <ImageUploader onChange={handleFileChange} />
                        </div>
                        <div className="col-12 mt-2">
                            <button type="submit" className="btn btn-block primary-btn">Create Room</button>
                        </div>
                    </div>
                </form>
            </div>
        </React.Fragment >
    );
};

export default CreateRoomPage;