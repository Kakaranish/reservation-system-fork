import React from "react";
import { Link } from "react-router-dom";
import '../assets/css/auth.css';

const RegisterPage = () => {
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

                                    <form>

                                        <div className="row mt-5">
                                            <div className="col-md-6 col-12">
                                                <input type="text" name="firstName" className="form-control" id="firstName" placeholder="First Name..." />
                                            </div>

                                            <div className="col-md-6 col-12 mt-md-0 mt-3">
                                                <input type="text" name="lastName" className="form-control" id="lastName" placeholder="Last Name..." />
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-12 mt-3">
                                                <input type="text" name="email" className="form-control" id="email" placeholder="Email..." />
                                            </div>

                                            <div className="col-12 mt-3">
                                                <input type="password" name="password" className="form-control" id="password" placeholder="Password..." />
                                            </div>


                                            <div className="mt-3">
                                                <input type="password" name="confirmedPassword" className="form-control" id="confirmedPassword" placeholder="Confirm Password..." />
                                            </div>
                                        </div>

                                        <div class="custom-control custom-checkbox mt-4">
                                            <input type="checkbox" class="custom-control-input custom-checkbox" id="customCheck" name="example1" />
                                            <label class="custom-control-label" for="customCheck">
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
                                                <Link to="/login">
                                                    Already have account? Sign In.
                                                </Link>
                                            </div>
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

export default RegisterPage;