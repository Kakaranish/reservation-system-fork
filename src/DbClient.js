import { MongoClient, Db } from "mongodb";
require('dotenv').config();

const DbClient = () => new Client();

class Client {
    constructor() {
        this.dbName = "reservation-system"
    }

    clientOptions() {
        return {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            connectTimeoutMS: 1000,
            socketTimeoutMS: 1000
        };
    }

    /**
     * @param {function(Db):void} action
    */
    async withDb(action) {
        const client = await MongoClient
            .connect("mongodb://localhost:27017", this.clientOptions())
            .catch(errorMsg => {
                throw errorMsg;
            });
        const db = client.db(this.dbName);
        const result = await action(db);
        client.close();
        return result;
    }
}

/**
 * @param {Db} db 
 * @param {ObjectID} roomId
 */
const roomWithIdExists = async (db, roomId) => {
    return await db.collection('rooms').findOne("_id", roomId) ? true : false;
};

/**
 * @param {Db} db 
 * @param {ObjectID} userId
 */
const userWithIdExists = async (db, userId) => {
    return await db.collection('users').findOne("_id", userId) ? true : false;
};

export default DbClient;
