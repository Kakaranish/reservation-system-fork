import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import axios from 'axios';
import '../../assets/css/auth.css';
import '../../assets/css/common.css';
import AwareComponentBuilder from "../../common/AwareComponentBuilder";
import ValidationErrors from "../../components/ValidationErrors";

const RegisterPage = (props) => {

    const history = useHistory();

    const [validationErrors, setValidationErrors] = useState(null);

    const handleOnSubmit = async event => {
        event.preventDefault();
        const formData = new FormData(event.target);

        let formDataJson = {};
        for (const [key, value] of formData.entries()) {
            formDataJson[key] = value;
        }

        if (formDataJson.password !== formDataJson.confirmedPassword) {
            setValidationErrors(['Passwords are different']);
            return;
        }

        const result = await axios.post('/auth/register', formDataJson, { validateStatus: false });
        if (result.data.errors?.length > 0) {
            setValidationErrors(result.data.errors.map(e => e.msg ?? e));
            return;
        }

        setValidationErrors(null);
        props.setIdentity(result.data);
        history.push('/');
    }

    return (
        <div id="auth-container" className="container-fluid">
            <div className="row no-gutter">
                {/* Left container */}
                <div id="signup-side-img" className="d-none d-md-flex col-md-4 col-lg-6">
                </div>

                {/* Right container */}
                <div className="col-md-8 col-lg-6">
                    <div className="login d-flex align-items-center py-5">
                        <div className="container">
                            <div className="row">
                                <div className="col-md-9 col-lg-8 mx-auto">
                                    <h3 className="mb-2 title">
                                        <>Conference Room</><br />
                                        <>Reservation System</>
                                    </h3>

                                    <p className="subtitle">
                                        Fill all fields and joins us!
                                    </p>

                                    <form onSubmit={handleOnSubmit}>
                                        <div className="row mt-5">
                                            <div className="col-md-6 col-12">
                                                <input type="text" name="firstName" className="form-control" id="firstName" placeholder="First Name..." required />
                                            </div>

                                            <div className="col-md-6 col-12 mt-md-0 mt-3">
                                                <input type="text" name="lastName" className="form-control" id="lastName" placeholder="Last Name..." required />
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-12 mt-3">
                                                <input type="text" name="email" className="form-control" id="email" placeholder="Email..." required />
                                            </div>

                                            <div className="col-12 mt-3">
                                                <input type="password" name="password" className="form-control" id="password" placeholder="Password..." required />
                                            </div>


                                            <div className="col-12 mt-3">
                                                <input type="password" name="confirmedPassword" className="form-control" id="confirmedPassword" placeholder="Confirm Password..." required />
                                            </div>
                                        </div>

                                        <div className="custom-control checkbox-with-accent mt-4">
                                            <input type="checkbox" className="custom-control-input checkbox-with-accent" id="customCheck" name="example1" required />
                                            <label className="custom-control-label" htmlFor="customCheck">
                                                I agree with terms and conditions
                                            </label>
                                        </div>

                                        <div className="row">
                                            <div className="col-12">
                                                <button className="btn btn-lg btn-block btn-login text-uppercase mb-2 mt-4 primary-btn" type="submit">
                                                    Sing Up
                                                </button>
                                            </div>

                                            <div className="col-12 mt-2 have-already-account text-center">
                                                <Link to="/auth/login">
                                                    Already have account? Sign In.
                                                </Link>
                                            </div>
                                        </div>

                                        <ValidationErrors errors={validationErrors} />
                                        
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
    .build(RegisterPage);