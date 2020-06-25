import React from 'react';
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle';
import MainPage from './pages/MainPage';
import RoomFilterPage from './pages/RoomFilterPage';
import RoomsPage from "./pages/RoomsPage";
import RoomPage from "./pages/RoomPage";
import SearchRoomsPage from './pages/SearchRoomsPage';
import AuthRoutes from './pages/authentication/AuthRoutes';
import RefreshPage from './pages/special/RefreshPage';
import ErrorPage from './pages/special/ErrorPage';
import DashboardLayout from './route-types/DashbordLayout';
import OwnerRoutes from './pages/owner/Routes';
import AdminRoutes from './pages/admin/Routes';
import UserRoutes from './pages/user/Routes';

const App = () => <>
  <BrowserRouter>
    <Switch>
      <Route path='/auth' component={AuthRoutes} />

      <DashboardLayout>
        <Switch>
          <Route path='/' component={MainPage} exact />

          <Route path='/owner' component={OwnerRoutes} />
          <Route path='/admin' component={AdminRoutes} />
          <Route path='/user' component={UserRoutes} />
          
          <Route path="/filter-rooms" component={RoomFilterPage} />
          <Route path='/rooms/search' component={SearchRoomsPage} />
          <Route path="/rooms/:id" component={RoomPage} />
          <Route path="/rooms" component={RoomsPage} />

          <Route path='/error/:code' component={ErrorPage} />
          <Route path='/refresh' component={RefreshPage} />
          <Redirect to='/error/404' />
        </Switch>
      </DashboardLayout>

    </Switch>
  </BrowserRouter>
</>

export default App;