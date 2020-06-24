import React, { useState, useEffect } from 'react';
import { Redirect, Route } from "react-router-dom";
import axios from 'axios';
import DashbordLayout from "./DashbordLayout";
import { requestHandler } from '../common/utils';

const DashboardLayoutRoute = ({ component: Component, ...rest }) => {

    const roles = (rest.roles ?? []).map(role => role.toUpperCase());

    const [state, setState] = useState({
        loading: true,
        user: null,
        isAuthorized: false
    });

    useEffect(() => {
        const auth = async () => {
            const action = async () => axios.post('/auth/verify');
            const result = await requestHandler(action);

            const user = result.user;
            const isAuthorized = roles.length === 0 || roles.includes(user?.role);
            if (!isAuthorized) {
                if (!user) alert('You must be logged in. Redirecting to login screen...');
                else alert(`Set of allowed roles is [${roles.join(',')}]. Your is ${user.role}`);
            }

            setState({
                loading: false,
                user: result.user,
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
            if (!state.user) return <Redirect to={{ pathname: '/auth/login' }} />;
            else return <> {window.location = '/'} </>
        }
    }
};

export default DashboardLayoutRoute;