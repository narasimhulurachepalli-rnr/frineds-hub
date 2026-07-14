import User from '../models/user.js';
import path from 'path';

// @desc    Get all user profiles (for dashboard, list, messaging status)
// @route   GET /api/users
// @access  Private
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single user profile
// @route   GET /api/users/:id
// @access  Private
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile details
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
      user.skills = req.body.skills !== undefined ? req.body.skills : user.skills;
      user.college = req.body.college !== undefined ? req.body.college : user.college;
      user.job = req.body.job !== undefined ? req.body.job : user.job;
      user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
      user.favoriteQuote = req.body.favoriteQuote !== undefined ? req.body.favoriteQuote : user.favoriteQuote;
      user.birthday = req.body.birthday !== undefined ? req.body.birthday : user.birthday;

      if (req.body.socialLinks) {
        user.socialLinks = {
          github: req.body.socialLinks.github !== undefined ? req.body.socialLinks.github : user.socialLinks.github,
          linkedin: req.body.socialLinks.linkedin !== undefined ? req.body.socialLinks.linkedin : user.socialLinks.linkedin,
          instagram: req.body.socialLinks.instagram !== undefined ? req.body.socialLinks.instagram : user.socialLinks.instagram,
          twitter: req.body.socialLinks.twitter !== undefined ? req.body.socialLinks.twitter : user.socialLinks.twitter,
        };
      }

      // Handle file uploads for avatar / cover image if uploaded
      if (req.files) {
        if (req.files.avatar) {
          const avatarFile = req.files.avatar[0];
          user.avatar = `/uploads/${avatarFile.filename}`;
        }
        if (req.files.coverImage) {
          const coverFile = req.files.coverImage[0];
          user.coverImage = `/uploads/${coverFile.filename}`;
        }
      }

      // Or fallback direct URL assignment
      if (req.body.avatarUrl) user.avatar = req.body.avatarUrl;
      if (req.body.coverImageUrl) user.coverImage = req.body.coverImageUrl;

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        coverImage: updatedUser.coverImage,
        bio: updatedUser.bio,
        skills: updatedUser.skills,
        college: updatedUser.college,
        job: updatedUser.job,
        phone: updatedUser.phone,
        birthday: updatedUser.birthday,
        favoriteQuote: updatedUser.favoriteQuote,
        socialLinks: updatedUser.socialLinks,
        achievements: updatedUser.achievements,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete account
// @route   DELETE /api/users/delete-account
// @access  Private
export const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      // Don't delete if it's the last Admin and other users exist
      if (user.role === 'Admin') {
        const admins = await User.countDocuments({ role: 'Admin' });
        const total = await User.countDocuments();
        if (admins === 1 && total > 1) {
          return res.status(400).json({ message: 'Cannot delete the only admin. Promote another member first.' });
        }
      }
      await user.deleteOne();
      res.json({ message: 'Account deleted successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
