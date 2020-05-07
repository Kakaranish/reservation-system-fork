import express from "express";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import RoomRouter from "./routers/RoomRouter";
import ReservationsRouter from "./routers/ReservationsRouter";
import AuthRouter from "./routers/AuthRouter";
import AdminRouter from './routers/AdminRouter';
import UserRouter from './routers/UserRouter';
import ReservationModifyRouter from './routers/ReservationModifyRouter';
import cookieParser from 'cookie-parser';
import './auth/passport-config';

require('dotenv').config();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(fileUpload());
app.use('/rooms', RoomRouter);
app.use('/', ReservationsRouter);
app.use('/reservations/:id/modify', ReservationModifyRouter);
app.use('/auth', AuthRouter);
app.use('/admin', AdminRouter);
app.use('/user', UserRouter);

app.use(async (err, req, res) => {
    console.log(`Error: ${err}`)
    return res.status(500).json({
        message: "Error: Server internal error"
    });
});

export default app;