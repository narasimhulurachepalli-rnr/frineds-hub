import express from 'express';
import { registerUser, loginUser, changePassword, getStreakAndBadges, validateInviteCode, getUsersCount } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/users-count', getUsersCount);
router.get('/invite/validate/:code', validateInviteCode);
router.put('/change-password', protect, changePassword);
router.get('/streak', protect, getStreakAndBadges);

export default router;
