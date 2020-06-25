import React, { useState } from "react";
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { requestHandler } from "../../common/utils";
import RoomForm from "../../components/owner/RoomForm";
import ValidationErrors from "../../components/ValidationErrors";
import ImageUploader from '../../components/ImageUploader';

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

        const action = async () => axios.post('/owner/rooms', formData, {
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

                <RoomForm handleSubmit={handleSubmit} setFile={setFile}>
                    <ValidationErrors errors={validationErrors} />

                    <div className="row">
                        <div className="col-12">
                            <ImageUploader onChange={handleFileChange} />
                        </div>

                        <div className="col-12 mt-2">
                            <button type="submit" className="btn btn-block primary-btn">Create Room</button>
                        </div>
                    </div>
                </RoomForm>
            </div>
        </>
    );
};

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