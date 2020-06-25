import express from 'express';
import RoomRouter from './RoomRouter';
import ReservationRouter from './ReservationRouter'

const router = express.Router();

router.use('/rooms', RoomRouter);
router.use('/reservations', ReservationRouter);

export default router;