import { View, Text, TouchableOpacity, Alert } from 'react-native';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

const profile = ({ navigation }) => {
  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          onPress: async () => {
            try {
              // Remove the user token from AsyncStorage
              await AsyncStorage.removeItem('userToken');
              console.log("User token removed, logging out...");
              // Navigate to the Login screen (or replace current screen)
              router.replace('Login');
            } catch (error) {
              console.error("Error during logout:", error);
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 justify-center items-center bg-gray-100">
      <Text className="text-2xl font-bold mb-5">Profile</Text>
      <TouchableOpacity
        className="bg-purple-600 px-6 py-3 rounded-lg"
        onPress={handleLogout}
      >
        <Text className="text-white text-base font-medium">Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default profile;
