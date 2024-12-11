import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styled } from "nativewind";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

const WorkoutMenuItem = ({ workout, onPress }) => {
  const getWorkoutIcon = (category) => {
    switch (category.toLowerCase()) {
      case 'cardio': return 'bicycle';
      case 'strength': return 'barbell';
      case 'yoga': return 'body';
      case 'hiit': return 'flash';
      default: return 'fitness';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'hard': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <StyledTouchableOpacity
      onPress={onPress}
      className="bg-[#1F1F28] rounded-2xl p-4 mb-3 shadow-md flex-row items-center"
    >
      {/* Workout Icon */}
      <StyledView className="bg-[#4F46E5]/20 p-3 rounded-xl mr-4">
        <Ionicons 
          name={getWorkoutIcon(workout.category)} 
          size={24} 
          color="#4F46E5" 
        />
      </StyledView>

      {/* Workout Details */}
      <StyledView className="flex-1">
        <StyledText className="text-white text-lg font-bold">
          {workout.name}
        </StyledText>

        <StyledView className="flex-row items-center mt-1">
          <Ionicons name="time" size={16} color="#9CA3AF" />
          <StyledText className="text-[#9CA3AF] ml-2 text-sm">
            {workout.duration} mins
          </StyledText>
        </StyledView>

        <StyledView className="flex-row mt-1 items-center">
          <StyledText className={`text-sm ${getDifficultyColor(workout.difficulty)}`}>
            {workout.difficulty}
          </StyledText>
          <StyledView className="ml-2 bg-[#9CA3AF]/20 px-2 py-1 rounded-md">
            <StyledText className="text-[#9CA3AF] text-xs">
              {workout.category}
            </StyledText>
          </StyledView>
        </StyledView>
      </StyledView>

      {/* Calories and Chevron */}
      <StyledView className="items-end">
        <StyledView className="bg-[#4F46E5]/10 px-2 py-1 rounded-md mb-2">
          <StyledText className="text-[#4F46E5] font-bold">
            {workout.calories_burned} cal
          </StyledText>
        </StyledView>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </StyledView>
    </StyledTouchableOpacity>
  );
};

export default WorkoutMenuItem;