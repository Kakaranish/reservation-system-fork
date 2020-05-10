import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle';
import "../assets/css/Sidebar.css";
import { Link } from "react-router-dom";
import homeIcon from '../assets/icons/sidebar/home.svg';
import reservationsIcon from '../assets/icons/sidebar/reservations.svg';
import roomsIcon from '../assets/icons/sidebar/rooms.svg';
import createRoomIcon from '../assets/icons/sidebar/create-room.svg';
import settingsIcon from '../assets/icons/sidebar/settings.svg';
import helpIcon from '../assets/icons/sidebar/help.svg';
import loginIcon from '../assets/icons/sidebar/log-in.svg';
import logoutIcon from '../assets/icons/sidebar/log-out.svg';
import registerIcon from '../assets/icons/sidebar/register.svg';
import axios from 'axios';
import MainPage from "../pages/MainPage";

const Sidebar = (props) => {

    const handleLogout = async () => {
        const result = await axios.post('/auth/logout', {}, { validateStatus: false });
        if (result.status !== 200) {
            console.log('error while logging out');
            return;
        }
        window.location = `/`;
    };

    return (
        <div className="border-right sidebar" id="sidebar-wrapper">
            <div id="sidebar-title">
                <div className="sidebar-heading">
                    Conference Room <br />
                    Reservation System
                </div>
            </div>
            <div className="list-group list-group-flush">
                <Link to="/">
                    <div className="sidebar-item list-group-item list-group-item-action d-flex align-items-center">
                        <img src={homeIcon} className="icon" />
                        <>Dashboard</>
                    </div>
                </Link>

                <Link to="/filter-rooms" >
                    <div className="sidebar-item list-group-item list-group-item-action d-flex align-items-center">
                        <img src={roomsIcon} className="icon" />
                        <>Conference Rooms</>
                    </div>
                </Link>

                {
                    !props.user ? <></>
                        : <Link to="/user/manage-reservations">
                            <div className="sidebar-item list-group-item list-group-item-action d-flex align-items-center">
                                <img src={reservationsIcon} className="icon" />
                                <>Your Reservations</>
                            </div>
                        </Link>
                }

                {
                    props.user?.role !== 'ADMIN'
                        ?
                        <></>

                        :
                        <>
                            <Link to="/admin/manage-reservations">
                                <div className="sidebar-item list-group-item list-group-item-action d-flex align-items-center">
                                    <img src={settingsIcon} className="icon" />
                                    <>Users Reservations</>
                                </div>
                            </Link>

                            <Link to="/create-room">
                                <div className="sidebar-item list-group-item list-group-item-action d-flex align-items-center">
                                    <img src={createRoomIcon} className="icon" />
                                    <>Create Room</>
                                </div>
                            </Link>
                        </>
                }

                <Link to={MainPage}>
                    <div className="sidebar-item list-group-item list-group-item-action d-flex align-items-center">
                        <img src={helpIcon} className="icon" />
                        <>Help</>
                    </div>
                </Link>

                <div className='items-separator'></div>

                {
                    props.user
                        ?
                        <div className="sidebar-item list-group-item list-group-item-action d-flex align-items-center"
                            style={{ cursor: 'pointer' }} onClick={handleLogout}>
                            <img src={logoutIcon} className="icon" />
                            <>Log Out</>
                        </div>
                        :
                        <>
                            <Link to="/login" >
                                <div className="sidebar-item list-group-item list-group-item-action d-flex align-items-center">
                                    <img src={loginIcon} className="icon" />
                                    <>Log In</>
                                </div>
                            </Link>

                            <Link to="/register" >
                                <div className="sidebar-item list-group-item list-group-item-action d-flex align-items-center">
                                    <img src={registerIcon} className="icon" />
                                    <>Register</>
                                </div>
                            </Link>
                        </>
                }

            </div>
        </div>
    );
};

export default Sidebar;