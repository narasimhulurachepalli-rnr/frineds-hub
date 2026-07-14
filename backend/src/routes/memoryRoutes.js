import express from 'express';
import { getMemories, createMemory, deleteMemory, toggleLikeMemory, addComment, deleteComment } from '../controllers/memoryController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.route('/')
  .get(protect, getMemories)
  .post(protect, upload.single('file'), createMemory);

router.delete('/:id', protect, deleteMemory);
router.post('/:id/like', protect, toggleLikeMemory);
router.post('/:id/comment', protect, addComment);
router.delete('/:id/comment/:commentId', protect, deleteComment);

export default router;
