import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

const ExerciseDetails = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Move the state updates into a single effect execution
    const parseExerciseData = () => {
      try {
        if (!params.exercise) {
          setError('No exercise data found');
          return;
        }
        
        const exerciseData = JSON.parse(params.exercise);
        setExercise(exerciseData);
      } catch (err) {
        console.error('Error parsing exercise data:', err);
        setError('Failed to load exercise details');
      } finally {
        setLoading(false);
      }
    };

    parseExerciseData();
  }, []); // Only depend on params.exercise if it might change during component lifecycle

  if (loading) {
    return (
      <SafeAreaView className="bg-gray-900 flex-1">
        <View className="flex-1 justify-center items-center">
          <Text className="text-white text-lg">Loading exercise details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="bg-gray-900 flex-1">
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-white text-lg text-center">{error}</Text>
          <TouchableOpacity
            className="mt-4 bg-purple-600 px-6 py-3 rounded-xl"
            onPress={() => router.back()}
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!exercise) {
    return (
      <SafeAreaView className="bg-gray-900 flex-1">
        <View className="flex-1 justify-center items-center">
          <Text className="text-white text-lg">Exercise not found</Text>
          <TouchableOpacity
            className="mt-4 bg-purple-600 px-6 py-3 rounded-xl"
            onPress={() => router.back()}
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-gray-900 flex-1">
      <ScrollView className="flex-1">
        {/* Header Section */}
        <View className="p-4 border-b border-gray-800">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mb-4"
          >
            <Text className="text-purple-500">← Back to Search</Text>
          </TouchableOpacity>
          <Text className="text-white text-3xl font-bold">{exercise.name}</Text>
          <Text className="text-purple-400 text-lg mt-2">
            {exercise.muscle_group}
          </Text>
        </View>

        {/* Main Content Section */}
        <View className="p-4">
          {/* Training Parameters Card */}
          <View className="bg-purple-900/50 rounded-xl p-4 mb-6">
            <Text className="text-white text-xl font-bold mb-4">
              Training Parameters
            </Text>
            <View className="flex-row justify-between">
              <View className="items-center">
                <Text className="text-purple-300 text-sm">SETS</Text>
                <Text className="text-white text-xl font-bold">{exercise.sets}</Text>
              </View>
              <View className="items-center">
                <Text className="text-purple-300 text-sm">REPS</Text>
                <Text className="text-white text-xl font-bold">{exercise.reps}</Text>
              </View>
              <View className="items-center">
                <Text className="text-purple-300 text-sm">REST</Text>
                <Text className="text-white text-xl font-bold">{exercise.rest_time}s</Text>
              </View>
            </View>
          </View>

          {/* Instructions Section */}
          <View className="mb-6">
            <Text className="text-white text-xl font-bold mb-3">
              Instructions
            </Text>
            <View className="bg-purple-900/50 rounded-xl p-4">
              <Text className="text-gray-300 leading-6">
                {exercise.instructions}
              </Text>
            </View>
          </View>

          {/* Tips Section */}
          {exercise.tips && (
            <View className="mb-6">
              <Text className="text-white text-xl font-bold mb-3">
                Tips & Form Cues
              </Text>
              <View className="bg-purple-900/50 rounded-xl p-4">
                <Text className="text-gray-300 leading-6">
                  {exercise.tips}
                </Text>
              </View>
            </View>
          )}

          {/* Target Muscles Section */}
          <View className="mb-6">
            <Text className="text-white text-xl font-bold mb-3">
              Target Muscles
            </Text>
            <View className="bg-purple-900/50 rounded-xl p-4">
              <Text className="text-gray-300">
                Primary: {exercise.muscle_group}
              </Text>
              {exercise.secondary_muscles && (
                <Text className="text-gray-300 mt-2">
                  Secondary: {exercise.secondary_muscles}
                </Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ExerciseDetails;