import express from 'express';
import { getEvents, createEvent, deleteEvent, toggleAttendance } from '../controllers/eventController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getEvents)
  .post(protect, createEvent);

router.delete('/:id', protect, deleteEvent);
router.post('/:id/attend', protect, toggleAttendance);

export default router;
