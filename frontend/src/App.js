import React from 'react';
import { BrowserRouter, Switch } from "react-router-dom";
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle';
import MainPage from './pages/MainPage';
import RoomFilterPage from './pages/RoomFilterPage';
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RoomsPage from "./pages/RoomsPage";
import RoomPage from "./pages/RoomPage";
import CreateRoomPage from './pages/CreateRoomPage';
import AdminManageReservations from './pages/admin/ManageReservations';
import UserManageReservations from './pages/user/ManageReservations';
import AuthLayoutRoute from './pages/layouts/AuthLayoutRoute';
import DashboardLayoutRoute from './pages/layouts/DashboardLayoutRoute';
import SearchRoomsPage from './pages/SearchRoomsPage';
import EditReservationPage from './pages/EditReservationPage';
import RefreshPage from './pages/RefreshPage';

const App = () => {

  return (
    <BrowserRouter>
      <Switch>
        <DashboardLayoutRoute path="/" component={MainPage} exact />
        <DashboardLayoutRoute path="/filter-rooms" component={RoomFilterPage} />
        <DashboardLayoutRoute path='/rooms/search' component={SearchRoomsPage} />
        <DashboardLayoutRoute path="/rooms/:id" component={RoomPage} />
        <DashboardLayoutRoute path="/rooms" component={RoomsPage} />
        <DashboardLayoutRoute path='/edit-reservation/:reservationId'
          component={EditReservationPage} roles={['USER', 'ADMIN']} />
        <DashboardLayoutRoute path="/create-room" component={CreateRoomPage}
          roles={['ADMIN']} />
        <DashboardLayoutRoute path="/admin/manage-reservations"
          component={AdminManageReservations} roles={['ADMIN']} />
        <DashboardLayoutRoute path="/user/manage-reservations"
          component={UserManageReservations} />
        <AuthLayoutRoute path="/login" component={LoginPage} />
        <AuthLayoutRoute path="/register" component={RegisterPage} />

        <DashboardLayoutRoute path='/refresh' component={RefreshPage} />
        <DashboardLayoutRoute component={NotFoundPage} />
      </Switch>
    </BrowserRouter>
  );
};

export default App;