import React from 'react';
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

const DashboardLayout = (props) => {
    return (
        <div className="d-flex" id="wrapper">
            <Sidebar />
            <div id="page-content-wrapper">
                <Navbar />
                <div className="container-fluid py-4 px-5">
                    {props.children}
                </div>
            </div>
        </div>
    );
}

export default DashboardLayout;