class NotificationService {
  constructor(io) {
    this.io = io;
  }

  sendNotification(userId, notification) {
    this.io.to(`user:${userId}`).emit('notification', {
      ...notification,
      timestamp: new Date().toISOString()
    });
  }

  sendFriendNearbyNotification(userId, friend, distance, sameCellTower) {
    this.sendNotification(userId, {
      type: 'friend_nearby',
      title: 'Friend Nearby!',
      message: `${friend.username} is nearby (${distance}m away)`,
      data: {
        friendId: friend.id,
        username: friend.username,
        distance,
        sameCellTower
      }
    });
  }

  sendMeetupRequestNotification(userId, fromUser) {
    this.sendNotification(userId, {
      type: 'meetup_request',
      title: 'Meetup Request',
      message: `${fromUser.username} wants to meet up!`,
      data: {
        fromUserId: fromUser.id,
        fromUsername: fromUser.username
      }
    });
  }

  sendMeetupResponseNotification(userId, fromUser, accepted) {
    this.sendNotification(userId, {
      type: 'meetup_response',
      title: accepted ? 'Meetup Accepted!' : 'Meetup Declined',
      message: accepted
        ? `${fromUser.username} accepted your meetup request!`
        : `${fromUser.username} declined your meetup request.`,
      data: {
        fromUserId: fromUser.id,
        fromUsername: fromUser.username,
        accepted
      }
    });
  }
}

module.exports = NotificationService;
