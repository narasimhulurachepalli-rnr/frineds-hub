import express from 'express';
import {
  getRandomJoke,
  getRandomTruthOrDare,
  getRecommendations,
  addRecommendation,
  toggleLikeRecommendation,
  deleteRecommendation,
} from '../controllers/entertainmentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/jokes', protect, getRandomJoke);
router.get('/truth-or-dare', protect, getRandomTruthOrDare);

router.route('/recs')
  .get(protect, getRecommendations)
  .post(protect, addRecommendation);

router.post('/recs/:id/like', protect, toggleLikeRecommendation);
router.delete('/recs/:id', protect, deleteRecommendation);

export default router;
