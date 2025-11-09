import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotification } from '../context/NotificationContext';
import { useLocation } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';
import socketService from '../services/socket';

export default function HomeScreen() {
  const { nearbyFriends, meetupRequests } = useNotification();
  const { location, tracking } = useLocation();
  const { user } = useAuth();

  const handleMeetupRequest = (friend) => {
    Alert.alert(
      'Send Meetup Request',
      `Do you want to meet up with ${friend.username}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Send Request',
          onPress: () => {
            socketService.sendMeetupRequest(friend.id, user.username);
            Alert.alert('Success', `Meetup request sent to ${friend.username}`);
          },
        },
      ]
    );
  };

  const renderNearbyFriend = ({ item }) => (
    <View style={styles.friendCard}>
      <View style={styles.friendInfo}>
        <Ionicons name="person-circle" size={40} color="#007AFF" />
        <View style={styles.friendDetails}>
          <Text style={styles.friendName}>{item.username}</Text>
          <Text style={styles.friendDistance}>
            {item.sameCellTower
              ? 'Same cell tower'
              : `${Math.round(item.distance)}m away`}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.meetupButton}
        onPress={() => handleMeetupRequest(item)}
      >
        <Text style={styles.meetupButtonText}>Want to Meet</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.username}!</Text>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: tracking ? '#4CAF50' : '#FF5252' },
            ]}
          />
          <Text style={styles.statusText}>
            {tracking ? 'Location Active' : 'Location Inactive'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Nearby Friends ({nearbyFriends.length})
        </Text>

        {nearbyFriends.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No friends nearby</Text>
            <Text style={styles.emptySubtext}>
              Your friends will appear here when they're close
            </Text>
          </View>
        ) : (
          <FlatList
            data={nearbyFriends}
            renderItem={renderNearbyFriend}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
          />
        )}
      </View>

      {meetupRequests.length > 0 && (
        <View style={styles.requestsBadge}>
          <Text style={styles.requestsText}>
            {meetupRequests.length} meetup request{meetupRequests.length > 1 ? 's' : ''}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  list: {
    paddingBottom: 20,
  },
  friendCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  friendDetails: {
    marginLeft: 12,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
  },
  friendDistance: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  meetupButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  meetupButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 8,
    textAlign: 'center',
  },
  requestsBadge: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#FF5252',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  requestsText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
