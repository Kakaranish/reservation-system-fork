import express from "express";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import RoomRouter from "./routers/RoomRouter";
import AuthRouter from "./routers/AuthRouter";
import OwnerRouter from './routers/owner/OwnerRouter';
import AdminRouter from './routers/admin/AdminRouter';
import UserRouter from './routers/user/UserRouter';
import cookieParser from 'cookie-parser';
import './auth/passport-config';

require('dotenv').config();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(fileUpload());

app.use('/user', UserRouter);
app.use('/admin', AdminRouter);
app.use('/owner', OwnerRouter)

app.use('/auth', AuthRouter);
app.use('/rooms', RoomRouter);

app.get('*', (_req, res) => res.sendStatus(404));

app.use((err, req, res) => {
    console.log(err)
    res.status(500).json({ errors: ['Internal error'] });
});

export default app;