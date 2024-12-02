import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';
import { BASE_URL } from '../../constants/api';

const AddWorkouts = () => {
  const [workouts, setWorkouts] = useState([]);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const getUserEmail = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          setUserEmail(user.email);
        }
      } catch (error) {
        console.error('Error fetching user email:', error);
      }
    };
    getUserEmail();
  }, []);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/getworkouts`);
        setWorkouts(response.data);
      } catch (error) {
        console.error('Error fetching workouts:', error);
        Alert.alert('Error', 'Failed to load workouts');
      }
    };
    fetchWorkouts();
  }, []);

  const handleAddWorkout = async (workoutId) => {
    try {
      const response = await axios.post('http://192.168.1.107:3000/addUserWorkout', {
        email: userEmail,
        workout_id: workoutId
      });

      if (response.data.success) {
        Alert.alert('Success', 'Workout added to your list!');
      } else {
        Alert.alert('Error', 'Failed to add workout');
      }
    } catch (error) {
      console.error('Error adding workout:', error);
      Alert.alert('Error', 'Failed to add workout to your list');
    }
  };

  const handleViewDetails = (workout) => {
    router.push({
      pathname: '/workout-details',
      params: { 
        workoutId: workout.workout_id,
        source: 'add-workouts'
      }
    });
  };

  const WorkoutCard = ({ workout }) => (
    <View className="bg-purple-900 rounded-xl p-4 mb-4">
      <View>
        <Text className="text-white text-xl font-bold mb-1">
          {workout.name}
        </Text>
        <Text className="text-gray-300 mb-3">
          {workout.duration} mins | {workout.difficulty}
        </Text>
      </View>

      <View className="flex-row justify-between mt-2">
        <TouchableOpacity
          className="bg-purple-700 px-4 py-2 rounded-lg flex-1 mr-2"
          onPress={() => handleViewDetails(workout)}
        >
          <Text className="text-white font-semibold text-center">View Details</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-purple-600 px-4 py-2 rounded-lg flex-1 ml-2"
          onPress={() => handleAddWorkout(workout.workout_id)}
        >
          <Text className="text-white font-semibold text-center">Add Workout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="bg-gray-900 flex-1">
      <View className="p-4">
        <Text className="text-white text-2xl font-bold mb-6">
          Available Workouts
        </Text>
        
        <ScrollView showsVerticalScrollIndicator={false}>
          {workouts.map((workout) => (
            <WorkoutCard key={workout.workout_id} workout={workout} />
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default AddWorkouts;