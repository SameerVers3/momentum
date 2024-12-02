// config/api.js

import { Platform } from 'react-native';

// Get the local IP address for development
const getLocalIP = () => {
  // Use localhost for iOS simulator
  if (Platform.OS === 'ios') {
    return 'localhost';
  }
  
  // For Android emulator
  return '10.0.2.2';
};

// For real devices, you'll need to use your computer's local network IP
// You can set this manually or use environment variables
const DEV_MACHINE_IP = '192.168.1.107'; // Your development machine's IP

export const BASE_URL = __DEV__ 
  ? Platform.select({
      // Use localhost for iOS simulator
      ios: `http://localhost:3000`,
      // Use 10.0.2.2 for Android emulator (this is the special IP that points to host machine's localhost)
      android: `http://${DEV_MACHINE_IP}:3000`,
    })
  : 'https://your-production-api.com'; // Your production API URL

export default {
  BASE_URL,
};