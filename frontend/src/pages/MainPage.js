import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle';

const MainPage = () => {
    return (
        <>
            <h1 className="mb-3">
                Test Users
            </h1>

            <p>
                <b>Normal user</b><br />
                <b>login: </b>user@mail.com<br />
                <b>password: </b>dupa123<br />
            </p>

            <p>
                <b>Owner</b><br />
                <b>login: </b>owner@mail.com<br />
                <b>password: </b>dupa123<br />
            </p>

            <p>
                <b>Admin</b><br />
                <b>login: </b>admin@mail.com<br />
                <b>password: </b>dupa123<br />
            </p>
        </>
    );
};

export default MainPage;