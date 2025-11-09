require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const friendRoutes = require('./routes/friends');
const locationRoutes = require('./routes/location');
const meetupRoutes = require('./routes/meetup');

const { authenticateSocket } = require('./middleware/auth');
const LocationService = require('./services/LocationService');
const NotificationService = require('./services/NotificationService');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/meetup', meetupRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Initialize services
const locationService = new LocationService(io);
const notificationService = new NotificationService(io);

// Socket.io connection handling
io.use(authenticateSocket);

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId}`);

  // Join user to their personal room
  socket.join(`user:${socket.userId}`);

  // Handle location updates
  socket.on('location:update', (locationData) => {
    locationService.updateUserLocation(socket.userId, locationData);
  });

  // Handle meetup requests
  socket.on('meetup:request', (data) => {
    io.to(`user:${data.friendId}`).emit('meetup:request', {
      fromUserId: socket.userId,
      fromUsername: data.fromUsername,
      timestamp: new Date().toISOString()
    });
  });

  // Handle meetup responses
  socket.on('meetup:response', (data) => {
    io.to(`user:${data.toUserId}`).emit('meetup:response', {
      fromUserId: socket.userId,
      accepted: data.accepted,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`);
    locationService.removeUserLocation(socket.userId);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, server, io };
