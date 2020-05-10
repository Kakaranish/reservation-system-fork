import React from 'react';
import { BrowserRouter, Switch } from "react-router-dom";
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle';
import TestPage from './pages/TestPage';
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

const App = () => {

  return (
    <BrowserRouter>
      <Switch>
        <DashboardLayoutRoute path="/" component={TestPage} exact />
        <DashboardLayoutRoute path="/filter-rooms" component={RoomFilterPage} />
        <DashboardLayoutRoute path="/rooms/:id" component={RoomPage} />
        <DashboardLayoutRoute path="/create-room" component={CreateRoomPage} />
        <DashboardLayoutRoute path="/admin/manage-reservations" component={AdminManageReservations} />
        <DashboardLayoutRoute path="/user/manage-reservations" component={UserManageReservations} />
        <DashboardLayoutRoute path="/rooms" component={RoomsPage} />
        <AuthLayoutRoute path="/login" component={LoginPage} />
        <AuthLayoutRoute path="/register" component={RegisterPage} />

        <DashboardLayoutRoute component={NotFoundPage} />
      </Switch>
    </BrowserRouter>
  );
};

export default App;