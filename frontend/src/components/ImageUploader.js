import React, { useState } from "react";

const ImageUploader = (params) => {
    const handleFileChange = params.onChange;
    const [previewPath, setPreviewPath] = useState(null);

    const onChange = async event => {
        const file = event.target.files[0];
        if (!file || !isFileImageType(file)) {
            setPreviewPath(null);
            return;
        }
        const path = URL.createObjectURL(file);
        setPreviewPath(path);
        handleFileChange(file);
    };

    return (
        <>
            <div className="custom-file">
                <input className="custom-file-input" type="file" onChange={onChange} accept="image/*" />
                <label className="custom-file-label" htmlFor="uploadedFile">Choose file</label>
            </div>

            {
                previewPath &&
                <div className="text-center mt-4 mb-2">
                    <img src={previewPath} className="img-fluid" />
                </div>
            }

        </>
    );
};

/**
 * @param {File} file 
 */
function isFileImageType(file) {
    const fileType = file.type;
    const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
    return validImageTypes.includes(fileType);
}

export default ImageUploader;