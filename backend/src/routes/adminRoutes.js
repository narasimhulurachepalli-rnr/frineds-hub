import express from 'express';
import {
  generateInviteCode,
  getInviteCodes,
  removeMember,
  resetUserPassword,
  sendAnnouncement,
  getAnalytics,
  disableInviteCode,
  regenerateInviteCode
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/invite', protect, adminOnly, generateInviteCode);
router.get('/invites', protect, adminOnly, getInviteCodes);
router.put('/invite/:id/disable', protect, adminOnly, disableInviteCode);
router.post('/invite/:id/regenerate', protect, adminOnly, regenerateInviteCode);
router.delete('/users/:id', protect, adminOnly, removeMember);
router.post('/users/:id/reset-password', protect, adminOnly, resetUserPassword);
router.post('/announcement', protect, adminOnly, sendAnnouncement);
router.get('/analytics', protect, adminOnly, getAnalytics);

export default router;
