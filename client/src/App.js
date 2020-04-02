import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import TestPage from './pages/TestPage';
import RoomFilterPage from './pages/RoomFilterPage';
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

class App extends Component {
  render() {
    return (
      <Router>
        <Route path="/login" component={LoginPage} />

        <Route path="/register" component={RegisterPage} />

        <div class="d-flex" id="wrapper">
          <Sidebar />
          <div id="page-content-wrapper">
            <Navbar />
            <div class="container-fluid mt-4">
              <Switch>
                <Route path="/" component={TestPage} exact />
                <Route path="/filter-rooms" component={RoomFilterPage} />
                <Route component={NotFoundPage} />
              </Switch>
            </div>
          </div>
        </div>
      </Router>
    );
  }
}

export default App;