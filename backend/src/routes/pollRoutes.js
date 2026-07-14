import express from 'express';
import { getPolls, createPoll, votePoll, deletePoll } from '../controllers/entertainmentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getPolls)
  .post(protect, createPoll);

router.post('/:id/vote', protect, votePoll);
router.delete('/:id', protect, deletePoll);

export default router;
