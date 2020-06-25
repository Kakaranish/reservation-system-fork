import React from 'react';
import { Switch } from 'react-router-dom';
import AuthOnlyRoute from '../../route-types/AuthOnlyRoute';
import CreateRoomPage from './CreateRoomPage';
import EditRoomPage from './EditRoomPage';
import RoomsPage from './RoomsPage';
import ReservationsPage from './ReservationsPage';

const Routes = () => <>
    <Switch>
        <AuthOnlyRoute path="/owner/reservations"
            component={ReservationsPage} roles={['OWNER']} />
        <AuthOnlyRoute path="/owner/rooms/create" component={CreateRoomPage}
            roles={['OWNER']} />
        <AuthOnlyRoute path="/owner/rooms/:id/edit" component={EditRoomPage}
            roles={['OWNER']} />
        <AuthOnlyRoute path='/owner/rooms' component={RoomsPage}
            roles={["OWNER"]} />
    </Switch>
</>

export default Routes;