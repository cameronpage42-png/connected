const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const db = require('../models/Database');

// Get meetup requests
router.get('/requests', authenticateToken, (req, res) => {
  const requests = db.getUserMeetupRequests(req.user.userId);

  res.json({ requests });
});

// Create meetup request
router.post('/request', authenticateToken, (req, res) => {
  const { friendId } = req.body;

  if (!friendId) {
    return res.status(400).json({ error: 'Friend ID required' });
  }

  if (!db.areFriends(req.user.userId, friendId)) {
    return res.status(403).json({ error: 'Can only send meetup requests to friends' });
  }

  const request = db.createMeetupRequest({
    fromUserId: req.user.userId,
    toUserId: friendId,
    status: 'pending'
  });

  res.json({
    message: 'Meetup request sent',
    request
  });
});

// Respond to meetup request
router.post('/respond', authenticateToken, (req, res) => {
  const { requestId, accepted } = req.body;

  if (!requestId || accepted === undefined) {
    return res.status(400).json({ error: 'Request ID and accepted status required' });
  }

  const request = db.getMeetupRequest(requestId);
  if (!request) {
    return res.status(404).json({ error: 'Request not found' });
  }

  if (request.toUserId !== req.user.userId) {
    return res.status(403).json({ error: 'Not authorized to respond to this request' });
  }

  const updated = db.updateMeetupRequest(requestId, {
    status: accepted ? 'accepted' : 'declined',
    respondedAt: new Date().toISOString()
  });

  res.json({
    message: `Request ${accepted ? 'accepted' : 'declined'}`,
    request: updated
  });
});

module.exports = router;
