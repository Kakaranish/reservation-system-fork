import React from "react";
import '../assets/css/common.css';
import '../assets/css/auth.css';

const Checkbox = (match) => {
    const name = match.name;
    const label = match.label;
    const checkedByDefault = match.checkedByDefault ? match.checkedByDefault : false;

    return (
        <React.Fragment>
            <div className="custom-control custom-checkbox custom-control-inline checkbox-with-accent">
                <input type="checkbox" className="custom-control-input" id={name} name={name} defaultChecked={checkedByDefault} style={{border: "0"}} />
                <label className="custom-control-label" htmlFor={name}>{label}</label>
            </div>
        </React.Fragment>
    );
}

export default Checkbox;