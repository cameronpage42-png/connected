// In-memory database (for production, use PostgreSQL, MongoDB, etc.)
class Database {
  constructor() {
    this.users = new Map();
    this.friends = new Map();
    this.locations = new Map();
    this.meetupRequests = new Map();
  }

  // User operations
  createUser(user) {
    this.users.set(user.id, user);
    this.friends.set(user.id, new Set());
    return user;
  }

  getUserById(userId) {
    return this.users.get(userId);
  }

  getUserByUsername(username) {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  getAllUsers() {
    return Array.from(this.users.values());
  }

  updateUser(userId, updates) {
    const user = this.users.get(userId);
    if (!user) return null;
    const updated = { ...user, ...updates };
    this.users.set(userId, updated);
    return updated;
  }

  // Friend operations
  addFriend(userId, friendId) {
    if (!this.friends.has(userId)) {
      this.friends.set(userId, new Set());
    }
    if (!this.friends.has(friendId)) {
      this.friends.set(friendId, new Set());
    }
    this.friends.get(userId).add(friendId);
    this.friends.get(friendId).add(userId);
    return true;
  }

  removeFriend(userId, friendId) {
    if (this.friends.has(userId)) {
      this.friends.get(userId).delete(friendId);
    }
    if (this.friends.has(friendId)) {
      this.friends.get(friendId).delete(userId);
    }
    return true;
  }

  getFriends(userId) {
    const friendIds = this.friends.get(userId) || new Set();
    return Array.from(friendIds).map(id => this.getUserById(id)).filter(Boolean);
  }

  areFriends(userId1, userId2) {
    return this.friends.has(userId1) && this.friends.get(userId1).has(userId2);
  }

  // Location operations
  setUserLocation(userId, location) {
    this.locations.set(userId, {
      ...location,
      timestamp: new Date().toISOString()
    });
  }

  getUserLocation(userId) {
    return this.locations.get(userId);
  }

  removeUserLocation(userId) {
    this.locations.delete(userId);
  }

  getAllLocations() {
    return this.locations;
  }

  // Meetup request operations
  createMeetupRequest(request) {
    const id = `${request.fromUserId}-${request.toUserId}-${Date.now()}`;
    this.meetupRequests.set(id, { ...request, id, timestamp: new Date().toISOString() });
    return this.meetupRequests.get(id);
  }

  getMeetupRequest(requestId) {
    return this.meetupRequests.get(requestId);
  }

  updateMeetupRequest(requestId, updates) {
    const request = this.meetupRequests.get(requestId);
    if (!request) return null;
    const updated = { ...request, ...updates };
    this.meetupRequests.set(requestId, updated);
    return updated;
  }

  getUserMeetupRequests(userId) {
    return Array.from(this.meetupRequests.values()).filter(
      r => r.fromUserId === userId || r.toUserId === userId
    );
  }
}

module.exports = new Database();
