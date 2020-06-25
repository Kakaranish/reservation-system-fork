import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { requestHandler, getFormDataJsonFromEvent } from "../../common/utils";
import RoomForm from "../../components/owner/RoomForm";
import ValidationErrors from "../../components/ValidationErrors";
import ImageUploader from '../../components/ImageUploader';
import AwareComponentBuilder from '../../common/AwareComponentBuilder';
import { toast } from 'react-toastify';

const EditRoomPage = (props) => {

    const roomId = props.match.params.id;

    const [state, setState] = useState({ loading: true });
    useEffect(() => {
        const fetch = async () => {
            const action = async () => axios.get(`/rooms/${roomId}`,
                { validateStatus: false })
            const room = await requestHandler(action);

            if (room.ownerId === props.identity.id) setState({ loading: false, room });
            else setState({ loading: false });

            console.log(room)
        };
        fetch();
    }, []);

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

        const uri = `/rooms/${roomId}`;
        const action = async () => axios.put(uri, formData, {
            validateStatus: false,
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        await requestHandler(action, {
            status: 200,
            callback: async () => {
                toast('Room updated');
                history.push('/refresh');
            }
        });
    };

    if (state.loading) return <></>
    else if (!state.room) return <h3>There is no such room</h3>

    return <>
        <div className="py-3 px-4" >
            <div className="row" className="text-center" style={{ "marginBottom": "30px" }}>
                <h2>Edit conference room</h2>
            </div>

            <RoomForm handleSubmit={handleSubmit} room={state.room}>
                <ValidationErrors errors={validationErrors} />

                <div className="row">
                    <div className="col-12">
                        <ImageUploader onChange={handleFileChange}
                            defaultPreview={state.room.image.uri}
                            showRestoreDefaultBtn={true} />
                    </div>

                    <div className="col-12 mt-2">
                        <button type="submit" className="btn btn-block primary-btn">
                            Update
                        </button>
                    </div>
                </div>
            </RoomForm>
        </div>
    </>
};

function processFormData(formData) {
    const formDataKeyValues = Array.from(formData.entries())
        .map(x => ({ "name": x[0], "value": x[1] }));

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

    return validationErrors;
}

export default new AwareComponentBuilder()
    .withIdentityAwareness()
    .build(EditRoomPage);