import { View, Text, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

const Home = () => {
  const [username, setUsername] = useState('');

  const navigate2ViewWorkouts = () => {
    router.push('/manage-workouts');
  };

  const navigate2SearchExercise = () => {
    router.push('/search-exercise');
  };

  const handleLogout = async () => {
    try {
      // Clear user data from AsyncStorage
      await AsyncStorage.removeItem('user');
      // Navigate to the login screen
      router.replace('/sign-in'); // Use replace to prevent navigating back to Home
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  // Fetch username from email stored in AsyncStorage
  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          // Extract username from email
          const email = user.email || '';
          const extractedUsername = email.split('@')[0];
          setUsername(extractedUsername || 'Guest');
        } else {
          setUsername('Guest');
        }
      } catch (error) {
        console.error('Failed to fetch username:', error);
        setUsername('Guest');
      }
    };

    fetchUsername();
  }, []);

  return (
    <SafeAreaView className="bg-gray-900 h-full p-4">
      {/* Welcome Section */}
      <View className="flex flex-row justify-between items-center mb-4">
        <Text className="text-white text-3xl font-semibold">Welcome Back,</Text>
        <TouchableOpacity className="p-2 bg-gray-800 rounded-full">
          {/* Notification Icon */}
        </TouchableOpacity>
      </View>

      {/* Display Username */}
      <Text className="text-white text-4xl font-bold mb-4">{username}</Text>

      {/* Logout Button */}
      <TouchableOpacity
        className="bg-red-700 rounded-xl px-4 py-2 mb-10 mx-auto"
        onPress={handleLogout}
      >
        <Text className="text-white text-sm font-semibold text-center">Log Out</Text>
      </TouchableOpacity>

      {/* Banner */}
      <View className="flex flex-col justify-start gap-10 h-full">
        <View className="bg-purple-700 rounded-2xl p-4 mt-4">
          <Text className="text-white text-2xl font-semibold text-center">
            Manage Workouts
          </Text>

          <View className="flex-row items-center justify-between mt-4">
            {/* View More Button */}
            <TouchableOpacity
              className="bg-purple-800 rounded-xl px-4 py-2 mx-auto"
              onPress={navigate2ViewWorkouts}
            >
              <Text className="text-white text-sm font-semibold">View More</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="bg-purple-700 rounded-2xl p-4 mt-6">
          <Text className="text-white text-2xl font-semibold text-center">
            Search Exercise
          </Text>

          <View className="flex-row items-center justify-between mt-4">
            {/* View More Button */}
            <TouchableOpacity
              className="bg-purple-800 rounded-xl px-4 py-2 mx-auto"
              onPress={navigate2SearchExercise}
            >
              <Text className="text-white text-sm font-semibold">View More</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Home;
