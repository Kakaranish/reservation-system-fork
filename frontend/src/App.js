import React from 'react';
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle';
import MainPage from './pages/MainPage';
import RoomFilterPage from './pages/RoomFilterPage';
import RoomsPage from "./pages/RoomsPage";
import RoomPage from "./pages/RoomPage";
import CreateRoomPage from './pages/owner/CreateRoomPage';
import OwnerReservationsPage from './pages/owner/ReservationsPage';
import UserReservationsPage from './pages/user/ReservationsPage';
import SearchRoomsPage from './pages/SearchRoomsPage';
import EditReservationPage from './pages/user/EditReservationPage';
import AuthRoutes from './pages/authentication/AuthRoutes';
import UsersPage from './pages/admin/UsersPage';
import AccountPage from './pages/user/AccountPage';
import RefreshPage from './pages/special/RefreshPage';
import ErrorPage from './pages/special/ErrorPage';
import DashboardLayout from './route-types/DashbordLayout';
import AuthOnlyRoute from './route-types/AuthOnlyRoute';
import OwnerRoomsPage from './pages/owner/RoomsPage';
import EditRoomPage from './pages/owner/EditRoomPage';

const App = () => <>
  <BrowserRouter>
    <Switch>
      <Route path="/auth" component={AuthRoutes} />

      <DashboardLayout>
        <Switch>
          <Route path="/" component={MainPage} exact />
          <Route path="/filter-rooms" component={RoomFilterPage} />
          <Route path='/rooms/search' component={SearchRoomsPage} />
          <Route path="/rooms/:id" component={RoomPage} />
          <Route path="/rooms" component={RoomsPage} />
          <Route path="/user/reservations"
            component={UserReservationsPage} />

          <AuthOnlyRoute path='/account' component={AccountPage} />
          <AuthOnlyRoute path="/users" component={UsersPage}
            roles={['ADMIN']} />
          <AuthOnlyRoute path='/edit-reservation/:reservationId'
            component={EditReservationPage} roles={['USER', 'ADMIN']} />

          <AuthOnlyRoute path="/owner/reservations"
            component={OwnerReservationsPage} roles={['OWNER']} />
          <AuthOnlyRoute path="/owner/rooms/create" component={CreateRoomPage}
            roles={['OWNER']} />
          <AuthOnlyRoute path="/owner/rooms/:id/edit" component={EditRoomPage}
            roles={['OWNER']} />
          <AuthOnlyRoute path='/owner/rooms' component={OwnerRoomsPage}
            roles={["OWNER"]} />

          <Route path='/error/:code' component={ErrorPage} />
          <Route path='/refresh' component={RefreshPage} />
          <Redirect to='/error/404' />
        </Switch>
      </DashboardLayout>

    </Switch>
  </BrowserRouter>
</>

export default App;