import express from 'express';
import { getMessages, createMessage, editMessage, deleteMessage, reactToMessage, seenMessage } from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.route('/')
  .get(protect, getMessages)
  .post(protect, upload.single('file'), createMessage);

router.route('/:id')
  .put(protect, editMessage)
  .delete(protect, deleteMessage);

router.post('/:id/react', protect, reactToMessage);
router.post('/:id/seen', protect, seenMessage);

export default router;
