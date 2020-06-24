import React, { useState } from 'react';
import { Link, useHistory } from "react-router-dom";
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle';
import '../assets/css/auth.css';
import '../assets/css/common.css';
import AwareComponentBuilder from '../common/AwareComponentBuilder';
import ValidationErrors from '../components/ValidationErrors';

const LoginPage = (props) => {

    const history = useHistory();

    const [validationErrors, setValidationErrors] = useState(null);

    const handleSubmit = async event => {
        event.preventDefault();
        const formData = new FormData(event.target);

        let formDataJson = {};
        for (const [key, value] of formData.entries()) formDataJson[key] = value;

        const result = await axios.post('/auth/login', formDataJson,
            { validateStatus: false })
        if (result.status !== 200 && result.data.errors?.length > 0) {
            setValidationErrors(result.data.errors.map(e => e.msg));
            return;
        }

        props.setIdentity(result.data);

        setValidationErrors(null);
        history.push('/');
    };

    return (
        <div id="auth-container" className="container-fluid">
            <div className="row no-gutter">
                {/* Left container */}
                <div id="signin-side-img" className="d-none d-md-flex col-md-4 col-lg-6">
                </div>

                {/* Right container */}
                <div className="col-md-8 col-lg-6">
                    <div className="login d-flex align-items-center py-5">
                        <div className="container">
                            <div className="row">
                                <div className="col-md-9 col-lg-8 mx-auto">
                                    <h3 className="mb-2 title">
                                        Conference Room<br />
                                        Reservation System
                                    </h3>

                                    <p className="subtitle">
                                        Welcome! To use our service just sing in!
                                    </p>

                                    <form onSubmit={handleSubmit}>
                                        <div className="mt-4">
                                            <input type="email" name="email" className="form-control" id="email" placeholder="Email..." required />
                                        </div>

                                        <div className="mt-4">
                                            <input type="password" name="password" className="form-control" id="password" placeholder="Password..." required />
                                        </div>

                                        <div className="row">
                                            <div className="col-12 col-md-6">
                                                <button className="btn btn-lg btn-block btn-login text-uppercase mb-2 mt-5 primary-btn" type="submit">
                                                    Sign In
                                                </button>
                                            </div>

                                            <div className="col-12 col-md-6 ">
                                                <Link to="/auth/register">
                                                    <button id="singup-button" type="button" className="btn btn-lg btn-block btn-login text-uppercase mb-2 mt-md-5 mt-2 secondary-btn">
                                                        Sign Up
                                                    </button>
                                                </Link>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <ValidationErrors errors={validationErrors} />
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default new AwareComponentBuilder()
    .withIdentityAwareness()
    .build(LoginPage);