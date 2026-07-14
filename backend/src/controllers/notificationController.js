import Notification from '../models/notification.js';

// @desc    Get user notifications (global broadcasts + user specific alerts)
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const notifications = await Notification.find({
      $or: [
        { recipient: null }, // Global broadcast
        { recipient: userId }, // Direct notification
      ],
    })
      .populate('sender', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark notifications as read
// @route   POST /api/notifications/mark-read
// @access  Private
export const markAsRead = async (req, res) => {
  const { notificationIds } = req.body; // array of IDs, or empty to mark all as read
  const userId = req.user._id;

  try {
    const query = {
      $or: [
        { recipient: null },
        { recipient: userId },
      ],
    };

    if (notificationIds && notificationIds.length > 0) {
      query._id = { $in: notificationIds };
    }

    // Add userId to readBy array if not already present
    await Notification.updateMany(query, {
      $addToSet: { readBy: userId },
    });

    res.json({ success: true, message: 'Notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check if uploader or recipient or Admin
    if (
      notification.recipient &&
      notification.recipient.toString() !== req.user._id.toString() &&
      req.user.role !== 'Admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to delete' });
    }

    await notification.deleteOne();
    res.json({ message: 'Notification removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
