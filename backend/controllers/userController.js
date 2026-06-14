import bcrypt from 'bcryptjs';

import User from '../models/User.js';

// @desc    Get user profile details
// @route   GET /api/users/profile
export const getUserProfile = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: 'User unauthorized.' });
    return;
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error loading user info.' });
  }
};

// @desc    Update user profile name
// @route   PUT /api/users/profile
export const updateUserProfile = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: 'User unauthorized.' });
    return;
  }

  const { name } = req.body;
  if (!name || name.trim() === '') {
    res.status(400).json({ message: 'Name cannot be blank.' });
    return;
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, { name }, { new: true });
    res.json({
      _id: updatedUser?._id,
      name: updatedUser?.name,
      email: updatedUser?.email
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error keeping user info.' });
  }
};

// @desc    Change user account password
// @route   PUT /api/users/change-password
export const changeUserPassword = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: 'User unauthorized.' });
    return;
  }

  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    res.status(400).json({ message: 'All password fields are required.' });
    return;
  }

  if (newPassword !== confirmNewPassword) {
    res.status(400).json({ message: 'New passwords do not match.' });
    return;
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password || '');
    if (!isMatch) {
      res.status(400).json({ message: 'Incorrect current password.' });
      return;
    }

    // Hash and save new password
    const salt = await bcrypt.genSalt(10);
    const newHashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findByIdAndUpdate(userId, { password: newHashedPassword });
    res.json({ message: 'Password changed successfully!' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error changing password.' });
  }
};