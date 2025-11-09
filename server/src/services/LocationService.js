const { getDistance } = require('geolib');
const db = require('../models/Database');

class LocationService {
  constructor(io) {
    this.io = io;
    this.proximityThreshold = process.env.PROXIMITY_THRESHOLD_METERS || 500;
    this.checkInterval = 10000; // Check every 10 seconds
    this.startProximityChecking();
  }

  updateUserLocation(userId, locationData) {
    const { latitude, longitude, cellTowerId, accuracy } = locationData;

    db.setUserLocation(userId, {
      latitude,
      longitude,
      cellTowerId,
      accuracy
    });

    console.log(`Location updated for user ${userId}:`, { latitude, longitude, cellTowerId });

    // Immediately check for nearby friends
    this.checkNearbyFriends(userId);
  }

  removeUserLocation(userId) {
    db.removeUserLocation(userId);
  }

  checkNearbyFriends(userId) {
    const userLocation = db.getUserLocation(userId);
    if (!userLocation) return;

    const friends = db.getFriends(userId);
    const nearbyFriends = [];

    for (const friend of friends) {
      const friendLocation = db.getUserLocation(friend.id);
      if (!friendLocation) continue;

      // Check if same cell tower (if available)
      const sameCellTower = userLocation.cellTowerId &&
                            friendLocation.cellTowerId &&
                            userLocation.cellTowerId === friendLocation.cellTowerId;

      // Calculate distance
      const distance = getDistance(
        { latitude: userLocation.latitude, longitude: userLocation.longitude },
        { latitude: friendLocation.latitude, longitude: friendLocation.longitude }
      );

      const isNearby = distance <= this.proximityThreshold || sameCellTower;

      if (isNearby) {
        nearbyFriends.push({
          friendId: friend.id,
          username: friend.username,
          distance,
          sameCellTower
        });

        // Emit notification to both users
        this.io.to(`user:${userId}`).emit('friend:nearby', {
          friend: {
            id: friend.id,
            username: friend.username
          },
          distance,
          sameCellTower,
          timestamp: new Date().toISOString()
        });

        this.io.to(`user:${friend.id}`).emit('friend:nearby', {
          friend: {
            id: userId,
            username: db.getUserById(userId).username
          },
          distance,
          sameCellTower,
          timestamp: new Date().toISOString()
        });
      }
    }

    return nearbyFriends;
  }

  startProximityChecking() {
    setInterval(() => {
      const allLocations = db.getAllLocations();
      for (const [userId] of allLocations) {
        this.checkNearbyFriends(userId);
      }
    }, this.checkInterval);
  }

  getNearbyFriends(userId) {
    const userLocation = db.getUserLocation(userId);
    if (!userLocation) return [];

    const friends = db.getFriends(userId);
    const nearbyFriends = [];

    for (const friend of friends) {
      const friendLocation = db.getUserLocation(friend.id);
      if (!friendLocation) continue;

      const sameCellTower = userLocation.cellTowerId &&
                            friendLocation.cellTowerId &&
                            userLocation.cellTowerId === friendLocation.cellTowerId;

      const distance = getDistance(
        { latitude: userLocation.latitude, longitude: userLocation.longitude },
        { latitude: friendLocation.latitude, longitude: friendLocation.longitude }
      );

      const isNearby = distance <= this.proximityThreshold || sameCellTower;

      if (isNearby) {
        nearbyFriends.push({
          id: friend.id,
          username: friend.username,
          distance,
          sameCellTower
        });
      }
    }

    return nearbyFriends;
  }
}

module.exports = LocationService;
