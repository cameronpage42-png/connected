# Nearby Friends Meetup App

A mobile application that notifies you when your friends are nearby, allowing you to easily coordinate face-to-face meetups. The app uses location tracking and cell tower proximity detection to find friends in your vicinity.

## Features

- **Real-time Location Tracking**: Share your location with friends automatically
- **Proximity Detection**: Get notified when friends are within 500 meters or connected to the same cell tower
- **Friend Management**: Add and manage your friend list
- **Meetup Requests**: Send and receive "Want to Meet" requests when friends are nearby
- **Live Map View**: See nearby friends on an interactive map
- **Push Notifications**: Receive alerts when friends come nearby
- **Real-time Updates**: Socket.io-based real-time communication

## Tech Stack

### Mobile App
- **React Native** with Expo
- **React Navigation** for routing
- **Socket.io Client** for real-time communication
- **Expo Location** for GPS tracking
- **Expo Notifications** for push notifications
- **React Native Maps** for map visualization

### Backend Server
- **Node.js** with Express
- **Socket.io** for real-time communication
- **JWT** for authentication
- **bcryptjs** for password hashing
- **geolib** for distance calculations

## Project Structure

```
nearby-friends-meetup/
├── mobile/                 # React Native mobile app
│   ├── src/
│   │   ├── context/       # React contexts (Auth, Location, Notification)
│   │   ├── navigation/    # Navigation setup
│   │   ├── screens/       # App screens
│   │   └── services/      # API and Socket services
│   ├── App.js
│   ├── app.json
│   └── package.json
├── server/                # Node.js backend server
│   ├── src/
│   │   ├── middleware/   # Authentication middleware
│   │   ├── models/       # Data models (in-memory database)
│   │   ├── routes/       # API routes
│   │   └── services/     # Business logic services
│   ├── .env.example
│   └── package.json
├── package.json          # Root package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator or Android Emulator (or physical device with Expo Go app)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd connected
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```
   Or manually:
   ```bash
   npm install
   cd server && npm install
   cd ../mobile && npm install
   cd ..
   ```

3. **Configure environment variables**

   For the server:
   ```bash
   cd server
   cp .env.example .env
   ```
   Edit `server/.env` and set your configuration:
   ```
   PORT=3000
   JWT_SECRET=your-secret-key-change-this-in-production
   NODE_ENV=development
   PROXIMITY_THRESHOLD_METERS=500
   ```

   For the mobile app:
   ```bash
   cd mobile
   cp .env.example .env
   ```
   Edit `mobile/.env` and set your server URL:
   ```
   API_URL=http://YOUR_LOCAL_IP:3000
   SOCKET_URL=http://YOUR_LOCAL_IP:3000
   ```
   **Important**: Replace `YOUR_LOCAL_IP` with your computer's local IP address (not localhost) so the mobile app can connect to the server.

### Running the Application

#### Start the Backend Server

```bash
cd server
npm run dev
```

The server will start on `http://localhost:3000`

#### Start the Mobile App

In a new terminal:

```bash
cd mobile
npm start
```

This will start the Expo development server. You can then:
- Press `i` to open iOS simulator
- Press `a` to open Android emulator
- Scan the QR code with the Expo Go app on your physical device

## Usage

### 1. Create an Account

- Open the app
- Tap "Register"
- Enter a username and password
- Tap "Register" to create your account

### 2. Add Friends

- Navigate to the "Friends" tab
- Tap the "+" icon
- Search for friends by username
- Tap "Add" to add them to your friend list

### 3. Enable Location Tracking

- Go to the "Profile" tab
- Toggle "Location Tracking" ON
- Grant location permissions when prompted

### 4. See Nearby Friends

- When a friend who has you added comes within 500 meters (or connects to the same cell tower), you'll both receive a notification
- View nearby friends on the "Home" tab
- See their locations on the "Map" tab

### 5. Send Meetup Requests

- On the "Home" tab, you'll see all nearby friends
- Tap the "Want to Meet" button next to a friend's name
- They'll receive a notification with your meetup request
- They can accept or decline the request

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/me` - Get current user profile
- `GET /api/users/search?q=username` - Search users

### Friends
- `GET /api/friends` - Get friend list
- `POST /api/friends/add` - Add a friend
- `DELETE /api/friends/:friendId` - Remove a friend

### Location
- `POST /api/location/update` - Update user location
- `GET /api/location/me` - Get current user location

### Meetup
- `GET /api/meetup/requests` - Get meetup requests
- `POST /api/meetup/request` - Send meetup request
- `POST /api/meetup/respond` - Respond to meetup request

## Socket Events

### Client to Server
- `location:update` - Send location update
- `meetup:request` - Send meetup request
- `meetup:response` - Respond to meetup request

### Server to Client
- `friend:nearby` - Friend is nearby notification
- `meetup:request` - Meetup request received
- `meetup:response` - Meetup response received
- `notification` - General notification

## Configuration

### Proximity Threshold

The default proximity threshold is 500 meters. To change this, update the `PROXIMITY_THRESHOLD_METERS` in `server/.env`:

```
PROXIMITY_THRESHOLD_METERS=1000  # 1 kilometer
```

### Location Update Frequency

Location updates are sent every 10 seconds or when the user moves 50 meters. To change this, edit `mobile/src/context/LocationContext.js`:

```javascript
Location.watchPositionAsync({
  accuracy: Location.Accuracy.Balanced,
  timeInterval: 10000,    // Update every 10 seconds
  distanceInterval: 50,   // Or when moved 50 meters
}, ...)
```

## Security Considerations

**Important**: This is a development/demo version. For production use:

1. Replace the in-memory database with a real database (PostgreSQL, MongoDB, etc.)
2. Use a strong, unique JWT secret
3. Implement HTTPS/WSS for secure communication
4. Add rate limiting to prevent abuse
5. Implement proper input validation and sanitization
6. Add user email verification
7. Implement password reset functionality
8. Add privacy controls (e.g., who can see your location)
9. Consider implementing end-to-end encryption for sensitive data
10. Add logging and monitoring

## Privacy

- Location data is only shared with friends you've added
- Location data is stored temporarily while you're using the app
- You can disable location tracking at any time in the Profile tab
- Removing a friend will stop sharing your location with them

## Troubleshooting

### Mobile app can't connect to server

1. Make sure both devices are on the same network
2. Use your computer's local IP address (not localhost) in the mobile app's .env file
3. Check that the server is running and accessible
4. Disable any firewalls that might be blocking the connection

### Location not updating

1. Make sure location permissions are granted
2. Check that Location Tracking is enabled in the Profile tab
3. Ensure GPS is enabled on your device
4. Try restarting the app

### Notifications not working

1. Grant notification permissions when prompted
2. Check device notification settings
3. Ensure the app is running in the foreground or background

## Future Enhancements

- [ ] Add chat messaging between friends
- [ ] Implement geofencing for custom proximity zones
- [ ] Add support for group meetups
- [ ] Location history and analytics
- [ ] Integration with calendar apps
- [ ] Custom notification preferences
- [ ] Dark mode support
- [ ] Multi-language support

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
