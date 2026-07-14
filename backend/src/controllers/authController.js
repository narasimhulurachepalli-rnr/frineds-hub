import User from '../models/user.js';
import Invite from '../models/invite.js';
import jwt from 'jsonwebtoken';

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretfriendhubtokenkey2026', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user (Invite Only, Max 10 users)
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { username, email, password, inviteCode } = req.body;

  try {
    // 1. Check if user limit of 10 has been reached
    const userCount = await User.countDocuments();
    if (userCount >= 10) {
      return res.status(400).json({ message: 'Registration closed. Limit of 10 users has been reached.' });
    }

    // 2. Validate user fields
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'Username or Email already registered' });
    }

    // 3. Invite code validation (except if this is the first user who will become Admin)
    let isFirstUser = userCount === 0;
    let inviteObj = null;

    if (!isFirstUser) {
      if (!inviteCode) {
        return res.status(400).json({ message: 'Registration requires a valid invite code' });
      }
      inviteObj = await Invite.findOne({ code: inviteCode });
      if (!inviteObj) {
        return res.status(400).json({ message: 'Invalid invite code' });
      }
      if (!inviteObj.isActive) {
        return res.status(400).json({ message: 'This invitation code is inactive.' });
      }
      if (inviteObj.isUsed) {
        return res.status(400).json({ message: 'This invitation code has already been used.' });
      }
      if (inviteObj.expiresAt < new Date()) {
        return res.status(400).json({ message: 'This invitation link has expired (valid for 24h).' });
      }
    }

    // 4. Create User
    const role = isFirstUser ? 'Admin' : 'Member';
    const user = await User.create({
      username,
      email,
      password,
      role,
      inviteCodeUsed: inviteCode || 'FIRST_USER_SEEDED_ADMIN',
      loginStreak: 1,
      lastLoginDate: new Date(),
    });

    if (user) {
      // Mark invite code as used
      if (inviteObj) {
        inviteObj.isUsed = true;
        inviteObj.usedBy = user._id;
        await inviteObj.save();
      }

      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
        message: isFirstUser 
          ? 'Admin account created successfully (First user auto-promoted).' 
          : 'User registered successfully.',
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Validate an invite code before registration
// @route   GET /api/auth/invite/validate/:code
// @access  Public
export const validateInviteCode = async (req, res) => {
  try {
    const invite = await Invite.findOne({ code: req.params.code });
    if (!invite) {
      return res.status(404).json({ valid: false, message: 'Invitation link not found.' });
    }

    if (!invite.isActive) {
      return res.status(400).json({ valid: false, message: 'This invitation has been disabled by the Admin.' });
    }

    if (invite.isUsed) {
      return res.status(400).json({ valid: false, message: 'This invitation code has already been used.' });
    }

    if (invite.expiresAt < new Date()) {
      return res.status(400).json({ valid: false, message: 'This invitation link has expired.' });
    }

    res.json({ valid: true, code: invite.code });
  } catch (error) {
    res.status(500).json({ valid: false, message: error.message });
  }
};

// @desc    Authenticate user & get token (calculates login streak)
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { emailOrUsername, password } = req.body;

  try {
    // Find user by username or email
    const user = await User.findOne({
      $or: [{ email: emailOrUsername.toLowerCase() }, { username: emailOrUsername }],
    });

    if (user && (await user.matchPassword(password))) {
      // Calculate daily login streak
      const now = new Date();
      const lastLogin = user.lastLoginDate;

      if (!lastLogin) {
        user.loginStreak = 1;
      } else {
        const lastLoginDay = new Date(lastLogin).setHours(0, 0, 0, 0);
        const todayDay = new Date(now).setHours(0, 0, 0, 0);
        const diffTime = Math.abs(todayDay - lastLoginDay);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          // Logged in yesterday - increment streak
          user.loginStreak += 1;
          // Award badges if streak milestone hit
          if (user.loginStreak >= 7 && !user.achievements.includes('7-Day Streak')) {
            user.achievements.push('7-Day Streak');
          }
          if (user.loginStreak >= 30 && !user.achievements.includes('30-Day Streak')) {
            user.achievements.push('30-Day Streak');
          }
        } else if (diffDays > 1) {
          // Lost streak - reset to 1
          user.loginStreak = 1;
        }
        // If diffDays === 0, it means they logged in today already; leave streak as is.
      }

      user.lastLoginDate = now;
      user.status = 'Online';
      await user.save();

      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        loginStreak: user.loginStreak,
        achievements: user.achievements,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (user && (await user.matchPassword(currentPassword))) {
      user.password = newPassword;
      await user.save();
      res.json({ message: 'Password updated successfully' });
    } else {
      res.status(401).json({ message: 'Invalid current password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user streak info and achievements
// @route   GET /api/auth/streak
// @access  Private
export const getStreakAndBadges = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('loginStreak lastLoginDate achievements');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get total users count
// @route   GET /api/auth/users-count
// @access  Public
export const getUsersCount = async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
