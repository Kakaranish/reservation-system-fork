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

import mongoose from 'mongoose';
import Room from './models/room-model';
const app = express();

mongoose.connect(process.env.MONGO_LOCAL_URI, {
    dbName: 'reservation-system',
    useNewUrlParser: true,
    useUnifiedTopology: true,
    reconnectTries: 3,
    reconnectInterval: 1000    
})

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(fileUpload());
app.use('/', RoomRouter);
app.use('/', ReservationsRouter);
app.use('/account', AccountRouter);
app.use('/admin', AdminRouter);
app.use('/user', UserRouter);

app.get('/test', async (req, res) => {
    const room = new Room({
        name: "New conference room",
        location: "Cracow",
        photoUrl: "http://someaddress.pl",
        amenities: ["amtTV"],
        dows: ["dowMonday", "dowThursday"]
    });
    try {
        let x = await room.save();
    } catch (error) {
        console.log(error);
        const errors = [];
        for (let errorField in error.errors) {
            errors.push(errorField)
        }
        return res.json({
            missingValues: errors
        });
    }

    return res.json({ message: "OK" });
});
app.use((err, req, res) => {
    console.log(`Error: ${err}`)
    return res.status(500).json({
        message: "Error: Server internal error"
    });
});

const port = process.env.PORT
app.listen(port, () => {
    console.log(`Listening on ${port}...`);
});