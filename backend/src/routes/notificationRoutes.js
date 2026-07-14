import express from 'express';
import { getNotifications, markAsRead, deleteNotification } from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getNotifications);

router.post('/mark-read', protect, markAsRead);
router.delete('/:id', protect, deleteNotification);

export default router;
