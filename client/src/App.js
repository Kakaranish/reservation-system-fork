import React, { Component } from 'react';
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

class App extends Component {
  render() {
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

          <EmptyLayoutRoute path="/login" component={LoginPage} />
          <EmptyLayoutRoute path="/register" component={RegisterPage} />

          <DashboardLayoutRoute component={NotFoundPage} />
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;