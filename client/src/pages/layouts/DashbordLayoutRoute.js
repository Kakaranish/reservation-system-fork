import React from 'react';
import { Route } from "react-router-dom";
import DashbordLayout from "./DashbordLayout";

const DashboardLayoutRoute = ({ component: Component, ...rest }) => {
    return (
        <Route {...rest} render={matchProps => (
            <DashbordLayout>
                <Component {...matchProps} />
            </DashbordLayout>
        )} />
    )
};

export default DashboardLayoutRoute;