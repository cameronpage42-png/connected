const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const db = require('../models/Database');

// Get current user profile
router.get('/me', authenticateToken, (req, res) => {
  const user = db.getUserById(req.user.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt
  });
});

// Search users
router.get('/search', authenticateToken, (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Search query required' });
  }

  const users = db.getAllUsers().filter(u =>
    u.username.toLowerCase().includes(q.toLowerCase()) && u.id !== req.user.userId
  );

  res.json({
    users: users.map(u => ({
      id: u.id,
      username: u.username
    }))
  });
});

module.exports = router;
