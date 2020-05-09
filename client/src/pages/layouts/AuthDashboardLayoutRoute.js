import React, { useState, useEffect } from 'react';
import { Redirect, Route } from "react-router-dom";
import axios from 'axios';
import DashbordLayout from "./DashbordLayout";

const AuthDashboardLayoutRoute = ({ component: Component, ...rest }) => {
    const [email, setEmail] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const auth = async () => {
            const result = (await axios.post('/auth/verify'));
            setEmail(result.data.email);
            setLoading(false);
        };
        auth();
    }, []);

    if (loading) return <DashbordLayout></DashbordLayout>;
    else return <Route {...rest} render={matchProps => (
        email ?
            <DashbordLayout email={email}>
                <Component {...matchProps} email={email} />
            </DashbordLayout>
            : (() => {
                alert('You must be logged in. Redirecting to login screen...');
                return <Redirect to={{ pathname: '/login' }} />
            })
    )} />
};

export default AuthDashboardLayoutRoute;