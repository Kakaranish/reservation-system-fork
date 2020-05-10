import React from "react";
import $ from 'jquery';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle';
import "../assets/css/Navbar.css";
import axios from 'axios';

const toggleMenu = event => {
  event.preventDefault();
  $("#wrapper").toggleClass("toggled");
}

const Navbar = (props) => {

  const handleLogout = async () => {
    const result = await axios.post('/auth/logout', {}, { validateStatus: false });
    if (result.status !== 200) {
      console.log('error while logging out');
      return;
    }
    window.location = `/`;
  };

  const handleOnKeyDown = event => {
    if (event.charCode === 13) {
      const searchPhrase = document.getElementById('searchBar').value;
      if (!searchPhrase || searchPhrase.trim() === '') return;
      window.location = `/rooms/search?phrase=${encodeURIComponent(searchPhrase)}`;
    }
  }

  return (
    <nav className="navbar navbar-expand-md navbar-light bg-light border-bottom">
      <button className="btn btn-primary d-md-none" id="menu-toggle" onClick={toggleMenu}>Toggle Menu</button>

      <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse mt-2" id="navbarSupportedContent">
        <div className="input-group py-1 px-2 px-0 py-3 py-md-0">

          <input id='searchBar' className="form-control form-control-dark" type="text" placeholder="Search here..."
            aria-label="Search" onKeyPress={handleOnKeyDown} />

          <div className="input-group-append">
            <button className="btn btn-outline-success" type="submit">
              <i className="fa fa-search" />
            </button>
          </div>

        </div>

        {
          !props.user ? null
            : <ul className="navbar-nav ml-auto mt-lg-0">
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#"
                  id="navbarDropdown" role="button" data-toggle="dropdown"
                  aria-haspopup="true" aria-expanded="false">
                  {props.user.email}
                </a>

                <div className="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown" onClick={handleLogout}>
                  <a className="dropdown-item" href="#">Log out</a>
                </div>
              </li>
            </ul>
        }
      </div>
    </nav>
  );
};

export default Navbar;