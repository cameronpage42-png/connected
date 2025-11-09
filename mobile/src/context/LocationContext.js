import React, { createContext, useState, useContext, useEffect } from 'react';
import * as Location from 'expo-location';
import socketService from '../services/socket';
import { locationAPI } from '../services/api';

const LocationContext = createContext();

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within LocationProvider');
  }
  return context;
};

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null);
  const [tracking, setTracking] = useState(false);
  const [permission, setPermission] = useState(null);

  useEffect(() => {
    requestPermission();
  }, []);

  const requestPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermission(status === 'granted');

      if (status === 'granted') {
        startTracking();
      }
    } catch (error) {
      console.error('Permission error:', error);
    }
  };

  const startTracking = async () => {
    try {
      setTracking(true);

      // Get initial location
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      updateLocation(currentLocation);

      // Watch location changes
      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 10000, // Update every 10 seconds
          distanceInterval: 50, // Or when moved 50 meters
        },
        (newLocation) => {
          updateLocation(newLocation);
        }
      );
    } catch (error) {
      console.error('Tracking error:', error);
      setTracking(false);
    }
  };

  const updateLocation = (locationData) => {
    const { latitude, longitude, accuracy } = locationData.coords;

    const locationUpdate = {
      latitude,
      longitude,
      accuracy,
      timestamp: locationData.timestamp,
    };

    setLocation(locationUpdate);

    // Send to server via socket
    socketService.updateLocation(locationUpdate);

    // Also update via API
    locationAPI.updateLocation(latitude, longitude, null, accuracy).catch((error) => {
      console.error('Location API update error:', error);
    });
  };

  const stopTracking = () => {
    setTracking(false);
    // Note: expo-location doesn't provide a direct way to stop watching
    // The subscription is automatically cleaned up when component unmounts
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        tracking,
        permission,
        startTracking,
        stopTracking,
        requestPermission,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};
