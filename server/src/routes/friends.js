const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const db = require('../models/Database');

// Get friends list
router.get('/', authenticateToken, (req, res) => {
  const friends = db.getFriends(req.user.userId);

  res.json({
    friends: friends.map(f => ({
      id: f.id,
      username: f.username,
      email: f.email
    }))
  });
});

// Add friend
router.post('/add', authenticateToken, (req, res) => {
  const { friendId } = req.body;

  if (!friendId) {
    return res.status(400).json({ error: 'Friend ID required' });
  }

  if (friendId === req.user.userId) {
    return res.status(400).json({ error: 'Cannot add yourself as friend' });
  }

  const friend = db.getUserById(friendId);
  if (!friend) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (db.areFriends(req.user.userId, friendId)) {
    return res.status(409).json({ error: 'Already friends' });
  }

  db.addFriend(req.user.userId, friendId);

  res.json({
    message: 'Friend added successfully',
    friend: {
      id: friend.id,
      username: friend.username
    }
  });
});

// Remove friend
router.delete('/:friendId', authenticateToken, (req, res) => {
  const { friendId } = req.params;

  if (!db.getUserById(friendId)) {
    return res.status(404).json({ error: 'User not found' });
  }

  db.removeFriend(req.user.userId, friendId);

  res.json({ message: 'Friend removed successfully' });
});

module.exports = router;
