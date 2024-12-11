import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { styled } from "nativewind";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledLinearGradient = styled(LinearGradient);

const WorkoutDetailPage = () => {
  const router = useRouter(); // Back navigation
  const workout = JSON.parse(useLocalSearchParams().workout);

  const { workoutId, name, category, duration, difficulty, caloriesBurned } = workout;

  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState([]);
  const [isWorkoutAdded, setIsWorkoutAdded] = useState(false);
  const [isAddingWorkout, setIsAddingWorkout] = useState(false);
  const [isExerciseAdding, setIsExerciseAdding] = useState(false);

  const fetchExercises = async () => {
    const authToken = await AsyncStorage.getItem("userToken");

    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/exercise/workout/${workoutId}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setExercises(response.data.exercises || []);
    } catch (error) {
      Alert.alert("Error", "Could not fetch exercises");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const checkWorkoutAdded = async () => {
    try {
      const authToken = await AsyncStorage.getItem("userToken");
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/workout/userAlreadyHaveWorkout/${workoutId}`,
        { headers: { Authorization: `Bearer ${authToken}` }}
      );

      console.log(response.data);

      setIsWorkoutAdded(response.data.userAlreadyHaveWorkout);
    } catch (error) {
      console.error(error);
    }
  };

  const addWorkoutToPlan = async () => {
    setIsAddingWorkout(true);
    try {
      const authToken = await AsyncStorage.getItem("userToken");
      await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/workout/addUserToWorkoutPlan/${workoutId}`,
        {},  // Empty body since we're passing workoutId in URL
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      
      setIsWorkoutAdded(true);
      Alert.alert(
        "Success", 
        "Workout has been added to your plan successfully!"
      );
    } catch (error) {
      Alert.alert(
        "Error", 
        error.response?.data?.message || "Failed to add workout to plan"
      );
      console.error(error);
    } finally {
      setIsAddingWorkout(false);
    }
  };

  const addExerciseToPlan = async (exerciseId) => {
    setIsExerciseAdding(true);
    try {
      const authToken = await AsyncStorage.getItem("userToken");
      await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/exercise/add`,
        { exerciseId },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
    } catch (error) {
      Alert.alert("Error", "Failed to add exercise to plan");
      console.error(error);
    } finally {
      setIsExerciseAdding(false);
    }
  };

  useEffect(() => {
    fetchExercises();
    checkWorkoutAdded();
  }, []);

  const getWorkoutGradient = (category) => {
    switch (category.toLowerCase()) {
      case 'cardio':
        return ['#FF6B6B', '#845EC2'];
      case 'strength':
        return ['#4D8076', '#2C73D2'];
      case 'yoga':
        return ['#FF9671', '#845EC2'];
      case 'hiit':
        return ['#F9F871', '#FF9671'];
      default:
        return ['#4F46E5', '#302F4E'];
    }
  };

  const getWorkoutIcon = (category) => {
    switch (category.toLowerCase()) {
      case 'cardio':
        return 'bicycle';
      case 'strength':
        return 'barbell';
      case 'yoga':
        return 'body';
      case 'hiit':
        return 'flash';
      default:
        return 'fitness';
    }
  };

  if (loading) {
    return (
      <StyledView className="flex-1 bg-[#0F0F14] items-center justify-center">
        <ActivityIndicator size="large" color="#4F46E5" />
      </StyledView>
    );
  }

  return (
    <StyledView className="flex-1 bg-[#0F0F14]">
      <StatusBar barStyle="light-content" />
      <SafeAreaView className="flex-1">
        <ScrollView className="flex-1" bounces={false}>
          {/* Hero Section with Gradient Background */}
          <StyledLinearGradient
            colors={getWorkoutGradient(category)}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="h-[300px] relative"
          >
            <LinearGradient
              colors={['rgba(15, 15, 20, 0)', 'rgba(15, 15, 20, 0.8)', 'rgba(15, 15, 20, 1)']}
              className="h-full p-6 justify-end"
            >
              {/* Back Button */}
              <StyledTouchableOpacity
                className="absolute top-12 left-4 bg-black/30 p-2 rounded-full"
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              </StyledTouchableOpacity>

              {/* Category Icon */}
              <StyledView className="absolute top-1/4 right-6">
                <StyledView className="bg-black/30 p-6 rounded-3xl">
                  <Ionicons 
                    name={getWorkoutIcon(category)} 
                    size={48} 
                    color="#FFFFFF" 
                  />
                </StyledView>
              </StyledView>

              {/* Workout Title and Quick Stats */}
              <StyledText className="text-white text-3xl font-bold mb-2">
                {name}
              </StyledText>
              <StyledView className="flex-row items-center flex-wrap gap-2">
                <StyledView className="bg-black/30 px-3 py-1 rounded-full flex-row items-center">
                  <Ionicons name="time-outline" size={16} color="#FFFFFF" />
                  <StyledText className="text-white ml-1">{duration} min</StyledText>
                </StyledView>
                <StyledView className={`px-3 py-1 rounded-full flex-row items-center bg-black/30`}>
                  <Ionicons name="fitness-outline" size={16} color="#FFFFFF" />
                  <StyledText className="text-white ml-1">{difficulty}</StyledText>
                </StyledView>
                <StyledView className="bg-black/30 px-3 py-1 rounded-full flex-row items-center">
                  <Ionicons name="flame-outline" size={16} color="#FFFFFF" />
                  <StyledText className="text-white ml-1">{caloriesBurned} cal</StyledText>
                </StyledView>
              </StyledView>
            </LinearGradient>
          </StyledLinearGradient>

          {/* Main Content */}
          <StyledView className="px-4 -mt-6">
            {/* Add to Plan Button */}
            {!isWorkoutAdded ? (
              <StyledTouchableOpacity
                onPress={addWorkoutToPlan}
                disabled={isAddingWorkout}
                className="bg-[#4F46E5] p-4 rounded-2xl mb-6 shadow-lg"
              >
                <StyledView className="flex-row items-center justify-center">
                  <Ionicons name="add-circle-outline" size={24} color="white" />
                  <StyledText className="text-white font-bold text-lg ml-2">
                    {isAddingWorkout ? "Adding to Plan..." : "Add to My Plan"}
                  </StyledText>
                </StyledView>
              </StyledTouchableOpacity>
            ) : (
              <StyledView className="bg-[#2C2C3E] p-4 rounded-2xl mb-6 flex-row items-center justify-center">
                <Ionicons name="checkmark-circle" size={24} color="#4F46E5" />
                <StyledText className="text-[#4F46E5] font-bold text-lg ml-2">
                  Already Added to Your Plan
                </StyledText>
              </StyledView>
            )}

            {/* Log Workout Button */}
            <StyledTouchableOpacity
              onPress={() => router.push({
                pathname: "/log-workout",
                params: { workout: JSON.stringify(workout) }
              })}
              className="bg-[#4F46E5] p-4 rounded-2xl mb-6 shadow-lg"
            >
              <StyledView className="flex-row items-center justify-center">
                <Ionicons name="clipboard-outline" size={24} color="white" />
                <StyledText className="text-white font-bold text-lg ml-2">
                  Log Workout
                </StyledText>
              </StyledView>
            </StyledTouchableOpacity>

            {/* Exercises Section */}
            <StyledText className="text-white text-xl font-bold mb-4">
              Workout Exercises
            </StyledText>
            
            {exercises.map((exercise, index) => (
              <StyledView 
                key={exercise.exercise_id} 
                className="bg-[#1F1F28] rounded-2xl mb-4 overflow-hidden"
              >
                <StyledView className="p-4">
                  <StyledView className="flex-row justify-between items-center mb-3">
                    <StyledView className="flex-row items-center flex-1">
                      <StyledView className="bg-[#4F46E5]/20 w-10 h-10 rounded-full items-center justify-center mr-3">
                        <StyledText className="text-[#4F46E5] font-bold">
                          {index + 1}
                        </StyledText>
                      </StyledView>
                      <StyledView className="flex-1">
                        <StyledText className="text-white text-lg font-semibold">
                          {exercise.name}
                        </StyledText>
                        <StyledText className="text-[#9CA3AF] text-sm">
                          {exercise.muscle_group}
                        </StyledText>
                      </StyledView>
                    </StyledView>
                    <StyledView className="bg-[#2C2C3E] px-3 py-1 rounded-full">
                      <StyledText className="text-[#9CA3AF]">
                        {exercise.sets} × {exercise.reps}
                      </StyledText>
                    </StyledView>
                  </StyledView>
                </StyledView>
              </StyledView>
            ))}
          </StyledView>
        </ScrollView>
      </SafeAreaView>
    </StyledView>
  );
};

export default WorkoutDetailPage;
