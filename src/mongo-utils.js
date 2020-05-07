import mongoose from 'mongoose';
import 'regenerator-runtime';

require('dotenv').config();
const currentUriVarName = process.env.MONGO_CURRENT_DB_URI;

export const connectProdDb = async () => {
    await mongoose.connect(process.env[currentUriVarName], {
        dbName: process.env.DB_NAME,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    });
};

export const connectTestDb = async () => {
    await mongoose.connect(process.env[currentUriVarName], {
        dbName: process.env.DB_NAME_TEST,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    });
};