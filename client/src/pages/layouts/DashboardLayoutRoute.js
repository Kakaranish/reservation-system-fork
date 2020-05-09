import React, { useState, useEffect } from 'react';
import { Redirect, Route } from "react-router-dom";
import axios from 'axios';
import DashbordLayout from "./DashbordLayout";

const DashboardLayoutRoute = ({ component: Component, ...rest }) => {
    const [state, setState] = useState({ loading: true, user: null })

    useEffect(() => {
        const auth = async () => {
            const result = await axios.post('/auth/verify');
            if (!result.data.user && rest.authRequired) alert('You must be logged in. Redirecting to login screen...');
            setState({
                loading: false,
                user: result.data.user
            });
        };
        auth();
    }, []);

    if (state.loading) return <DashbordLayout></DashbordLayout>;
    else return <Route {...rest} render={matchProps => (
        !rest.authRequired || state.user
            ?
            <DashbordLayout user={state.user}>
                <Component {...matchProps} user={state.user} />
            </DashbordLayout>
            
            :
            <Redirect to={{ pathname: '/login' }} />
    )} />
};

export default DashboardLayoutRoute;