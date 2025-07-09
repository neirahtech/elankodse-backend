import express from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Update user info
router.put('/profile', auth, async (req, res) => {
  const { firstName, lastName, avatar } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { firstName, lastName, avatar },
    { new: true }
  ).select('-password');
  res.json(user);
});

// Change password
router.put('/password', auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id);
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) return res.status(400).json({ error: 'Current password is incorrect' });
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.json({ message: 'Password updated' });
});

export default router; 