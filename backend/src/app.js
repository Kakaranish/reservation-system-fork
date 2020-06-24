import express from "express";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import RoomRouter from "./routers/RoomRouter";
import ReservationsRouter from "./routers/ReservationRouter";
import AuthRouter from "./routers/AuthRouter";
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

app.use('/users', UserRouter);
app.use('/rooms', RoomRouter);
app.use('/', ReservationsRouter);
app.use('/reservations/:id/modify', ReservationModifyRouter);
app.use('/auth', AuthRouter);

app.use(async (req, res) => {
    console.log('Error: Unknown internal error');
    if (res) res.status(500).json({ errors: ['Internal error'] });
});

export default app;