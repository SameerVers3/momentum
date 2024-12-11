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
  TextInput,
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
const StyledTextInput = styled(TextInput);
const StyledLinearGradient = styled(LinearGradient);
const StyledScrollView = styled(ScrollView);
const StyledSafeAreaView = styled(SafeAreaView);

const LogWorkoutScreen = () => {
  const router = useRouter();
  const workout = JSON.parse(useLocalSearchParams().workout);
  
  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState([]);
  const [duration, setDuration] = useState("");
  const [caloriesBurned, setCaloriesBurned] = useState("");
  const [notes, setNotes] = useState("");
  const [exerciseLogs, setExerciseLogs] = useState({});
  const [isLogging, setIsLogging] = useState(false);

  // Fetch exercises for this workout
  const fetchExercises = async () => {
    try {
      const authToken = await AsyncStorage.getItem("userToken");
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/exercise/workout/${workout.workout_id}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      console.log("hhehehehehehehehhehehehehe");
      console.log(response.data);
      setExercises(response.data.exercises || []);
      
      // Initialize exercise logs
      const logs = {};
      response.data.exercises.forEach(exercise => {
        logs[exercise.exercise_id] = {
          sets_completed: "",
          reps_performed: "",
          weight_used: "",
          notes: ""
        };
      });
      setExerciseLogs(logs);
    } catch (error) {
      Alert.alert("Error", "Could not fetch exercises");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const logWorkout = async () => {
    setIsLogging(true);
    try {
      const authToken = await AsyncStorage.getItem("userToken");
      
      // First log the workout
      const workoutResponse = await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/workout/logWorkout/${workout.workout_id}`,
        {
          duration: Number(duration),
          calories_burned: Number(caloriesBurned),
          notes: notes,
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      // Then log each exercise
      const exerciseLogsArray = exercises.map(exercise => ({
        exercise_id: exercise.exercise_id,
        ...exerciseLogs[exercise.exercise_id],
        sets_completed: Number(exerciseLogs[exercise.exercise_id].sets_completed),
        reps_performed: Number(exerciseLogs[exercise.exercise_id].reps_performed),
        weight_used: exerciseLogs[exercise.exercise_id].weight_used ? 
          Number(exerciseLogs[exercise.exercise_id].weight_used) : null
      }));

      const response =await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/exercise/logExercise/${workoutResponse.data.workoutLog.id}`,
        { exercises: exerciseLogsArray },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      console.log("response", response.data);

      console.log("exerciseLogsArray", exerciseLogsArray);

      Alert.alert("Success", "Workout logged successfully!");
      router.back();
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Failed to log workout");
      console.error(error);
    } finally {
      setIsLogging(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

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
      <StyledSafeAreaView className="flex-1">
        <StyledScrollView 
          className="flex-1"
          showsVerticalScrollIndicator={false}
        >
          {/* Enhanced Header with Parallax Effect */}
          <StyledLinearGradient
            colors={['#4F46E5', '#302F4E']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="h-[200px] relative"
          >
            <LinearGradient
              colors={['rgba(15, 15, 20, 0)', 'rgba(15, 15, 20, 0.9)', 'rgba(15, 15, 20, 1)']}
              className="h-full px-6 pb-8 justify-end"
            >
              <StyledView className="flex-row items-center justify-between mb-4">
                <StyledTouchableOpacity
                  onPress={() => router.back()}
                  className="bg-black/30 p-2 rounded-full"
                >
                  <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </StyledTouchableOpacity>
                <StyledView className="bg-black/30 px-3 py-1 rounded-full">
                  <StyledText className="text-white">
                    {new Date().toLocaleDateString()}
                  </StyledText>
                </StyledView>
              </StyledView>
              <StyledView>
                <StyledText className="text-white text-3xl font-bold">
                  Log Workout
                </StyledText>
                <StyledText className="text-gray-400 text-lg">
                  Track your fitness journey
                </StyledText>
              </StyledView>
            </LinearGradient>
          </StyledLinearGradient>

          {/* Main Content with Enhanced Cards */}
          <StyledView className="px-4 -mt-6">
            {/* Workout Summary Card with Glowing Effect */}
            <StyledView className="bg-[#1F1F28] rounded-3xl p-6 mb-6 shadow-lg border border-[#4F46E5]/10">
              <StyledView className="flex-row items-center mb-6">
                <StyledView className="bg-[#4F46E5]/20 w-14 h-14 rounded-2xl items-center justify-center mr-4">
                  <Ionicons name="barbell-outline" size={28} color="#4F46E5" />
                </StyledView>
                <StyledView className="flex-1">
                  <StyledText className="text-white text-xl font-bold">
                    {workout.name}
                  </StyledText>
                  <StyledView className="flex-row items-center mt-1">
                    <StyledView className="bg-[#4F46E5]/20 px-3 py-1 rounded-full mr-2">
                      <StyledText className="text-[#4F46E5]">
                        {workout.category}
                      </StyledText>
                    </StyledView>
                    <StyledView className="bg-[#2C2C3E] px-3 py-1 rounded-full">
                      <StyledText className="text-gray-400">
                        {workout.difficulty}
                      </StyledText>
                    </StyledView>
                  </StyledView>
                </StyledView>
              </StyledView>

              {/* Enhanced Input Fields */}
              <StyledView className="space-y-4">
                <StyledView>
                  <StyledText className="text-gray-400 mb-2 font-medium">
                    Duration (minutes)
                  </StyledText>
                  <StyledView className="flex-row items-center bg-[#2C2C3E] rounded-2xl p-4 border border-[#4F46E5]/10">
                    <Ionicons name="time-outline" size={22} color="#4F46E5" />
                    <StyledTextInput
                      className="flex-1 text-white ml-3 text-lg"
                      value={duration}
                      onChangeText={setDuration}
                      keyboardType="numeric"
                      placeholderTextColor="#9CA3AF"
                      placeholder="Enter duration"
                    />
                  </StyledView>
                </StyledView>

                <StyledView>
                  <StyledText className="text-gray-400 mb-2 font-medium">
                    Calories Burned
                  </StyledText>
                  <StyledView className="flex-row items-center bg-[#2C2C3E] rounded-2xl p-4 border border-[#4F46E5]/10">
                    <Ionicons name="flame-outline" size={22} color="#4F46E5" />
                    <StyledTextInput
                      className="flex-1 text-white ml-3 text-lg"
                      value={caloriesBurned}
                      onChangeText={setCaloriesBurned}
                      keyboardType="numeric"
                      placeholderTextColor="#9CA3AF"
                      placeholder="Enter calories burned"
                    />
                  </StyledView>
                </StyledView>

                <StyledView>
                  <StyledText className="text-gray-400 mb-2 font-medium">
                    Workout Notes
                  </StyledText>
                  <StyledView className="bg-[#2C2C3E] rounded-2xl p-4 border border-[#4F46E5]/10">
                    <StyledTextInput
                      className="text-white text-base min-h-[80px]"
                      value={notes}
                      onChangeText={setNotes}
                      multiline
                      textAlignVertical="top"
                      placeholderTextColor="#9CA3AF"
                      placeholder="How was your workout? Add notes here..."
                    />
                  </StyledView>
                </StyledView>
              </StyledView>
            </StyledView>

            {/* Exercise Section Header */}
            <StyledView className="flex-row items-center justify-between mb-4">
              <StyledText className="text-white text-xl font-bold">
                Exercise Tracking
              </StyledText>
              <StyledView className="bg-[#2C2C3E] px-3 py-1 rounded-full">
                <StyledText className="text-gray-400">
                  {exercises.length} exercises
                </StyledText>
              </StyledView>
            </StyledView>

            {/* Enhanced Exercise Cards */}
            {exercises.map((exercise, index) => (
              <StyledView 
                key={exercise.exercise_id} 
                className="bg-[#1F1F28] rounded-3xl mb-4 overflow-hidden shadow-lg border border-[#4F46E5]/10"
              >
                <StyledView className="bg-[#2C2C3E] p-5">
                  <StyledView className="flex-row items-center justify-between">
                    <StyledView className="flex-row items-center flex-1">
                      <StyledView className="bg-[#4F46E5]/20 w-12 h-12 rounded-2xl items-center justify-center mr-4">
                        <StyledText className="text-[#4F46E5] font-bold text-lg">
                          {index + 1}
                        </StyledText>
                      </StyledView>
                      <StyledView className="flex-1">
                        <StyledText className="text-white text-lg font-bold">
                          {exercise.name}
                        </StyledText>
                        <StyledView className="flex-row items-center mt-1">
                          <Ionicons name="fitness-outline" size={14} color="#9CA3AF" />
                          <StyledText className="text-gray-400 ml-1">
                            {exercise.muscle_group}
                          </StyledText>
                        </StyledView>
                      </StyledView>
                    </StyledView>
                  </StyledView>
                </StyledView>

                <StyledView className="p-5">
                  <StyledView className="flex-row gap-3 mb-4">
                    <StyledView className="flex-1">
                      <StyledText className="text-gray-400 mb-2 font-medium">Sets</StyledText>
                      <StyledView className="bg-[#2C2C3E] rounded-xl p-3">
                        <StyledTextInput
                          className="text-white text-center text-base"
                          value={exerciseLogs[exercise.exercise_id].sets_completed}
                          onChangeText={(text) => setExerciseLogs(prev => ({
                            ...prev,
                            [exercise.exercise_id]: {
                              ...prev[exercise.exercise_id],
                              sets_completed: text
                            }
                          }))}
                          keyboardType="numeric"
                          placeholderTextColor="#9CA3AF"
                          placeholder="0"
                        />
                      </StyledView>
                    </StyledView>

                    <StyledView className="flex-1">
                      <StyledText className="text-gray-400 mb-2 font-medium">Reps</StyledText>
                      <StyledView className="bg-[#2C2C3E] rounded-xl p-3">
                        <StyledTextInput
                          className="text-white text-center text-base"
                          value={exerciseLogs[exercise.exercise_id].reps_performed}
                          onChangeText={(text) => setExerciseLogs(prev => ({
                            ...prev,
                            [exercise.exercise_id]: {
                              ...prev[exercise.exercise_id],
                              reps_performed: text
                            }
                          }))}
                          keyboardType="numeric"
                          placeholderTextColor="#9CA3AF"
                          placeholder="0"
                        />
                      </StyledView>
                    </StyledView>

                    <StyledView className="flex-1">
                      <StyledText className="text-gray-400 mb-2 font-medium">Weight</StyledText>
                      <StyledView className="bg-[#2C2C3E] rounded-xl p-3">
                        <StyledTextInput
                          className="text-white text-center text-base"
                          value={exerciseLogs[exercise.exercise_id].weight_used}
                          onChangeText={(text) => setExerciseLogs(prev => ({
                            ...prev,
                            [exercise.exercise_id]: {
                              ...prev[exercise.exercise_id],
                              weight_used: text
                            }
                          }))}
                          keyboardType="numeric"
                          placeholderTextColor="#9CA3AF"
                          placeholder="0"
                        />
                      </StyledView>
                    </StyledView>
                  </StyledView>

                  <StyledView>
                    <StyledText className="text-gray-400 mb-2 font-medium">Exercise Notes</StyledText>
                    <StyledTextInput
                      className="bg-[#2C2C3E] text-white p-4 rounded-2xl text-base min-h-[60px] border border-[#4F46E5]/10"
                      value={exerciseLogs[exercise.exercise_id].notes}
                      onChangeText={(text) => setExerciseLogs(prev => ({
                        ...prev,
                        [exercise.exercise_id]: {
                          ...prev[exercise.exercise_id],
                          notes: text
                        }
                      }))}
                      multiline
                      textAlignVertical="top"
                      placeholderTextColor="#9CA3AF"
                      placeholder="Add notes about this exercise"
                    />
                  </StyledView>
                </StyledView>
              </StyledView>
            ))}

            {/* Enhanced Complete Workout Button */}
            <StyledTouchableOpacity
              onPress={logWorkout}
              disabled={isLogging}
              className="mb-8"
            >
              <StyledLinearGradient
                colors={['#4F46E5', '#4338CA']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="p-4 rounded-2xl shadow-lg"
              >
                <StyledView className="flex-row items-center justify-center">
                  <Ionicons 
                    name={isLogging ? "hourglass-outline" : "checkmark-circle-outline"} 
                    size={24} 
                    color="white" 
                  />
                  <StyledText className="text-white font-bold text-lg ml-2">
                    {isLogging ? "Saving Workout..." : "Complete Workout"}
                  </StyledText>
                </StyledView>
              </StyledLinearGradient>
            </StyledTouchableOpacity>
          </StyledView>
        </StyledScrollView>
      </StyledSafeAreaView>
    </StyledView>
  );
};

export default LogWorkoutScreen; 