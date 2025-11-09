const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const db = require('../models/Database');

// Update user location
router.post('/update', authenticateToken, (req, res) => {
  const { latitude, longitude, cellTowerId, accuracy } = req.body;

  if (latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: 'Latitude and longitude required' });
  }

  const locationData = {
    latitude,
    longitude,
    cellTowerId,
    accuracy,
    timestamp: new Date().toISOString()
  };

  db.setUserLocation(req.user.userId, locationData);

  res.json({
    message: 'Location updated successfully',
    location: locationData
  });
});

// Get user's current location
router.get('/me', authenticateToken, (req, res) => {
  const location = db.getUserLocation(req.user.userId);

  if (!location) {
    return res.status(404).json({ error: 'Location not found' });
  }

  res.json({ location });
});

module.exports = router;
