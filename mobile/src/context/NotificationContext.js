import React, { createContext, useState, useContext, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import socketService from '../services/socket';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

// Configure how notifications should be displayed
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const NotificationProvider = ({ children }) => {
  const [nearbyFriends, setNearbyFriends] = useState([]);
  const [meetupRequests, setMeetupRequests] = useState([]);

  useEffect(() => {
    requestPermission();
    setupSocketListeners();

    return () => {
      cleanupSocketListeners();
    };
  }, []);

  const requestPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('Notification permission not granted');
    }
  };

  const setupSocketListeners = () => {
    // Listen for nearby friends
    socketService.on('friend:nearby', (data) => {
      handleFriendNearby(data);
    });

    // Listen for meetup requests
    socketService.on('meetup:request', (data) => {
      handleMeetupRequest(data);
    });

    // Listen for meetup responses
    socketService.on('meetup:response', (data) => {
      handleMeetupResponse(data);
    });

    // Listen for general notifications
    socketService.on('notification', (data) => {
      showNotification(data.title, data.message);
    });
  };

  const cleanupSocketListeners = () => {
    socketService.off('friend:nearby');
    socketService.off('meetup:request');
    socketService.off('meetup:response');
    socketService.off('notification');
  };

  const handleFriendNearby = (data) => {
    const { friend, distance, sameCellTower } = data;

    // Update nearby friends list
    setNearbyFriends((prev) => {
      const existing = prev.find((f) => f.id === friend.id);
      if (!existing) {
        const newFriend = { ...friend, distance, sameCellTower };
        showNotification(
          'Friend Nearby!',
          `${friend.username} is nearby ${sameCellTower ? '(same cell tower)' : `(${Math.round(distance)}m away)`}`
        );
        return [...prev, newFriend];
      }
      return prev;
    });
  };

  const handleMeetupRequest = (data) => {
    const { fromUserId, fromUsername } = data;

    setMeetupRequests((prev) => [...prev, data]);

    showNotification(
      'Meetup Request',
      `${fromUsername} wants to meet up!`,
      { type: 'meetup_request', fromUserId, fromUsername }
    );
  };

  const handleMeetupResponse = (data) => {
    const { fromUserId, accepted } = data;

    showNotification(
      accepted ? 'Meetup Accepted!' : 'Meetup Declined',
      accepted ? 'Your friend accepted your meetup request!' : 'Your friend declined your meetup request.'
    );
  };

  const showNotification = async (title, body, data = {}) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
      },
      trigger: null, // Show immediately
    });
  };

  const clearNearbyFriend = (friendId) => {
    setNearbyFriends((prev) => prev.filter((f) => f.id !== friendId));
  };

  const removeMeetupRequest = (requestId) => {
    setMeetupRequests((prev) => prev.filter((r) => r.id !== requestId));
  };

  return (
    <NotificationContext.Provider
      value={{
        nearbyFriends,
        meetupRequests,
        clearNearbyFriend,
        removeMeetupRequest,
        showNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
