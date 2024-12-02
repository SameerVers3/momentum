import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, SafeAreaView, Dimensions, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import Async Storage
import images from '../../constants/images';
import { router } from 'expo-router';
import axios from 'axios'; // Import Axios for API requests
import { BASE_URL } from '../../constants/api';

const { width } = Dimensions.get('window');

const GoalSelectionScreen = () => {
  const scrollViewRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isScrolling, setIsScrolling] = useState(false);

  const originalGoals = [
    {
      title: 'Improve Shape',
      description: 'I have a low amount of body fat and need / want to build more muscle',
      image: images.improveShape,
    },
    {
      title: 'Lean & Tone',
      description: 'Im "skinny fat", look thin but have no shape. I want to add lean muscle in the right way',
      image: images.leanAndTone,
    },
    {
      title: 'Lose Fat',
      description: 'I have over 20 lbs to lose. I want to drop all this fat and gain muscle mass',
      image: images.loseFat,
    },
  ];

  const goals = [
    originalGoals[originalGoals.length - 1],
    ...originalGoals,
    originalGoals[0]
  ];

  useEffect(() => {
    scrollViewRef.current?.scrollTo({
      x: width,
      animated: false
    });
  }, []);

  const handleScroll = (event) => {
    if (isScrolling) return;

    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / width);

    if (newIndex === goals.length - 1) {
      setIsScrolling(true);
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: width,
          animated: false
        });
        setCurrentIndex(1);
        setIsScrolling(false);
      }, 10);
    } else if (newIndex === 0) {
      setIsScrolling(true);
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: width * (goals.length - 2),
          animated: false
        });
        setCurrentIndex(goals.length - 2);
        setIsScrolling(false);
      }, 10);
    } else {
      setCurrentIndex(newIndex);
    }
  };

  const handleContinue = async () => {
    const selectedGoal = originalGoals[currentIndex - 1].title;
  
    try {
      // Retrieve the existing user object from AsyncStorage
      const userData = await AsyncStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : {};
  
      // Append the selected goal to the user object
      const updatedUser = {
        ...user,
        goal: selectedGoal, // Add or update the goal property
      };
  
      // Save the updated user object back to AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
  
      // Prepare the profile data for the API
      const profileData = {
        email: updatedUser.email || '', // Ensure email is included
        date_of_birth: updatedUser.dateOfBirth || '',
        gender: updatedUser.gender || '',
        weight: updatedUser.weight || 0,
        height: updatedUser.height || 0,
        goal: selectedGoal,
      };
  
      // Call the API
      const response = await axios.post(`${BASE_URL}/adduserprofile`, profileData);
  
      if (response.data.success) {
        console.log('User profile saved successfully:', response.data);
        Alert.alert('Success', 'Your profile has been updated.');
  
        // Navigate to the next screen
        router.replace('/welcome');
      } else {
        Alert.alert('Error', response.data.message || 'Failed to save profile.');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'An error occurred while saving your profile.');
    }
  };
  

  const renderGoalCard = (goal, index) => (
    <View 
      key={index} 
      style={{ width: width - 32 }} 
      className="bg-purple-600 rounded-xl mx-4 p-6 items-center"
    >
      <View className="items-center">
        <Image 
          source={goal.image} 
          className="w-48 h-48 mb-6" 
          resizeMode="contain" 
        />
        <Text className="text-white text-2xl font-bold mb-3">
          {goal.title}
        </Text>
        <Text className="text-gray-200 text-center text-lg leading-6">
          {goal.description}
        </Text>
      </View>
    </View>
  );

  const renderPageIndicator = () => (
    <View className="flex-row justify-center space-x-2 mb-6">
      {originalGoals.map((_, index) => (
        <View
          key={index}
          className={`rounded-full h-2 w-2 ${
            currentIndex - 1 === index ? 'bg-white w-4' : 'bg-gray-400'
          }`}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 pt-8 pb-4">
          <Text className="text-white text-3xl font-bold text-center">
            What's your goal?
          </Text>
          <Text className="text-gray-300 text-lg text-center mt-3">
            Select your fitness goal to get a personalized program
          </Text>
        </View>

        {/* Scrollable Cards */}
        <View className="flex-1 justify-center">
          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            snapToInterval={width}
            decelerationRate="fast"
            onMomentumScrollEnd={handleScroll}
            scrollEventThrottle={16}
            contentContainerStyle={{ paddingVertical: 20 }}
          >
            {goals.map(renderGoalCard)}
          </ScrollView>
        </View>

        {/* Bottom Section */}
        <View className="px-6 pb-8">
          {renderPageIndicator()}
          <TouchableOpacity
            className="bg-white py-4 rounded-full w-full"
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text className="text-purple-600 text-xl font-bold text-center">
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default GoalSelectionScreen;
