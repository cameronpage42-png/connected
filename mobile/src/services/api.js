import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (username, password) =>
    api.post('/auth/login', { username, password }),
  register: (username, password, email) =>
    api.post('/auth/register', { username, password, email }),
};

export const userAPI = {
  getProfile: () => api.get('/users/me'),
  searchUsers: (query) => api.get('/users/search', { params: { q: query } }),
};

export const friendAPI = {
  getFriends: () => api.get('/friends'),
  addFriend: (friendId) => api.post('/friends/add', { friendId }),
  removeFriend: (friendId) => api.delete(`/friends/${friendId}`),
};

export const locationAPI = {
  updateLocation: (latitude, longitude, cellTowerId, accuracy) =>
    api.post('/location/update', { latitude, longitude, cellTowerId, accuracy }),
  getMyLocation: () => api.get('/location/me'),
};

export const meetupAPI = {
  getRequests: () => api.get('/meetup/requests'),
  sendRequest: (friendId) => api.post('/meetup/request', { friendId }),
  respondToRequest: (requestId, accepted) =>
    api.post('/meetup/respond', { requestId, accepted }),
};

export default api;
