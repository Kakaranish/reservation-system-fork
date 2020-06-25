import React, { useState } from "react";

const ImageUploader = (props) => {

    const { defaultPreview, showRestoreDefaultBtn } = props;
    const handleFileChange = props.onChange;
    const [previewPath, setPreviewPath] = useState(defaultPreview);

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

    const onRestore = () => {
        setPreviewPath(defaultPreview);
        handleFileChange(null);
    }

    return (
        <>
            <div className="custom-file">
                <input className="custom-file-input" type="file"
                    onChange={onChange} accept="image/*" />
                <label className="custom-file-label" htmlFor="uploadedFile">
                    Choose file
                </label>
            </div>

            {
                showRestoreDefaultBtn &&
                <button type="button" className="btn btn-secondary btn-block"
                    onClick={onRestore}>
                    Restore initial image
                </button>
            }

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