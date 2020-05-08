import mongoose from 'mongoose';
import moment, { ISO_8601 } from 'moment';
import User from '../../src/models/user-model';
import Room from '../../src/models/room-model';
import Reservation from '../../src/models/reservation-model';
import { parseObjectId } from '../../src/common';
import { connectTestDb } from '../../src/mongo-utils';
import { createRefreshToken } from '../../src/auth/auth-utils';
import * as Common from './populate-common';
import {populateReservations} from "./populate-reservation-router"
import { populateTemp } from './temp';
import { populateRoomRouter } from './populate-room-router';
import { populateReservationModifyRouter } from './populate-reservation-modify-router';

require('dotenv').config();

(async () => {
    await connectTestDb();
    await mongoose.connection.dropDatabase();

    // ---  POPULATE COMMON  ---------------------------------------------------

    await Common.commonUser.save();
    await createRefreshToken(Common.commonUser);
    await Common.commonAdmin.save();
    await createRefreshToken(Common.commonAdmin);

    // ---  POPULATE  ----------------------------------------------------------

    await populateTemp();
    await populateReservations();
    await populateReservationModifyRouter();
    await populateRoomRouter();

    // -------------------------------------------------------------------------

    await mongoose.connection.close();
    const dbName = process.env.DB_NAME_TEST;
    console.log(`OK - '${dbName}' has been populated.`);
})();