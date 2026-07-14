import Memory from '../models/memory.js';
import path from 'path';
import fs from 'fs';

// @desc    Get all memories
// @route   GET /api/memories
// @access  Private
export const getMemories = async (req, res) => {
  try {
    const { albumName } = req.query;
    const query = {};
    if (albumName) {
      query.albumName = albumName;
    }

    const memories = await Memory.find(query)
      .populate('uploader', 'username avatar')
      .populate('comments.user', 'username avatar')
      .sort({ takenAt: -1, createdAt: -1 });

    res.json(memories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload memory (photo/video)
// @route   POST /api/memories
// @access  Private
export const createMemory = async (req, res) => {
  const { title, description, albumName, takenAt } = req.body;

  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No media file uploaded' });
    }

    const ext = path.extname(req.file.originalname).toLowerCase().replace('.', '');
    const isVideo = ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext);

    const memory = await Memory.create({
      title,
      description: description || '',
      url: `/uploads/${req.file.filename}`,
      type: isVideo ? 'video' : 'image',
      albumName: albumName || 'General Trip',
      uploader: req.user._id,
      takenAt: takenAt ? new Date(takenAt) : new Date(),
    });

    const populated = await Memory.findById(memory._id)
      .populate('uploader', 'username avatar');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a memory
// @route   DELETE /api/memories/:id
// @access  Private
export const deleteMemory = async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id);

    if (!memory) {
      return res.status(404).json({ message: 'Memory not found' });
    }

    if (memory.uploader.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to delete this memory' });
    }

    // Delete physical file from disk
    const filename = path.basename(memory.url);
    const localPath = path.join('./uploads', filename);

    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }

    await memory.deleteOne();
    res.json({ message: 'Memory removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Like or unlike a memory
// @route   POST /api/memories/:id/like
// @access  Private
export const toggleLikeMemory = async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id);

    if (!memory) {
      return res.status(404).json({ message: 'Memory not found' });
    }

    const userId = req.user._id;
    const likeIndex = memory.likes.indexOf(userId);

    if (likeIndex > -1) {
      // Unlike
      memory.likes.splice(likeIndex, 1);
    } else {
      // Like
      memory.likes.push(userId);
    }

    await memory.save();

    const populated = await Memory.findById(memory._id)
      .populate('uploader', 'username avatar')
      .populate('comments.user', 'username avatar');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add comment to a memory
// @route   POST /api/memories/:id/comment
// @access  Private
export const addComment = async (req, res) => {
  const { text } = req.body;

  try {
    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const memory = await Memory.findById(req.params.id);

    if (!memory) {
      return res.status(404).json({ message: 'Memory not found' });
    }

    memory.comments.push({
      user: req.user._id,
      text: text,
      createdAt: new Date(),
    });

    await memory.save();

    const populated = await Memory.findById(memory._id)
      .populate('uploader', 'username avatar')
      .populate('comments.user', 'username avatar');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete comment from a memory
// @route   DELETE /api/memories/:id/comment/:commentId
// @access  Private
export const deleteComment = async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id);

    if (!memory) {
      return res.status(404).json({ message: 'Memory not found' });
    }

    const comment = memory.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Only comment creator or memory creator or Admin can delete comment
    if (
      comment.user.toString() !== req.user._id.toString() &&
      memory.uploader.toString() !== req.user._id.toString() &&
      req.user.role !== 'Admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    comment.deleteOne();
    await memory.save();

    const populated = await Memory.findById(memory._id)
      .populate('uploader', 'username avatar')
      .populate('comments.user', 'username avatar');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
