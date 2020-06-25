import React from 'react';
import { Switch } from 'react-router-dom';
import UsersPage from './UsersPage';
import AuthOnlyRoute from '../../route-types/AuthOnlyRoute';

const Routes = () => <>
    <Switch>
        <AuthOnlyRoute path="/admin/users" component={UsersPage}
            roles={['ADMIN']} />
    </Switch>
</>

export default Routes;