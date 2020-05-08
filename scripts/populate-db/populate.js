import mongoose from 'mongoose';
import { connectTestDb } from '../../src/mongo-utils';
import { createRefreshToken } from '../../src/auth/auth-utils';
import * as Common from './populate-common';
import {populateReservations} from "./populate-reservation-router"
import { populateRoomRouter } from './populate-room-router';
import { populateReservationModifyRouter } from './populate-reservation-modify-router';

require('dotenv').config();

(async () => {
    await connectTestDb();
    await mongoose.connection.dropDatabase();

    // ---  POPULATE COMMON  ---------------------------------------------------

    await Common.user.save();
    await createRefreshToken(Common.user);
    await Common.admin.save();
    await createRefreshToken(Common.admin);

    // ---  POPULATE  ----------------------------------------------------------

    await populateReservations();
    await populateReservationModifyRouter();
    await populateRoomRouter();

    // -------------------------------------------------------------------------

    await mongoose.connection.close();
    const dbName = process.env.DB_NAME_TEST;
    console.log(`OK - '${dbName}' has been populated.`);
})();