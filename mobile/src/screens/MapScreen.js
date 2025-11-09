import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { useLocation } from '../context/LocationContext';
import { useNotification } from '../context/NotificationContext';

export default function MapScreen() {
  const { location } = useLocation();
  const { nearbyFriends } = useNotification();
  const [region, setRegion] = useState(null);

  useEffect(() => {
    if (location) {
      setRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [location]);

  if (!location) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Location not available</Text>
          <Text style={styles.emptySubtext}>
            Please enable location services to see the map
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        showsUserLocation={true}
        showsMyLocationButton={true}
        onRegionChangeComplete={setRegion}
      >
        {/* Proximity circle around user */}
        <Circle
          center={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          radius={500} // 500 meters
          strokeColor="rgba(0, 122, 255, 0.5)"
          fillColor="rgba(0, 122, 255, 0.1)"
        />

        {/* Markers for nearby friends */}
        {nearbyFriends.map((friend) => (
          <Marker
            key={friend.id}
            coordinate={{
              latitude: location.latitude + (Math.random() - 0.5) * 0.01,
              longitude: location.longitude + (Math.random() - 0.5) * 0.01,
            }}
            title={friend.username}
            description={`${Math.round(friend.distance)}m away`}
            pinColor="#4CAF50"
          />
        ))}
      </MapView>

      {nearbyFriends.length > 0 && (
        <View style={styles.infoPanel}>
          <Text style={styles.infoPanelTitle}>Nearby Friends</Text>
          {nearbyFriends.map((friend) => (
            <View key={friend.id} style={styles.friendItem}>
              <Text style={styles.friendItemName}>{friend.username}</Text>
              <Text style={styles.friendItemDistance}>
                {friend.sameCellTower
                  ? 'Same cell tower'
                  : `${Math.round(friend.distance)}m away`}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#f5f5f5',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 8,
    textAlign: 'center',
  },
  infoPanel: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  infoPanelTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  friendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  friendItemName: {
    fontSize: 14,
    fontWeight: '600',
  },
  friendItemDistance: {
    fontSize: 14,
    color: '#666',
  },
});
