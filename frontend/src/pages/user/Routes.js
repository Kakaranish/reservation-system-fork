import React from 'react';
import { Switch } from 'react-router-dom';
import AuthOnlyRoute from '../../route-types/AuthOnlyRoute';
import AccountPage from './AccountPage';
import EditReservationPage from './EditReservationPage';
import ReservationsPage from './ReservationsPage';

const Rotues = () => <>
    <Switch>
        <AuthOnlyRoute path='/user/account' component={AccountPage} />
        <AuthOnlyRoute path='/user/reservations/:id/edit'
            component={EditReservationPage} />
        <AuthOnlyRoute path="/user/reservations" component={ReservationsPage} />
    </Switch>
</>

export default Rotues;