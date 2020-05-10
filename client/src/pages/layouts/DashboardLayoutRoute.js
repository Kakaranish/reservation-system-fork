import React, { useState, useEffect } from 'react';
import { Redirect, Route } from "react-router-dom";
import axios from 'axios';
import DashbordLayout from "./DashbordLayout";

const DashboardLayoutRoute = ({ component: Component, ...rest }) => {
    const [state, setState] = useState({
        loading: true,
        user: null,
        isAuthorized: false
    });

    const roles = (rest.roles ?? []).map(role => role.toUpperCase());
    useEffect(() => {
        const auth = async () => {
            const result = await axios.post('/auth/verify');

            const user = result.data.user;
            const isAuthorized = roles.length === 0 || roles.includes(result.data.user?.role);
            if (!isAuthorized) {
                if (!user) alert('You must be logged in. Redirecting to login screen...');
                else alert(`Set of allowed roles is [${roles.join(',')}]. Your is ${user.role}`);
            }

            setState({
                loading: false,
                user: result.data.user,
                isAuthorized: isAuthorized
            });
        };
        auth();
    }, []);

    if (state.loading) return <></>
    else {
        if (state.isAuthorized) {
            return <Route {...rest} render={matchProps => (
                <DashbordLayout user={state.user}>
                    <Component {...matchProps} user={state.user} />
                </DashbordLayout>
            )} />
        } else {
            if (!state.user) return <Redirect to={{ pathname: '/login' }} />;
            else return <> {window.location = '/'} </>
        }
    }
};

export default DashboardLayoutRoute;