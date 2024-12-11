import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Alert,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  Modal,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { styled } from "nativewind";
import WorkoutMenuItem from "../../components/WorkoutMenuItem";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledLinearGradient = styled(LinearGradient);

const ExercisePage = () => {
  // State for workouts and filtering
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Search and filter states
  const [searchText, setSearchText] = useState("");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  
  // Filter options
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState([]);
  const [minDuration, setMinDuration] = useState(0);
  const [maxDuration, setMaxDuration] = useState(120);
  const [minCalories, setMinCalories] = useState(0);
  const [maxCalories, setMaxCalories] = useState(1000);
  const [sortBy, setSortBy] = useState(null);

  // Predefined filter options
  const CATEGORIES = ["Cardio", "Strength", "Flexibility", "HIIT", "Yoga"];
  const DIFFICULTIES = ["Easy", "Medium", "Hard"];
  const SORT_OPTIONS = [
    { label: "Newest", value: "newest" },
    { label: "Calories Burned", value: "calories" },
    { label: "Duration", value: "duration" },
  ];

  // Fetch workouts
  const fetchWorkouts = async () => {
    try {
      const authToken = await AsyncStorage.getItem("userToken");
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/workout/`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      setWorkouts(response.data.workouts || []);
    } catch (error) {
      Alert.alert("Error", "Could not fetch workouts");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  // Memoized and filtered workouts
  const filteredWorkouts = useMemo(() => {
    let result = workouts;

    // Text search
    if (searchText) {
      result = result.filter(workout => 
        workout.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter(workout => 
        selectedCategories.includes(workout.category)
      );
    }

    // Difficulty filter
    if (selectedDifficulties.length > 0) {
      result = result.filter(workout => 
        selectedDifficulties.includes(workout.difficulty)
      );
    }

    // Duration filter
    result = result.filter(workout => 
      workout.duration >= minDuration && workout.duration <= maxDuration
    );

    // Calories filter
    result = result.filter(workout => {
      const calories = parseFloat(workout.calories_burned);
      return calories >= minCalories && calories <= maxCalories;
    });

    // Sorting
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case "calories":
        result.sort((a, b) => parseFloat(b.calories_burned) - parseFloat(a.calories_burned));
        break;
      case "duration":
        result.sort((a, b) => b.duration - a.duration);
        break;
    }

    return result;
  }, [workouts, searchText, selectedCategories, 
      selectedDifficulties, minDuration, maxDuration, 
      minCalories, maxCalories, sortBy]);

  // Refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWorkouts();
    setRefreshing(false);
  };

  // Category toggle handler
  const toggleCategory = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Difficulty toggle handler
  const toggleDifficulty = (difficulty) => {
    setSelectedDifficulties(prev => 
      prev.includes(difficulty)
        ? prev.filter(d => d !== difficulty)
        : [...prev, difficulty]
    );
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedDifficulties([]);
    setMinDuration(0);
    setMaxDuration(120);
    setMinCalories(0);
    setMaxCalories(1000);
    setSortBy(null);
    setSearchText("");
  };

  // Navigate to workout detail
  const navigateToWorkoutDetail = (workout) => {
    router.push({
      pathname: "/(screen)/workout-detail",
      params: {
        workout: JSON.stringify({ 
          workoutId: workout.workout_id,
          name: workout.name,
          category: workout.category,
          duration: workout.duration,
          difficulty: workout.difficulty,
          caloriesBurned: workout.calories_burned
        })
      }
    });
  };

  // Filter Modal Component
  const FilterModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={filterModalVisible}
      onRequestClose={() => setFilterModalVisible(false)}
    >
      <StyledView className="flex-1 justify-end bg-black bg-opacity-50">
        <StyledView className="bg-[#1F1F28] rounded-t-3xl p-6">
          {/* Categories Filter */}
          <StyledText className="text-white text-lg font-bold mb-4">Categories</StyledText>
          <StyledView className="flex-row flex-wrap mb-4">
            {CATEGORIES.map(category => (
              <TouchableOpacity 
                key={category}
                onPress={() => toggleCategory(category)}
                className={`
                  p-2 m-1 rounded-full
                  ${selectedCategories.includes(category) 
                    ? 'bg-[#4F46E5]' 
                    : 'bg-[#2C2C3E]'}
                `}
              >
                <StyledText className="text-white">{category}</StyledText>
              </TouchableOpacity>
            ))}
          </StyledView>

          {/* Difficulty Filter */}
          <StyledText className="text-white text-lg font-bold mb-4">Difficulty</StyledText>
          <StyledView className="flex-row mb-4">
            {DIFFICULTIES.map(difficulty => (
              <TouchableOpacity 
                key={difficulty}
                onPress={() => toggleDifficulty(difficulty)}
                className={`
                  p-2 m-1 rounded-full
                  ${selectedDifficulties.includes(difficulty) 
                    ? 'bg-[#4F46E5]' 
                    : 'bg-[#2C2C3E]'}
                `}
              >
                <StyledText className="text-white">{difficulty}</StyledText>
              </TouchableOpacity>
            ))}
          </StyledView>

          {/* Duration Filter */}
          <StyledText className="text-white text-lg font-bold mb-4">Duration (minutes)</StyledText>
          <StyledView className="flex-row justify-between mb-4">
            <TextInput
              className="bg-[#2C2C3E] text-white p-2 rounded-lg w-20"
              placeholder="Min"
              keyboardType="numeric"
              value={minDuration.toString()}
              onChangeText={(text) => setMinDuration(Number(text))}
            />
            <TextInput
              className="bg-[#2C2C3E] text-white p-2 rounded-lg w-20"
              placeholder="Max"
              keyboardType="numeric"
              value={maxDuration.toString()}
              onChangeText={(text) => setMaxDuration(Number(text))}
            />
          </StyledView>

          {/* Calories Range Filter */}
          <StyledText className="text-white text-lg font-bold mb-4">Calories Burned</StyledText>
          <StyledView className="flex-row justify-between items-center mb-4">
            <StyledView className="flex-row items-center">
              <TextInput
                className="bg-[#2C2C3E] text-white p-2 rounded-lg w-20 mr-2"
                placeholder="Min"
                keyboardType="numeric"
                value={minCalories.toString()}
                onChangeText={(text) => setMinCalories(Number(text))}
              />
              <StyledText className="text-white">-</StyledText>
              <TextInput
                className="bg-[#2C2C3E] text-white p-2 rounded-lg w-20 ml-2"
                placeholder="Max"
                keyboardType="numeric"
                value={maxCalories.toString()}
                onChangeText={(text) => setMaxCalories(Number(text))}
              />
            </StyledView>
            <StyledText className="text-[#9CA3AF]">Calories</StyledText>
          </StyledView>

          {/* Sorting */}
          <StyledText className="text-white text-lg font-bold mb-4">Sort By</StyledText>
          <StyledView className="flex-row mb-4">
            {SORT_OPTIONS.map(option => (
              <TouchableOpacity 
                key={option.value}
                onPress={() => setSortBy(option.value)}
                className={`
                  p-2 m-1 rounded-full
                  ${sortBy === option.value 
                    ? 'bg-[#4F46E5]' 
                    : 'bg-[#2C2C3E]'}
                `}
              >
                <StyledText className="text-white">{option.label}</StyledText>
              </TouchableOpacity>
            ))}
          </StyledView>

          {/* Action Buttons */}
          <StyledView className="flex-row justify-between">
            <TouchableOpacity 
              onPress={resetFilters}
              className="bg-[#2C2C3E] p-3 rounded-lg flex-1 mr-2"
            >
              <StyledText className="text-white text-center">Reset</StyledText>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setFilterModalVisible(false)}
              className="bg-[#4F46E5] p-3 rounded-lg flex-1 ml-2"
            >
              <StyledText className="text-white text-center">Apply</StyledText>
            </TouchableOpacity>
          </StyledView>
        </StyledView>
      </StyledView>
    </Modal>
  );

  // Render loading state
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
        <ScrollView
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              tintColor="#4F46E5" 
            />
          }
          className="flex-1"
        >
          {/* Hero Section */}
          <StyledLinearGradient
            colors={getWorkoutGradient('strength')}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="h-[300px] relative"
          >
            <LinearGradient
              colors={['rgba(15, 15, 20, 0)', 'rgba(15, 15, 20, 0.8)', 'rgba(15, 15, 20, 1)']}
              className="h-full px-6 justify-end"
            >
              {/* Title Section */}
              <StyledView className="flex-row items-center justify-between mb-6">
                <StyledView>
                  <StyledText className="text-white/70 text-lg mb-1">
                    Welcome back
                  </StyledText>
                  <StyledText className="text-white font-bold text-3xl">
                    Workout Library
                  </StyledText>
                </StyledView>
                <StyledView className="bg-black/30 p-6 rounded-3xl">
                  <Ionicons name="fitness" size={48} color="#FFFFFF" />
                </StyledView>
              </StyledView>

              {/* Stats Row */}
              <StyledView className="flex-row items-center flex-wrap gap-2">
                <StyledView className="bg-black/30 px-3 py-1 rounded-full flex-row items-center">
                  <Ionicons name="calendar-outline" size={16} color="#FFFFFF" />
                  <StyledText className="text-white ml-1">
                    {workouts.length} Workouts
                  </StyledText>
                </StyledView>
                <StyledView className="bg-black/30 px-3 py-1 rounded-full flex-row items-center">
                  <Ionicons name="filter-outline" size={16} color="#FFFFFF" />
                  <StyledText className="text-white ml-1">
                    {selectedCategories.length} Filters
                  </StyledText>
                </StyledView>
              </StyledView>
            </LinearGradient>
          </StyledLinearGradient>

          {/* Search and Filter Section */}
          <StyledView className="px-4 -mt-8">
            <StyledView className="bg-[#1F1F28] p-3 rounded-2xl shadow-lg border border-gray-800/50">
              <StyledView className="flex-row items-center mb-3">
                <StyledView className="flex-1 flex-row items-center bg-[#2C2C3E] rounded-xl p-2 mr-2">
                  <Ionicons name="search" size={20} color="#9CA3AF" style={{ marginLeft: 8 }} />
                  <TextInput
                    className="flex-1 text-white p-2 text-base ml-2"
                    placeholder="Search workouts..."
                    placeholderTextColor="#9CA3AF"
                    value={searchText}
                    onChangeText={setSearchText}
                  />
                </StyledView>
                <TouchableOpacity 
                  onPress={() => setFilterModalVisible(true)}
                  className="bg-[#4F46E5] p-3 rounded-xl"
                >
                  <Ionicons name="options" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </StyledView>

              {/* Quick Filters */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                className="flex-row"
              >
                {CATEGORIES.map(category => (
                  <TouchableOpacity
                    key={category}
                    onPress={() => toggleCategory(category)}
                    className={`
                      mr-2 px-4 py-2 rounded-xl flex-row items-center
                      ${selectedCategories.includes(category) 
                        ? 'bg-[#4F46E5]' 
                        : 'bg-[#2C2C3E]'}
                    `}
                  >
                    <Ionicons 
                      name={getWorkoutIcon(category.toLowerCase())} 
                      size={16} 
                      color={selectedCategories.includes(category) ? '#FFFFFF' : '#9CA3AF'} 
                    />
                    <StyledText className={`ml-2 ${
                      selectedCategories.includes(category) 
                        ? 'text-white' 
                        : 'text-[#9CA3AF]'
                    }`}>
                      {category}
                    </StyledText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </StyledView>
          </StyledView>

          {/* Workouts List */}
          <StyledView className="px-4 mt-6 mb-16">
            {/* Section Header */}
            <StyledView className="flex-row items-center justify-between mb-4">
              <StyledText className="text-white text-xl font-bold">
                Available Workouts
              </StyledText>
              <StyledText className="text-[#4F46E5]">
                {filteredWorkouts.length} workouts
              </StyledText>
            </StyledView>

            {filteredWorkouts.length > 0 ? (
              filteredWorkouts.map((workout) => (
                <WorkoutMenuItem 
                  key={workout.workout_id} 
                  workout={workout} 
                  onPress={() => navigateToWorkoutDetail(workout)} 
                />
              ))
            ) : (
              <StyledView className="items-center justify-center py-12 bg-[#1F1F28] rounded-2xl">
                <StyledView className="bg-[#2C2C3E] p-4 rounded-full mb-4">
                  <Ionicons name="fitness-outline" size={32} color="#4F46E5" />
                </StyledView>
                <StyledText className="text-white text-lg font-semibold mb-1">
                  No workouts found
                </StyledText>
                <StyledText className="text-[#9CA3AF] text-center px-6">
                  Try adjusting your filters or search terms
                </StyledText>
              </StyledView>
            )}
          </StyledView>
        </ScrollView>

        {/* Filter Modal */}
        <FilterModal />
      </SafeAreaView>
    </StyledView>
  );
};

// Helper function for workout icons
const getWorkoutIcon = (category) => {
  switch (category) {
    case 'cardio':
      return 'bicycle';
    case 'strength':
      return 'barbell';
    case 'flexibility':
      return 'body';
    case 'hiit':
      return 'flash';
    case 'yoga':
      return 'leaf';
    default:
      return 'fitness';
  }
};

// Add this helper function at the top level
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

export default ExercisePage;