import app from './app';
import mongoose from 'mongoose';
require('dotenv').config()

mongoose.connect(process.env.MONGO_LOCAL_URI, {
    dbName: 'reservation-system',
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const port = process.env.PORT
app.listen(port, () => {
    console.log(`Listening on ${port}...`);
});