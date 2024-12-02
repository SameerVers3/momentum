import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../constants/api';

const WorkoutDetails = () => {
  const { workoutId, source } = useLocalSearchParams();
  const [workout, setWorkout] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);

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
    const fetchWorkoutDetails = async () => {
      try {
        const [workoutResponse, exercisesResponse] = await Promise.all([
          axios.get(`${BASE_URL}/workout/${workoutId}`),
          axios.get(`${BASE_URL}/workout/${workoutId}/exercises`)
        ]);
        
        setWorkout(workoutResponse.data);
        setExercises(exercisesResponse.data);
      } catch (error) {
        console.error('Error fetching workout details:', error);
        Alert.alert('Error', 'Failed to load workout details');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutDetails();
  }, [workoutId]);

  const handleAddWorkout = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/addUserWorkout`, {
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

  if (loading) {
    return (
      <SafeAreaView className="bg-gray-900 flex-1">
        <View className="flex-1 justify-center items-center">
          <Text className="text-white text-lg">Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!workout) {
    return (
      <SafeAreaView className="bg-gray-900 flex-1">
        <View className="flex-1 justify-center items-center">
          <Text className="text-white text-lg">Workout not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-gray-900 flex-1">
      <ScrollView className="p-4">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-white text-3xl font-bold mb-2">
            {workout.name}
          </Text>
          <View className="flex-row space-x-4">
            <Text className="text-gray-300">
              Duration: {workout.duration} mins
            </Text>
            <Text className="text-gray-300">
              Difficulty: {workout.difficulty}
            </Text>
          </View>
        </View>

        {/* Calories and Details */}
        <View className="bg-purple-900 rounded-xl p-4 mb-6">
          <Text className="text-white text-lg font-semibold mb-2">
            Calories Burned
          </Text>
          <Text className="text-gray-300 text-2xl font-bold">
            {workout.calories_burned} kcal
          </Text>
        </View>

        {/* Exercises */}
        <View className="bg-purple-900 rounded-xl p-4 mb-6">
          <Text className="text-white text-lg font-semibold mb-3">
            Exercises
          </Text>
          {exercises.map((exercise, index) => (
            <View key={exercise.exercise_id} className="mb-4 border-b border-purple-800 pb-4">
              <Text className="text-white text-lg font-semibold">
                {index + 1}. {exercise.name}
              </Text>
              <View className="flex-row space-x-4 mt-2">
                <Text className="text-gray-300">Sets: {exercise.sets}</Text>
                <Text className="text-gray-300">Reps: {exercise.reps}</Text>
                <Text className="text-gray-300">Rest: {exercise.rest_time}s</Text>
              </View>
              <Text className="text-gray-300 mt-2">
                Muscle Group: {exercise.muscle_group}
              </Text>
              <Text className="text-gray-300 mt-2">
                {exercise.instructions}
              </Text>
            </View>
          ))}
        </View>

        {/* Instructions */}
        <View className="bg-purple-900 rounded-xl p-4 mb-6">
          <Text className="text-white text-lg font-semibold mb-3">
            Instructions
          </Text>
          <Text className="text-gray-300 leading-6">
            {workout.instructions}
          </Text>
        </View>

        {/* Action Buttons - Only show if not coming from view-workouts */}
        {source !== 'view-workouts' && (
          <View className="flex-row space-x-4 mb-6">
            <TouchableOpacity
              className="bg-purple-600 rounded-xl py-3 flex-1"
              onPress={handleAddWorkout}
            >
              <Text className="text-white text-center font-semibold">
                Add to My Workouts
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default WorkoutDetails;