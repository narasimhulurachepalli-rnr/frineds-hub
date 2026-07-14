import Message from '../models/message.js';
import User from '../models/user.js';

// @desc    Get message history
// @route   GET /api/chat
// @access  Private
export const getMessages = async (req, res) => {
  try {
    const { search, limit = 50, before } = req.query;

    const query = { deleted: false };
    if (search) {
      query.content = { $regex: search, $options: 'i' };
    }
    if (before) {
      query._id = { $lt: before };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('sender', 'username avatar role')
      .populate('repliedTo')
      .populate({
        path: 'repliedTo',
        populate: { path: 'sender', select: 'username' }
      });

    // Return in chronological order
    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Post a new message
// @route   POST /api/chat
// @access  Private
export const createMessage = async (req, res) => {
  const { content, type, repliedTo } = req.body;

  try {
    let fileUrl = '';
    let fileName = '';
    let fileSize = 0;

    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
      fileName = req.file.originalname;
      fileSize = req.file.size;
    }

    const message = await Message.create({
      sender: req.user._id,
      content: content || fileName || 'Attachment',
      type: type || (req.file ? (req.file.mimetype.startsWith('image/') ? 'image' : req.file.mimetype.startsWith('audio/') ? 'voice' : 'file') : 'text'),
      fileUrl,
      fileName,
      fileSize,
      repliedTo: repliedTo || null,
      seenBy: [req.user._id],
    });

    const populated = await Message.findById(message._id)
      .populate('sender', 'username avatar role')
      .populate({
        path: 'repliedTo',
        populate: { path: 'sender', select: 'username' }
      });

    // Check and reward "First Chat" achievement badge if applicable
    const chatCount = await Message.countDocuments({ sender: req.user._id });
    if (chatCount === 1) {
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { achievements: 'First Words' }
      });
    } else if (chatCount === 100) {
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { achievements: 'Chatterbox' }
      });
    }

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Edit a message
// @route   PUT /api/chat/:id
// @access  Private
export const editMessage = async (req, res) => {
  const { content } = req.body;

  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Cannot edit someone else\'s message' });
    }

    message.content = content;
    message.edited = true;
    await message.save();

    const populated = await Message.findById(message._id)
      .populate('sender', 'username avatar role')
      .populate({
        path: 'repliedTo',
        populate: { path: 'sender', select: 'username' }
      });

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a message (soft delete)
// @route   DELETE /api/chat/:id
// @access  Private
export const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to delete' });
    }

    // Soft delete
    message.content = 'This message was deleted';
    message.deleted = true;
    message.fileUrl = '';
    message.fileName = '';
    await message.save();

    res.json({ id: message._id, deleted: true, message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    React to message with emoji
// @route   POST /api/chat/:id/react
// @access  Private
export const reactToMessage = async (req, res) => {
  const { emoji } = req.body;

  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    const userId = req.user._id;

    // Check if user already reacted with this emoji
    const existingIndex = message.reactions.findIndex(
      (r) => r.user.toString() === userId.toString() && r.emoji === emoji
    );

    if (existingIndex > -1) {
      // Remove reaction
      message.reactions.splice(existingIndex, 1);
    } else {
      // Remove any previous reaction by this user and add new one, or allow multiple emojis
      // Let's allow multiple emojis per user, but toggle specific user-emoji pair
      message.reactions.push({ user: userId, emoji });
    }

    await message.save();
    
    const populated = await Message.findById(message._id)
      .populate('sender', 'username avatar role')
      .populate('reactions.user', 'username')
      .populate({
        path: 'repliedTo',
        populate: { path: 'sender', select: 'username' }
      });

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark message as seen
// @route   POST /api/chat/:id/seen
// @access  Private
export const seenMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    const userId = req.user._id;
    if (!message.seenBy.includes(userId)) {
      message.seenBy.push(userId);
      await message.save();
    }

    res.json({ success: true, messageId: message._id, seenBy: message.seenBy });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
