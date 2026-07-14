import Event from '../models/event.js';
import User from '../models/user.js';
import Notification from '../models/notification.js';

// @desc    Get all calendar events (includes dynamically generated member birthdays)
// @route   GET /api/events
// @access  Private
export const getEvents = async (req, res) => {
  try {
    const events = await Event.find({})
      .populate('creator', 'username avatar')
      .populate('attendees', 'username avatar');

    // Fetch user birthdays to project them onto the calendar
    const users = await User.find({ birthday: { $ne: null } }).select('username birthday avatar');
    
    // Project user birthdays dynamically for the current year
    const currentYear = new Date().getFullYear();
    const birthdayEvents = users.map((user) => {
      const bday = new Date(user.birthday);
      // Project to current year calendar
      const start = new Date(currentYear, bday.getMonth(), bday.getDate(), 0, 0, 0);
      const end = new Date(currentYear, bday.getMonth(), bday.getDate(), 23, 59, 59);

      return {
        _id: `bday-${user._id}-${currentYear}`,
        title: `🎂 ${user.username}'s Birthday!`,
        description: `Wish ${user.username} a fantastic birthday!`,
        start,
        end,
        type: 'birthday',
        creator: { _id: user._id, username: user.username, avatar: user.avatar },
        attendees: [],
        dynamic: true,
      };
    });

    res.json([...events, ...birthdayEvents]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a calendar event
// @route   POST /api/events
// @access  Private
export const createEvent = async (req, res) => {
  const { title, description, start, end, type } = req.body;

  try {
    const event = await Event.create({
      title,
      description: description || '',
      creator: req.user._id,
      start: new Date(start),
      end: new Date(end),
      type: type || 'other',
      attendees: [req.user._id],
    });

    const populated = await Event.findById(event._id)
      .populate('creator', 'username avatar')
      .populate('attendees', 'username avatar');

    // Create system notification
    const notification = await Notification.create({
      sender: req.user._id,
      type: 'event',
      title: 'New Event Scheduled',
      message: `${req.user.username} scheduled a new event: "${title}"`,
      relatedId: event._id,
    });

    // Broadcast
    if (req.io) {
      req.io.emit('notification', {
        ...notification.toJSON(),
        sender: { _id: req.user._id, username: req.user.username, avatar: req.user.avatar },
      });
    }

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a calendar event
// @route   DELETE /api/events/:id
// @access  Private
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.creator.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await event.deleteOne();
    res.json({ message: 'Event removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle join/leave attendance for an event
// @route   POST /api/events/:id/attend
// @access  Private
export const toggleAttendance = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const userId = req.user._id;
    const isAttending = event.attendees.includes(userId);

    if (isAttending) {
      event.attendees = event.attendees.filter((id) => id.toString() !== userId.toString());
    } else {
      event.attendees.push(userId);
    }

    await event.save();
    
    const populated = await Event.findById(event._id)
      .populate('creator', 'username avatar')
      .populate('attendees', 'username avatar');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
