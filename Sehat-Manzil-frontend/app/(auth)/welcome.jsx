import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { images } from '../../constants';
import { router } from 'expo-router';

const WelcomeScreen = ({ route }) => {
  // Get the name from route params, or use a default value
  const { name = 'Stefani' } = route?.params || {};

  return (
    <SafeAreaView className="flex-1 bg-background">

      {/* Main Content */}
      <View className="flex-1 justify-center items-center px-6">

        <View >
          {/* Illustration */}
          <Image
            source={images.welcome} // Make sure to add this image to your assets
            className="w-64 h-64 mb-8"
            resizeMode="contain"
            />

          {/* Welcome Text */}
          <View className="items-center">
            <Text className="text-white text-2xl font-bold mb-2">
              Welcome, {name}
            </Text>
            <Text className="text-gray-400 text-center text-base">
              You are all set now, let's reach your{'\n'}goals together with us!
            </Text>
          </View>
        </View>

      </View>
      
      {/* Bottom Button */}
      <View className="p-6">
        <TouchableOpacity
          className="bg-purple-600 py-4 rounded-full w-full"
          activeOpacity={0.8}
          onPress={() => {
            router.replace('/home')
          }}
        >
          <Text className="text-white text-lg font-semibold text-center">
            Go To Home
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default WelcomeScreen;