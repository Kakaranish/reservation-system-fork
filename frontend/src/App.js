import React from 'react';
import { BrowserRouter, Switch, Route } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle';
import MainPage from './pages/MainPage';
import RoomFilterPage from './pages/RoomFilterPage';
import NotFoundPage from './pages/NotFoundPage';
import RoomsPage from "./pages/RoomsPage";
import RoomPage from "./pages/RoomPage";
import CreateRoomPage from './pages/CreateRoomPage';
import AdminManageReservations from './pages/admin/ManageReservations';
import UserManageReservations from './pages/user/ManageReservations';
import SearchRoomsPage from './pages/SearchRoomsPage';
import EditReservationPage from './pages/EditReservationPage';
import RefreshPage from './pages/RefreshPage';
import DashboardLayout from './pages/layouts/DashbordLayout';
import AuthRoutes from './pages/AuthRoutes';
import AuthOnlyRoute from './pages/layouts/AuthOnlyRoute';

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
          <Route path="/user/manage-reservations"
            component={UserManageReservations} />

          <AuthOnlyRoute path='/edit-reservation/:reservationId'
            component={EditReservationPage} roles={['USER', 'ADMIN']} />
          <AuthOnlyRoute path="/create-room" component={CreateRoomPage}
            roles={['ADMIN']} />
          <AuthOnlyRoute path="/admin/manage-reservations"
            component={AdminManageReservations} roles={['ADMIN']} />

          <Route path='/refresh' component={RefreshPage} />
          <Route component={NotFoundPage} />
        </Switch>
      </DashboardLayout>
      
    </Switch>
  </BrowserRouter>
</>

export default App;