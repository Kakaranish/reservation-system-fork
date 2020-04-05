import express from "express";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import RoomRouter from "./routers/RoomRouter";
import ReservationsRouter from "./routers/ReservationsRouter";
import AccountRouter from "./routers/AccountRouter";
import AdminRouter from './routers/AdminRouter';
import UserRouter from './routers/UserRouter';

require('dotenv').config()
require('./auth');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(fileUpload());
app.use('/', RoomRouter);
app.use('/', ReservationsRouter);
app.use('/account', AccountRouter);
app.use('/admin', AdminRouter);
app.use('/user', UserRouter);

app.use((err, req, res) => {
    console.log(`Error: ${err}`)
    return res.status(500).json({
        message: "Error: Server internal error"
    });
});

const port = 8000;
app.listen(port, () => {
    console.log(`Listening on ${port}...`);
});