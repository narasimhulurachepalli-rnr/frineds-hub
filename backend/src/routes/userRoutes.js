import express from 'express';
import { getAllUsers, getUserById, updateProfile, deleteAccount } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/', protect, getAllUsers);
router.get('/:id', protect, getUserById);

// Profile updates with optional avatar and cover image uploads
router.put(
  '/profile',
  protect,
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
  ]),
  updateProfile
);

router.delete('/delete-account', protect, deleteAccount);

export default router;
