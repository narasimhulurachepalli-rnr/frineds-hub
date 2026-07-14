import express from 'express';
import { getFiles, uploadFile, deleteFile, toggleBookmark, incrementDownload } from '../controllers/fileController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.route('/')
  .get(protect, getFiles)
  .post(protect, upload.single('file'), uploadFile);

router.delete('/:id', protect, deleteFile);
router.post('/:id/bookmark', protect, toggleBookmark);
router.post('/:id/download', protect, incrementDownload);

export default router;
