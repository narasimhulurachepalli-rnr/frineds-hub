import express from 'express';
import { saveGameScore, getQuizzes, submitQuizAnswers, getLeaderboard } from '../controllers/gameController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/score', protect, saveGameScore);
router.get('/quizzes', protect, getQuizzes);
router.post('/quiz/submit', protect, submitQuizAnswers);
router.get('/leaderboard', protect, getLeaderboard);

export default router;
