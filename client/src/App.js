import React from 'react';
import { BrowserRouter, Switch } from "react-router-dom";
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle';
import DashboardLayoutRoute from './pages/layouts/DashbordLayoutRoute';
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
import EmptyLayoutRoute from './pages/layouts/EmptyLayoutRoute';
import AuthDashboardLayoutRoute from './pages/layouts/AuthDashboardLayoutRoute';

const App = () => {

  return (
    <BrowserRouter>
      <Switch>
        <AuthDashboardLayoutRoute path="/" component={TestPage} authRequired={false} exact />
        <AuthDashboardLayoutRoute path="/filter-rooms" component={RoomFilterPage} />
        <AuthDashboardLayoutRoute path="/rooms/:id" component={RoomPage} />
        <AuthDashboardLayoutRoute path="/create-room" component={CreateRoomPage} />
        <AuthDashboardLayoutRoute path="/admin/manage-reservations" component={AdminManageReservations} />
        <AuthDashboardLayoutRoute path="/user/manage-reservations" component={UserManageReservations} />
        <AuthDashboardLayoutRoute path="/rooms" component={RoomsPage} />
        <EmptyLayoutRoute path="/login" component={LoginPage} />
        <EmptyLayoutRoute path="/register" component={RegisterPage} />

        <AuthDashboardLayoutRoute component={NotFoundPage} />
      </Switch>
    </BrowserRouter>
  );
};

export default App;