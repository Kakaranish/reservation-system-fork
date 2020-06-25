import express from 'express';
import ReservationRouter from './ReservationRouter';

const router = express.Router();

router.use('/reservations', ReservationRouter);

export default router;