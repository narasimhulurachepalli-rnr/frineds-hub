import File from '../models/file.js';
import Notification from '../models/notification.js';
import User from '../models/user.js';
import fs from 'fs';
import path from 'path';

// @desc    Get all files
// @route   GET /api/files
// @access  Private
export const getFiles = async (req, res) => {
  try {
    const { category, bookmarked } = req.query;
    const query = {};

    if (category) {
      query.category = category;
    }
    if (bookmarked === 'true') {
      query.bookmarks = req.user._id;
    }

    const files = await File.find(query)
      .populate('uploader', 'username avatar')
      .sort({ createdAt: -1 });

    res.json(files);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload a file (PDF, DOCX, PPT, ZIP, Images, Videos up to 100MB)
// @route   POST /api/files
// @access  Private
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { category } = req.body;

    // Detect file type
    const ext = path.extname(req.file.originalname).toLowerCase().replace('.', '');
    let fileType = 'other';
    if (ext === 'pdf') fileType = 'pdf';
    else if (['doc', 'docx'].includes(ext)) fileType = 'docx';
    else if (['ppt', 'pptx'].includes(ext)) fileType = 'ppt';
    else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) fileType = 'zip';
    else if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) fileType = 'image';
    else if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) fileType = 'video';

    const file = await File.create({
      uploader: req.user._id,
      name: req.file.originalname,
      url: `/uploads/${req.file.filename}`,
      size: req.file.size,
      type: fileType,
      category: category || 'General',
    });

    const populated = await File.findById(file._id).populate('uploader', 'username avatar');

    // Create system notification
    const notification = await Notification.create({
      sender: req.user._id,
      type: 'file_upload',
      title: 'New File Uploaded',
      message: `${req.user.username} uploaded a new ${fileType} file: "${req.file.originalname}"`,
      relatedId: file._id,
    });

    // Broadcast
    if (req.io) {
      req.io.emit('notification', {
        ...notification.toJSON(),
        sender: { _id: req.user._id, username: req.user.username, avatar: req.user.avatar },
      });
    }

    // Check achievement for uploader
    const uploadCount = await File.countDocuments({ uploader: req.user._id });
    if (uploadCount === 5) {
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { achievements: 'Cloud Pioneer' }
      });
    }

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a file
// @route   DELETE /api/files/:id
// @access  Private
export const deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check ownership or Admin role
    if (file.uploader.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to delete this file' });
    }

    // Delete local physical file if exists
    const filename = path.basename(file.url);
    const localPath = path.join('./uploads', filename);

    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }

    await file.deleteOne();
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle file bookmark
// @route   POST /api/files/:id/bookmark
// @access  Private
export const toggleBookmark = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    const userId = req.user._id;
    const isBookmarked = file.bookmarks.includes(userId);

    if (isBookmarked) {
      file.bookmarks = file.bookmarks.filter((id) => id.toString() !== userId.toString());
    } else {
      file.bookmarks.push(userId);
    }

    await file.save();
    res.json({ success: true, isBookmarked: !isBookmarked, bookmarksCount: file.bookmarks.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Increment file download count
// @route   POST /api/files/:id/download
// @access  Private
export const incrementDownload = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    file.downloads += 1;
    await file.save();

    res.json({ success: true, downloads: file.downloads });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
