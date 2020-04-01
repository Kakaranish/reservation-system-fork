import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle';
import "../assets/css/Sidebar.css";
import { Link } from "react-router-dom";
import TestPage from "../pages/TestPage";
import homeIcon from '../assets/icons/sidebar/home.svg';
import reservationsIcon from '../assets/icons/sidebar/reservations.svg';
import roomsIcon from '../assets/icons/sidebar/rooms.svg';
import settingsIcon from '../assets/icons/sidebar/settings.svg';
import helpIcon from '../assets/icons/sidebar/help.svg';

const Sidebar = () => {
    return (
        <div className="border-right sidebar" id="sidebar-wrapper">
            <div id="sidebar-title">
                <div className="sidebar-heading">
                    Conference Room <br />
                    Reservation System
                </div>
            </div>
            <div className="list-group list-group-flush">

                <Link to={TestPage}>
                    <div className="sidebar-item list-group-item list-group-item-action d-flex align-items-center">
                        <img src={homeIcon} className="icon" />
                        <>Dashboard</>
                    </div>
                </Link>

                <Link to={TestPage}>
                    <div className="sidebar-item list-group-item list-group-item-action d-flex align-items-center">
                        <img src={roomsIcon} className="icon" />
                        <>Conference Rooms</>
                    </div>
                </Link>


                <Link to={TestPage}>
                    <div className="sidebar-item list-group-item list-group-item-action d-flex align-items-center">
                        <img src={reservationsIcon} className="icon" />
                        <>Your Reservations</>
                    </div>
                </Link>

                <Link to={TestPage}>
                    <div className="sidebar-item list-group-item list-group-item-action d-flex align-items-center">
                        <img src={settingsIcon} className="icon" />
                        <>Settings</>
                    </div>
                </Link>

                <Link to={TestPage}>
                    <div className="sidebar-item list-group-item list-group-item-action d-flex align-items-center">
                        <img src={helpIcon} className="icon" />
                        <>Help</>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default Sidebar;