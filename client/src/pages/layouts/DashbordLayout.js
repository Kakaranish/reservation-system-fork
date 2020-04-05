import React from 'react';
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

const DashboardLayout = ({ children }) => {
    return (
        <div className="d-flex" id="wrapper">
            <Sidebar />
            <div id="page-content-wrapper">
                <Navbar />
                <div className="container-fluid py-4 px-5">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default DashboardLayout;