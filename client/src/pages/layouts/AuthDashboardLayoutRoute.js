import React, { useState, useEffect } from 'react';
import { Redirect, Route } from "react-router-dom";
import axios from 'axios';
import DashbordLayout from "./DashbordLayout";

const AuthDashboardLayoutRoute = ({ component: Component, ...rest }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const auth = async () => {
            const userEmail = (await axios.post('/auth/verify')).data.email;
            setIsAuthenticated(userEmail ? true : false);
            setLoading(false);
        };
        auth();
    }, []);

    if (loading) return <div>Loading...</div>
    else return <Route {...rest} render={matchProps => (
        isAuthenticated ?
            <DashbordLayout>
                <Component {...matchProps} />
            </DashbordLayout>
            : (() => {
                alert('You must be logged in. Redirecting to login screen...');
                return <Redirect to={{ pathname: '/login' }} />
            })()
    )} />
};

export default AuthDashboardLayoutRoute;