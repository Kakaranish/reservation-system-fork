import React, { useState } from "react";
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import Checkbox from "../../components/Checkbox";
import ImageUploader from "../../components/ImageUploader";
import ValidationErrors from "../../components/ValidationErrors";
import { requestHandler } from "../../common/utils";

const CreateRoomPage = () => {

    const history = useHistory();
    const [file, setFile] = useState(null);
    const [validationErrors, setValidationErrors] = useState(null);

    const handleFileChange = passedFile => setFile(passedFile);
    const handleSubmit = async event => {
        event.preventDefault();

        const formData = new FormData(event.target);
        formData.append('file', file);
        processFormData(formData);

        const formDataValidationErrors = validateFormData(formData, file);
        if (formDataValidationErrors.length > 0) {
            setValidationErrors(formDataValidationErrors);
            return;
        }

        const action = async () => axios.post('/rooms', formData, {
            validateStatus: false,
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        await requestHandler(action, {
            status: 200,
            callback: async () => history.push('/rooms')
        });
    };

    return (
        <>
            <div className="py-3 px-4" >
                <div className="row" className="text-center" style={{ "marginBottom": "30px" }}>
                    <h2>Create conference room</h2>
                </div>

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
            </div>
        </>
    );
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

/**
 * @param {FormData} formData 
 */
const validateFormData = (formData, passedFile) => {
    const validationErrors = [];

    if (JSON.parse(formData.get('amenities')).length === 0)
        validationErrors.push("At least one amenity required");
    if (JSON.parse(formData.get('dows')).length === 0)
        validationErrors.push("At least one day of availability required");
    if (!passedFile)
        validationErrors.push("Conference room must have image");

    return validationErrors;
}

export default CreateRoomPage;