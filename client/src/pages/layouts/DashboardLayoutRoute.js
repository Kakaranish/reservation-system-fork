import React, { useState, useEffect } from 'react';
import { Redirect, Route } from "react-router-dom";
import axios from 'axios';
import DashbordLayout from "./DashbordLayout";

const DashboardLayoutRoute = ({ component: Component, ...rest }) => {
    const [state, setState] = useState({ loading: true, email: null })

    useEffect(() => {
        const auth = async () => {
            const result = await axios.post('/auth/verify');
            if (!result.data.email && rest.authRequired) alert('You must be logged in. Redirecting to login screen...');
            setState({
                loading: false,
                email: result.data.email
            });
        };
        auth();
    }, []);

    if (state.loading) return <DashbordLayout></DashbordLayout>;
    else return <Route {...rest} render={matchProps => (
        !rest.authRequired || state.email
            ?
            <DashbordLayout email={state.email}>
                <Component {...matchProps} email={state.email} />
            </DashbordLayout>
            
            :
            <Redirect to={{ pathname: '/login' }} />
    )} />
};

export default DashboardLayoutRoute;