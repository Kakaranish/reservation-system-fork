import React, { useState } from 'react';
import ImageUploader from '../ImageUploader';
import ValidationErrors from '../ValidationErrors';
import Checkbox from '../Checkbox';

const RoomForm = ({ handleSubmit = () => { }, setFile = () => { } }) => {

    const [validationErrors, setValidationErrors] = useState(null);

    const handleFileChange = passedFile => setFile(passedFile);

    return <>
        <form onSubmit={handleSubmit}>
            <div className="form-group row">
                <label htmlFor="Name" className="col-sm-2 col-form-label">Name</label>
                <div className="col-sm-10">
                    <input type="name" className="form-control" id="name" name="name" placeholder="Name..." required />
                </div>
            </div>
            <div className="form-group row">
                <label htmlFor="Capacity" className="col-sm-2 col-form-label">Capacity</label>
                <div className="col-sm-10">
                    <input type="number" className="form-control" id="capacity" name="capacity" placeholder="Capacity..." required />
                </div>
            </div>
            <div className="form-group row">
                <label htmlFor="Location" className="col-sm-2 col-form-label">Location</label>
                <div className="col-sm-10">
                    <input type="location" className="form-control" id="location" name="location" placeholder="Location..." required />
                </div>
            </div>
            <div className="form-group row">
                <label htmlFor="PricePerDay" className="col-2 col-form-label" placeholder="Price Per Day" required>Price/Day [PLN]</label>
                <div className="col-sm-10">
                    <input className="form-control" name="pricePerDay" id="pricePerDay" type="number" step="0.01" required />
                </div>
            </div>
            <div className="form-group row">
                <label htmlFor="description" className="col-2 col-form-label" placeholder="Description..." >Description</label>
                <div className="col-sm-10">
                    <textarea className="form-control" id="description" name="description" rows="3" required></textarea>
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

                <ValidationErrors errors={validationErrors} />

                <div className="col-12 mt-2">
                    <button type="submit" className="btn btn-block primary-btn">Create Room</button>
                </div>
            </div>
        </form>
    </>
};

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
];

export default RoomForm;