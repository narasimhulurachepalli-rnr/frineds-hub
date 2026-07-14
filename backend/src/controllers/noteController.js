import Note from '../models/note.js';
import Notification from '../models/notification.js';
import User from '../models/user.js';

// @desc    Get all notes (filtered by type)
// @route   GET /api/notes
// @access  Private
export const getNotes = async (req, res) => {
  try {
    const { type } = req.query;
    const query = {};
    if (type) {
      query.type = type;
    }
    const notes = await Note.find(query)
      .populate('author', 'username avatar')
      .populate('collaborators', 'username avatar')
      .populate('todos.assignedTo', 'username avatar')
      .sort({ isPinned: -1, updatedAt: -1 });

    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single note
// @route   GET /api/notes/:id
// @access  Private
export const getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate('author', 'username avatar')
      .populate('collaborators', 'username avatar')
      .populate('todos.assignedTo', 'username avatar');

    if (note) {
      res.json(note);
    } else {
      res.status(404).json({ message: 'Note not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new note
// @route   POST /api/notes
// @access  Private
export const createNote = async (req, res) => {
  const { title, content, type, todos, tags, collaborators } = req.body;

  try {
    const note = await Note.create({
      title,
      content: content || '',
      author: req.user._id,
      type: type || 'richtext',
      todos: todos || [],
      tags: tags || [],
      collaborators: collaborators || [],
    });

    const populatedNote = await Note.findById(note._id)
      .populate('author', 'username avatar')
      .populate('collaborators', 'username avatar');

    // Create system notification
    const notification = await Notification.create({
      sender: req.user._id,
      type: 'note_upload',
      title: 'New Shared Note Created',
      message: `${req.user.username} created a new ${type || 'richtext'} note: "${title}"`,
      relatedId: note._id,
    });

    // Broadcast via socket.io (if available)
    if (req.io) {
      req.io.emit('notification', {
        ...notification.toJSON(),
        sender: { _id: req.user._id, username: req.user.username, avatar: req.user.avatar },
      });
    }

    // Award achievement check
    const noteCount = await Note.countDocuments({ author: req.user._id });
    if (noteCount === 5) {
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { achievements: 'Scholar uploader' }
      });
    }

    res.status(201).json(populatedNote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Private
export const updateNote = async (req, res) => {
  const { title, content, todos, tags, collaborators, isPinned } = req.body;

  try {
    const note = await Note.findById(req.params.id);

    if (note) {
      note.title = title || note.title;
      note.content = content !== undefined ? content : note.content;
      note.todos = todos || note.todos;
      note.tags = tags || note.tags;
      note.collaborators = collaborators || note.collaborators;
      note.isPinned = isPinned !== undefined ? isPinned : note.isPinned;

      const updatedNote = await note.save();
      const populated = await Note.findById(updatedNote._id)
        .populate('author', 'username avatar')
        .populate('collaborators', 'username avatar')
        .populate('todos.assignedTo', 'username avatar');

      res.json(populated);
    } else {
      res.status(404).json({ message: 'Note not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (note) {
      // Check author or Admin
      if (note.author.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
        return res.status(403).json({ message: 'Not authorized to delete this note' });
      }
      await note.deleteOne();
      res.json({ message: 'Note removed successfully' });
    } else {
      res.status(404).json({ message: 'Note not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle pin note
// @route   POST /api/notes/:id/pin
// @access  Private
export const togglePinNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (note) {
      note.isPinned = !note.isPinned;
      await note.save();
      res.json({ success: true, isPinned: note.isPinned });
    } else {
      res.status(404).json({ message: 'Note not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
