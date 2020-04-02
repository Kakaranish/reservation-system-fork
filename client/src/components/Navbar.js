import React from "react";
import $ from 'jquery';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle';
import stockAvatar from '../assets/images/test/stock-avatar.jpg';
import "../assets/css/Navbar.css";

const toggleMenu = event => {
  event.preventDefault();
  $("#wrapper").toggleClass("toggled");
}

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-md navbar-light bg-light border-bottom">
      <button className="btn btn-primary d-md-none" id="menu-toggle" onClick={toggleMenu}>Toggle Menu</button>

      <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse mt-2" id="navbarSupportedContent">
        <div className="input-group py-1 px-2 px-0 py-3 py-md-0">
          <input className="form-control form-control-dark" type="text" placeholder="Search here..." aria-label="Search" />
          <div className="input-group-append">
            <button className="btn btn-outline-success" type="submit">
              <i className="fa fa-search" />
            </button>
          </div>
        </div>

        <ul className="navbar-nav ml-auto mt-lg-0">
          <li className="nav-item dropdown">
            <a className="nav-link dropdown-toggle" href="#"
              id="navbarDropdown" role="button" data-toggle="dropdown"
              aria-haspopup="true" aria-expanded="false">
              John
            </a>

            <div className="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown">
              <a className="dropdown-item" href="#">Settings</a>
              <a className="dropdown-item" href="#">Log out</a>
            </div>
          </li>

          <li className="nav-item">
            <span className="nav-link">
              <img id="avatar-img" src={stockAvatar} />
            </span>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;