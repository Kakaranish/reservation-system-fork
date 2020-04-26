import app from './app';
import mongoose from 'mongoose';
require('dotenv').config()

const dbNameVar = process.env.MONGO_CURRENT_DB_URI;
mongoose.connect(process.env[dbNameVar], {
    dbName: process.env.DB_NAME,
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const port = process.env.PORT
app.listen(port, () => {
    console.log(`Listening on ${port}...`);
});