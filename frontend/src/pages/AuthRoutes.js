import React from 'react';
import { Switch } from 'react-router-dom';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import NotAuthLayoutRoute from './layouts/NotAuthLayoutRoute';

const AuthRoutes = () => <>
    <Switch>
        <NotAuthLayoutRoute path="/auth/login" component={LoginPage} />
        <NotAuthLayoutRoute path="/auth/register" component={RegisterPage} />
    </Switch>
</>

export default AuthRoutes;