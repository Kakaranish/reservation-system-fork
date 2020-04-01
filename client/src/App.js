import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import TestPage from './pages/TestPage';

class App extends Component {
  render() {
    return (
      <Router>
        <div class="d-flex" id="wrapper">
          <Sidebar />

          <div id="page-content-wrapper">
            <Navbar />

            <Switch>
              <Route path="/" component={TestPage} exact />
            </Switch>

          </div>
        </div>
      </Router>
    );
  }
}

export default App;