import React from 'react';
import { Link } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle';
import '../assets/css/auth.css';

const LoginPage = () => {
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
                                        <>Conference Room</><br />
                                        <>Reservation System</>
                                    </h3>

                                    <p className="subtitle">
                                        Welcome! To use our service just sing in!
                                    </p>

                                    <form>
                                        <div className="mt-4">
                                            <input type="text" name="username" className="form-control" id="username" placeholder="Username..." />
                                        </div>

                                        <div className="mt-4">
                                            <input type="password" name="password" className="form-control" id="password" placeholder="Password..." />
                                        </div>

                                        <div className="mt-4">
                                            <input type="password" name="confirmedPassword" className="form-control" id="confirmedPassword" placeholder="Confirm Password..." />
                                        </div>

                                        <div className="row">
                                            <div className="col-12 col-md-6">
                                                <button className="btn btn-lg btn-block btn-login text-uppercase mb-2 mt-5 primary-btn" type="submit">
                                                    Sign In
                                                </button>
                                            </div>

                                            <div className="col-12 col-md-6 ">
                                                <button id="singup-button" className="btn btn-lg btn-block btn-login text-uppercase mb-2 mt-md-5 mt-2 secondary-btn" type="submit">
                                                    <Link to="/register">
                                                        Sign Up
                                                    </Link>
                                                </button>
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

export default LoginPage;