import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';
import { BASE_URL } from '../../constants/api';


const ViewWorkouts = () => {
  const [userWorkouts, setUserWorkouts] = useState([]);
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

  const fetchUserWorkouts = async () => {
    if (!userEmail) return;
    
    try {
      const workoutsResponse = await axios.post(`${BASE_URL}/getUserWorkouts`, {
        email: userEmail
      });

      const workoutPromises = workoutsResponse.data.map(userWorkout =>
        axios.get(`${BASE_URL}/workout/${userWorkout.workout_id}`)
      );

      const workoutDetails = await Promise.all(workoutPromises);
      const fullWorkoutData = workoutDetails.map(response => response.data);
      
      setUserWorkouts(fullWorkoutData);
    } catch (error) {
      console.error('Error fetching user workouts:', error);
      Alert.alert('Error', 'Failed to load your workouts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userEmail) {
      fetchUserWorkouts();
    }
  }, [userEmail]);

  const handleViewDetails = (workout) => {
    router.push({
      pathname: '/workout-details',
      params: { 
        workoutId: workout.workout_id,
        source: 'view-workouts'
      }
    });
  };

  const handleDeleteWorkout = async (workoutId) => {
    Alert.alert(
      "Delete Workout",
      "Are you sure you want to remove this workout from your list?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true); // Show loading state while deleting
              
              const response = await axios({
                method: 'delete',
                url: `${BASE_URL}/deleteWorkout/${workoutId}`,
                data: { email: userEmail }
              });

              if (response.data.success) {
                // Update the local state by removing the deleted workout
                setUserWorkouts(prevWorkouts => 
                  prevWorkouts.filter(workout => workout.workout_id !== workoutId)
                );
                Alert.alert('Success', 'Workout removed from your list');
              } else {
                throw new Error(response.data.message || 'Failed to delete workout');
              }
            } catch (error) {
              console.error('Error deleting workout:', error);
              Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to delete workout'
              );
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
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
          className="bg-red-600 px-4 py-2 rounded-lg flex-1 ml-2"
          onPress={() => handleDeleteWorkout(workout.workout_id)}
          disabled={loading}
        >
          <Text className="text-white font-semibold text-center">
            {loading ? 'Removing...' : 'Remove'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="bg-gray-900 flex-1">
        <View className="flex-1 justify-center items-center">
          <Text className="text-white text-lg">Loading your workouts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-gray-900 flex-1">
      <View className="p-4">
        <Text className="text-white text-2xl font-bold mb-6">
          My Workouts
        </Text>
        
        <ScrollView showsVerticalScrollIndicator={false}>
          {userWorkouts.length > 0 ? (
            userWorkouts.map((workout) => (
              <WorkoutCard key={workout.workout_id} workout={workout} />
            ))
          ) : (
            <View className="flex-1 justify-center items-center mt-10">
              <Text className="text-gray-400 text-lg text-center">
                You haven't added any workouts yet.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default ViewWorkouts;