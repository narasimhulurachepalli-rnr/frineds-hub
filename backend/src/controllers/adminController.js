import User from '../models/user.js';
import Invite from '../models/invite.js';
import Message from '../models/message.js';
import File from '../models/file.js';
import Note from '../models/note.js';
import GameScore from '../models/gameScore.js';
import Notification from '../models/notification.js';
import crypto from 'crypto';

// @desc    Generate a new registration invite code
// @route   POST /api/admin/invite
// @access  Private/Admin
export const generateInviteCode = async (req, res) => {
  try {
    // Generate a clean short code: e.g. "FH-XXXXXX"
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    const code = `FH-${randomHex}`;

    const invite = await Invite.create({
      code,
      createdBy: req.user._id,
    });

    res.status(201).json(invite);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all generated invite codes
// @route   GET /api/admin/invites
// @access  Private/Admin
export const getInviteCodes = async (req, res) => {
  try {
    const invites = await Invite.find({})
      .populate('createdBy', 'username')
      .populate('usedBy', 'username')
      .sort({ createdAt: -1 });

    res.json(invites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove a user member
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const removeMember = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot remove yourself' });
    }

    await user.deleteOne();
    res.json({ message: `User "${user.username}" removed successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset password for a user to a default value
// @route   POST /api/admin/users/:id/reset-password
// @access  Private/Admin
export const resetUserPassword = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const tempPassword = 'TempPasswordHub123!';
    user.password = tempPassword;
    await user.save();

    res.json({
      message: `Password for "${user.username}" reset successfully.`,
      tempPassword,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Publish a global announcement to all users
// @route   POST /api/admin/announcement
// @access  Private/Admin
export const sendAnnouncement = async (req, res) => {
  const { title, message } = req.body;

  try {
    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    const notification = await Notification.create({
      sender: req.user._id,
      recipient: null, // null means global broadcast
      type: 'announcement',
      title: `📣 Announcement: ${title}`,
      message,
    });

    const populated = await Notification.findById(notification._id)
      .populate('sender', 'username avatar');

    if (req.io) {
      req.io.emit('notification', {
        ...populated.toJSON(),
        sender: { _id: req.user._id, username: req.user.username, avatar: req.user.avatar },
      });
    }

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard analytics counts
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalMessages = await Message.countDocuments();
    const totalFiles = await File.countDocuments();
    const totalNotes = await Note.countDocuments();
    const totalScores = await GameScore.countDocuments();
    
    // Average Login streak
    const users = await User.find({}).select('loginStreak');
    const avgStreak = users.length > 0 
      ? (users.reduce((sum, u) => sum + u.loginStreak, 0) / users.length).toFixed(1)
      : 0;

    // Game popularity aggregator
    const gameAggregates = await GameScore.aggregate([
      { $group: { _id: '$gameName', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Format chart ready payload
    const gameStats = gameAggregates.map((g) => ({
      game: g._id,
      count: g.count,
    }));

    res.json({
      totalUsers,
      totalMessages,
      totalFiles,
      totalNotes,
      totalScores,
      avgStreak,
      gameStats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Disable an invite code
// @route   PUT /api/admin/invite/:id/disable
// @access  Private/Admin
export const disableInviteCode = async (req, res) => {
  try {
    const invite = await Invite.findById(req.params.id);
    if (!invite) {
      return res.status(404).json({ message: 'Invite not found' });
    }
    invite.isActive = false;
    await invite.save();
    res.json(invite);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Regenerate an invite code
// @route   POST /api/admin/invite/:id/regenerate
// @access  Private/Admin
export const regenerateInviteCode = async (req, res) => {
  try {
    const invite = await Invite.findById(req.params.id);
    if (!invite) {
      return res.status(404).json({ message: 'Invite not found' });
    }

    const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
    invite.code = `FH-${randomHex}`;
    invite.isActive = true;
    invite.isUsed = false;
    invite.usedBy = null;
    invite.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // fresh 24 hours
    
    await invite.save();
    res.json(invite);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
