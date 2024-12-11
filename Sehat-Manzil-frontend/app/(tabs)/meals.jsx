import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
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
import { styled } from "nativewind";
import { 
  LineChart,
  BarChart,
} from "react-native-chart-kit";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, parseISO, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';
import { Dimensions } from 'react-native';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledLinearGradient = styled(LinearGradient);

// Move MealFormModal outside the main component
const MealFormModal = React.memo(({ 
  visible, 
  onClose, 
  onSubmit, 
  editingMeal,
  initialValues,
}) => {
  const [mealName, setMealName] = useState(initialValues?.name || "");
  const [calories, setCalories] = useState(initialValues?.calories?.toString() || "");
  const [protein, setProtein] = useState(initialValues?.protein?.toString() || "");
  const [carbs, setCarbs] = useState(initialValues?.carbs?.toString() || "");
  const [fats, setFats] = useState(initialValues?.fats?.toString() || "");
  const [mealType, setMealType] = useState(initialValues?.mealType || "Breakfast");

  const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];

  const handleSubmit = () => {
    onSubmit({
      name: mealName,
      calories: Number(calories),
      protein: Number(protein),
      carbs: Number(carbs),
      fat: Number(fats),
      mealType,
    });
  };

  useEffect(() => {
    if (initialValues) {
      setMealName(initialValues.name || "");
      setCalories(initialValues.calories?.toString() || "");
      setProtein(initialValues.protein?.toString() || "");
      setCarbs(initialValues.carbs?.toString() || "");
      setFats(initialValues.fats?.toString() || "");
      setMealType(initialValues.mealType || "Breakfast");
    }
  }, [initialValues]);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <StyledView className="flex-1 justify-end bg-black bg-opacity-50">
        <StyledView className="bg-[#1F1F28] rounded-t-3xl p-6">
          <StyledText className="text-white text-xl font-bold mb-4">
            {editingMeal ? "Edit Meal" : "Add New Meal"}
          </StyledText>

          <TextInput
            className="bg-[#2C2C3E] text-white p-4 rounded-xl mb-4"
            placeholder="Meal Name"
            placeholderTextColor="#9CA3AF"
            value={mealName}
            onChangeText={setMealName}
          />

          <TextInput
            className="bg-[#2C2C3E] text-white p-4 rounded-xl mb-4"
            placeholder="Calories"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            value={calories}
            onChangeText={setCalories}
          />

          <StyledView className="flex-row justify-between mb-4">
            <TextInput
              className="bg-[#2C2C3E] text-white p-4 rounded-xl w-[30%]"
              placeholder="Protein"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={protein}
              onChangeText={setProtein}
            />
            <TextInput
              className="bg-[#2C2C3E] text-white p-4 rounded-xl w-[30%]"
              placeholder="Carbs"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={carbs}
              onChangeText={setCarbs}
            />
            <TextInput
              className="bg-[#2C2C3E] text-white p-4 rounded-xl w-[30%]"
              placeholder="Fats"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={fats}
              onChangeText={setFats}
            />
          </StyledView>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="mb-6"
          >
            {MEAL_TYPES.map(type => (
              <TouchableOpacity
                key={type}
                onPress={() => setMealType(type)}
                className={`
                  mr-2 px-6 py-3 rounded-xl
                  ${mealType === type ? 'bg-[#4F46E5]' : 'bg-[#2C2C3E]'}
                `}
              >
                <StyledText className={`
                  ${mealType === type ? 'text-white' : 'text-[#9CA3AF]'}
                `}>
                  {type}
                </StyledText>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <StyledView className="flex-row justify-between">
            <TouchableOpacity 
              onPress={onClose}
              className="bg-[#2C2C3E] p-4 rounded-xl flex-1 mr-2"
            >
              <StyledText className="text-white text-center">Cancel</StyledText>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleSubmit}
              className="bg-[#4F46E5] p-4 rounded-xl flex-1 ml-2"
            >
              <StyledText className="text-white text-center">
                {editingMeal ? "Update" : "Add"} Meal
              </StyledText>
            </TouchableOpacity>
          </StyledView>
        </StyledView>
      </StyledView>
    </Modal>
  );
});

// Add this component for analytics
const MealAnalytics = React.memo(({ meals, MEAL_TYPES }) => {
  const screenWidth = Dimensions.get('window').width;

  // Calculate daily totals for the week
  const dailyTotals = useMemo(() => {
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());
    const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return daysInWeek.map(day => {
      const dayMeals = meals.filter(meal => {
        const mealDate = parseISO(meal.created_at);
        return format(mealDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
      });

      const totalCalories = dayMeals.reduce((sum, meal) => sum + (Number(meal.calories) || 0), 0);
      console.log(totalCalories);
      return {
        date: format(day, 'EEE'),
        calories: Math.max(0, Math.round(totalCalories)),
      };
    });
  }, [meals]);

  // Calculate daily averages
  const dailyAverages = useMemo(() => {
    const totals = meals.reduce((acc, meal) => ({
      calories: acc.calories + (meal.calories || 0),
      protein: acc.protein + (meal.protein || 0),
      carbs: acc.carbs + (meal.carbs || 0),
      fat: acc.fat + (meal.fat || 0),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    const days = new Set(meals.map(meal => 
      format(new Date(meal.created_at), 'yyyy-MM-dd')
    )).size || 1;

    return {
      calories: Math.round(totals.calories / days),
      protein: Math.round(totals.protein / days),
      carbs: Math.round(totals.carbs / days),
      fat: Math.round(totals.fat / days),
    };
  }, [meals]);

  // Simplified chart configuration
  const chartConfig = {
    backgroundGradientFrom: '#1F1F28',
    backgroundGradientTo: '#1F1F28',
    color: () => '#4F46E5',
    labelColor: () => '#FFFFFF',
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#4F46E5'
    }
  };

  // Calculate meal type counts
  const mealTypeCounts = MEAL_TYPES.map(type => 
    meals.filter(meal => meal.meal_type === type).length
  );

  return (
    <StyledView className="mt-4">
      <StyledText className="text-white text-xl font-bold mb-4">
        Nutrition Analytics
      </StyledText>

      {/* Weekly Calories Chart */}
      <StyledView className="bg-[#1F1F28] p-4 rounded-xl mb-4">
        <StyledText className="text-white text-lg mb-2">Weekly Calories</StyledText>
        <LineChart
          data={{
            labels: dailyTotals.map(day => day.date),
            datasets: [{
              data: dailyTotals.map(day => Math.max(0, Math.round(day.calories))),
              color: () => '#4F46E5',
              strokeWidth: 2
            }]
          }}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
          withVerticalLines={false}
          withHorizontalLines={false}
          withDots={false}
          withShadow={false}
          segments={4}
        />
      </StyledView>

      {/* Meal Type Distribution */}
      <StyledView className="bg-[#1F1F28] p-4 rounded-xl mb-4">
        <StyledText className="text-white text-lg mb-2">Meals by Type</StyledText>
        <BarChart
          data={{
            labels: MEAL_TYPES,
            datasets: [{
              data: mealTypeCounts.map(count => Math.max(0, count))
            }]
          }}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
          withHorizontalLabels={true}
          showBarTops={false}
          fromZero={true}
          segments={4}
        />
      </StyledView>

      {/* Stats Summary */}
      <StyledView className="bg-[#1F1F28] p-4 rounded-xl mb-20">
        <StyledText className="text-white text-lg mb-4">Nutrition Summary</StyledText>
        <StyledView className="flex-row flex-wrap justify-between">
          <StyledView className="w-[48%] bg-[#2C2C3E] p-4 rounded-xl mb-4">
            <StyledText className="text-[#9CA3AF]">Daily Avg. Calories</StyledText>
            <StyledText className="text-white text-xl font-bold">
              {dailyAverages.calories}
            </StyledText>
          </StyledView>
          <StyledView className="w-[48%] bg-[#2C2C3E] p-4 rounded-xl mb-4">
            <StyledText className="text-[#9CA3AF]">Total Meals</StyledText>
            <StyledText className="text-white text-xl font-bold">
              {meals.length}
            </StyledText>
          </StyledView>
        </StyledView>
      </StyledView>
    </StyledView>
  );
});

// Add this component
const NutritionInsights = ({ meals }) => {
  const insights = useMemo(() => {
    const today = new Date();
    const todayMeals = meals.filter(meal => 
      format(new Date(meal.created_at), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
    );

    return {
      caloriesProgress: Math.round((todayMeals.reduce((sum, meal) => sum + meal.calories, 0) / 2000) * 100),
      proteinProgress: Math.round((todayMeals.reduce((sum, meal) => sum + meal.protein, 0) / 150) * 100),
      mostFrequentMeal: MEAL_TYPES.reduce((a, b) => 
        meals.filter(m => m.meal_type === a).length > 
        meals.filter(m => m.meal_type === b).length ? a : b
      ),
      streakDays: calculateStreak(meals),
    };
  }, [meals]);

  return (
    <StyledView className="bg-[#1F1F28] p-4 rounded-xl mb-4">
      <StyledText className="text-white text-lg mb-4">Nutrition Insights</StyledText>
      <StyledView className="space-y-4">
        {/* Progress bars and insights */}
      </StyledView>
    </StyledView>
  );
};

const MealCard = React.memo(({ meal, onEdit, onDelete }) => {
  return (
    <StyledView className="bg-[#1F1F28] rounded-2xl mb-4 overflow-hidden">
      {/* Meal Header */}
      <StyledLinearGradient
        colors={['#2C2C3E', '#1F1F28']}
        className="p-4 border-b border-[#2C2C3E]"
      >
        <StyledView className="flex-row justify-between items-center">
          <StyledView className="flex-1">
            <StyledText className="text-white text-lg font-semibold">
              {meal.name}
            </StyledText>
            <StyledView className="flex-row items-center mt-1">
              <Ionicons name="time-outline" size={14} color="#9CA3AF" />
              <StyledText className="text-[#9CA3AF] text-sm ml-1">
                {format(new Date(meal.created_at), 'MMM d, h:mm a')}
              </StyledText>
            </StyledView>
          </StyledView>
          <StyledView className="bg-[#4F46E5]/20 px-3 py-1 rounded-full">
            <StyledText className="text-[#4F46E5]">{meal.meal_type}</StyledText>
          </StyledView>
        </StyledView>
      </StyledLinearGradient>

      {/* Meal Stats */}
      <StyledView className="p-4">
        <StyledView className="flex-row justify-between mb-4">
          <StyledView className="items-center flex-1">
            <StyledView className="bg-[#2C2C3E] w-12 h-12 rounded-full items-center justify-center mb-2">
              <StyledText className="text-[#4F46E5] text-lg font-bold">
                {meal.calories}
              </StyledText>
            </StyledView>
            <StyledText className="text-[#9CA3AF]">Calories</StyledText>
          </StyledView>
          <StyledView className="items-center flex-1">
            <StyledView className="bg-[#2C2C3E] w-12 h-12 rounded-full items-center justify-center mb-2">
              <StyledText className="text-white text-lg">
                {meal.protein}
              </StyledText>
            </StyledView>
            <StyledText className="text-[#9CA3AF]">Protein</StyledText>
          </StyledView>
          <StyledView className="items-center flex-1">
            <StyledView className="bg-[#2C2C3E] w-12 h-12 rounded-full items-center justify-center mb-2">
              <StyledText className="text-white text-lg">
                {meal.carbs}
              </StyledText>
            </StyledView>
            <StyledText className="text-[#9CA3AF]">Carbs</StyledText>
          </StyledView>
          <StyledView className="items-center flex-1">
            <StyledView className="bg-[#2C2C3E] w-12 h-12 rounded-full items-center justify-center mb-2">
              <StyledText className="text-white text-lg">
                {meal.fat}
              </StyledText>
            </StyledView>
            <StyledText className="text-[#9CA3AF]">Fats</StyledText>
          </StyledView>
        </StyledView>

        {/* Actions */}
        <StyledView className="flex-row justify-end border-t border-[#2C2C3E] pt-4">
          <TouchableOpacity
            onPress={() => onEdit(meal)}
            className="bg-[#2C2C3E] p-3 rounded-xl mr-2 flex-row items-center"
          >
            <Ionicons name="create-outline" size={18} color="#FFFFFF" />
            <StyledText className="text-white ml-2">Edit</StyledText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                "Delete Meal",
                "Are you sure you want to delete this meal?",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Delete", onPress: () => onDelete(meal.meal_id), style: "destructive" }
                ]
              );
            }}
            className="bg-red-500/20 p-3 rounded-xl flex-row items-center"
          >
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
            <StyledText className="text-red-500 ml-2">Delete</StyledText>
          </TouchableOpacity>
        </StyledView>
      </StyledView>
    </StyledView>
  );
});

const FilterModal = React.memo(({ 
  visible, 
  onClose,
  dateRange,
  setDateRange,
  sortBy,
  setSortBy,
  calorieRange,
  setCalorieRange 
}) => {
  const [localDateRange, setLocalDateRange] = useState(dateRange);
  const [localSortBy, setLocalSortBy] = useState(sortBy);
  const [localCalorieRange, setLocalCalorieRange] = useState(calorieRange);

  const handleApply = () => {
    setDateRange(localDateRange);
    setSortBy(localSortBy);
    setCalorieRange(localCalorieRange);
    onClose();
  };

  const dateRangeOptions = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'all', label: 'All Time' },
  ];

  const sortOptions = [
    { id: 'recent', label: 'Most Recent', icon: 'time-outline' },
    { id: 'calories', label: 'Highest Calories', icon: 'flame-outline' },
    { id: 'protein', label: 'Highest Protein', icon: 'barbell-outline' },
  ];

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <StyledView className="flex-1 justify-end bg-black/50">
        <StyledView className="bg-[#1F1F28] rounded-t-3xl p-6">
          <StyledView className="flex-row justify-between items-center mb-6">
            <StyledText className="text-white text-xl font-bold">
              Filter & Sort
          </StyledText>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </StyledView>

          {/* Date Range Section */}
          <StyledView className="mb-6">
            <StyledText className="text-white text-lg mb-3">Date Range</StyledText>
            <StyledView className="flex-row flex-wrap gap-2">
              {dateRangeOptions.map(option => (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => setLocalDateRange(option.id)}
                  className={`
                    px-4 py-2 rounded-xl
                    ${localDateRange === option.id ? 'bg-[#4F46E5]' : 'bg-[#2C2C3E]'}
                  `}
                >
                  <StyledText className={`
                    ${localDateRange === option.id ? 'text-white' : 'text-[#9CA3AF]'}
                  `}>
                    {option.label}
                  </StyledText>
                </TouchableOpacity>
              ))}
            </StyledView>
          </StyledView>

          {/* Sort By Section */}
          <StyledView className="mb-6">
            <StyledText className="text-white text-lg mb-3">Sort By</StyledText>
            {sortOptions.map(option => (
                <TouchableOpacity
                key={option.id}
                onPress={() => setLocalSortBy(option.id)}
                  className={`
                  flex-row items-center p-4 rounded-xl mb-2
                  ${localSortBy === option.id ? 'bg-[#4F46E5]' : 'bg-[#2C2C3E]'}
                  `}
                >
                <Ionicons 
                  name={option.icon} 
                  size={20} 
                  color={localSortBy === option.id ? '#FFFFFF' : '#9CA3AF'} 
                />
                  <StyledText className={`
                  ml-3
                  ${localSortBy === option.id ? 'text-white' : 'text-[#9CA3AF]'}
                  `}>
                  {option.label}
                  </StyledText>
                </TouchableOpacity>
              ))}
          </StyledView>

          {/* Calorie Range Section */}
          <StyledView className="mb-6">
            <StyledText className="text-white text-lg mb-3">
              Calorie Range: {localCalorieRange[0]} - {localCalorieRange[1]}
            </StyledText>
            <StyledView className="flex-row justify-between mb-2">
              <TextInput
                className="bg-[#2C2C3E] text-white p-3 rounded-xl w-[45%]"
                keyboardType="numeric"
                value={localCalorieRange[0].toString()}
                onChangeText={text => setLocalCalorieRange([parseInt(text) || 0, localCalorieRange[1]])}
                placeholder="Min"
                placeholderTextColor="#9CA3AF"
              />
              <TextInput
                className="bg-[#2C2C3E] text-white p-3 rounded-xl w-[45%]"
                keyboardType="numeric"
                value={localCalorieRange[1].toString()}
                onChangeText={text => setLocalCalorieRange([localCalorieRange[0], parseInt(text) || 0])}
                placeholder="Max"
                placeholderTextColor="#9CA3AF"
              />
            </StyledView>
          </StyledView>

          {/* Action Buttons */}
          <StyledView className="flex-row justify-between">
            <TouchableOpacity
              onPress={() => {
                setLocalDateRange('all');
                setLocalSortBy('recent');
                setLocalCalorieRange([0, 2000]);
              }}
              className="bg-[#2C2C3E] p-4 rounded-xl flex-1 mr-2"
            >
              <StyledText className="text-white text-center">Reset</StyledText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleApply}
              className="bg-[#4F46E5] p-4 rounded-xl flex-1 ml-2"
            >
              <StyledText className="text-white text-center">Apply Filters</StyledText>
            </TouchableOpacity>
          </StyledView>
        </StyledView>
      </StyledView>
    </Modal>
  );
});

const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <StyledView className="flex-1 bg-[#0F0F14] items-center justify-center p-4">
        <Ionicons name="alert-circle" size={48} color="#EF4444" />
        <StyledText className="text-white text-lg font-bold mt-4">
          Something went wrong
        </StyledText>
        <StyledText className="text-[#9CA3AF] text-center mt-2">
          We're having trouble loading your meals. Please try again later.
        </StyledText>
        <TouchableOpacity
          onPress={() => setHasError(false)}
          className="bg-[#4F46E5] px-6 py-3 rounded-xl mt-4"
        >
          <StyledText className="text-white font-bold">Try Again</StyledText>
        </TouchableOpacity>
      </StyledView>
    );
  }

  return children;
};

export default function MealPage() {
  // State Management
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [modalInitialValues, setModalInitialValues] = useState(null);
  
  // Form States
  const [mealName, setMealName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fats, setFats] = useState("");
  const [mealType, setMealType] = useState("Breakfast");

  // Filter States
  const [searchText, setSearchText] = useState("");
  const [selectedMealType, setSelectedMealType] = useState(null);
  const [dateRange, setDateRange] = useState('today'); // 'today', 'week', 'month'
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'calories', 'protein'
  const [calorieRange, setCalorieRange] = useState([0, 2000]);

  const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];

  // Add this state in MealPage component
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Fetch meals from API
  const fetchMeals = async () => {
    try {
      const authToken = await AsyncStorage.getItem("userToken");
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/meals/`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      setMeals(response.data.meals || []);
    } catch (error) {
      Alert.alert("Error", "Could not fetch meals");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeals();
  }, []);

  // Filtered and sorted meals
  const filteredMeals = useMemo(() => {
    let result = meals;

    // Date filtering
    result = result.filter(meal => {
      const mealDate = new Date(meal.created_at);
      const today = new Date();
      
      switch(dateRange) {
        case 'today':
          return format(mealDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
        case 'week':
          return isWithinInterval(mealDate, {
            start: startOfWeek(today),
            end: endOfWeek(today)
          });
        case 'month':
          return isWithinInterval(mealDate, {
            start: startOfMonth(today),
            end: endOfMonth(today)
          });
        default:
          return true;
      }
    });

    // Text search
    if (searchText) {
      result = result.filter(meal =>
        meal.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Meal type filter
    if (selectedMealType) {
      result = result.filter(meal => meal.meal_type === selectedMealType);
    }

    // Calorie range filter
    result = result.filter(meal => 
      meal.calories >= calorieRange[0] && meal.calories <= calorieRange[1]
    );

    // Sorting
    switch(sortBy) {
      case 'recent':
    return result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      case 'calories':
        return result.sort((a, b) => b.calories - a.calories);
      case 'protein':
        return result.sort((a, b) => b.protein - a.protein);
      default:
        return result;
    }
  }, [meals, searchText, selectedMealType, dateRange, sortBy, calorieRange]);

  const handleOpenEditModal = useCallback((meal) => {
    setModalInitialValues({
      name: meal.name,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fats: meal.fat,
      mealType: meal.meal_type,
    });
    setEditingMeal(meal);
    setAddModalVisible(true);
  }, []);

  const handleSubmitMeal = useCallback(async (mealData) => {
    try {
      const authToken = await AsyncStorage.getItem("userToken");

      if (editingMeal) {
        await axios.put(
          `${process.env.EXPO_PUBLIC_BACKEND_URL}/meals/${editingMeal.meal_id}`,
          mealData,
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );
      } else {
        await axios.post(
          `${process.env.EXPO_PUBLIC_BACKEND_URL}/meals/`,
          mealData,
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );
      }

      setAddModalVisible(false);
      setModalInitialValues(null);
      setEditingMeal(null);
      fetchMeals();
      Alert.alert("Success", `Meal ${editingMeal ? "updated" : "added"} successfully`);
    } catch (error) {
      Alert.alert("Error", `Failed to ${editingMeal ? "update" : "add"} meal`);
      console.error(error);
    }
  }, [editingMeal]);

  const handleCloseModal = useCallback(() => {
    setAddModalVisible(false);
    setModalInitialValues(null);
    setEditingMeal(null);
  }, []);

  // Handle meal deletion
  const handleDeleteMeal = async (mealId) => {
    try {
      const authToken = await AsyncStorage.getItem("userToken");
      await axios.delete(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/meals/${mealId}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      fetchMeals();
      Alert.alert("Success", "Meal deleted successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to delete meal");
      console.error(error);
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
        <ScrollView
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={fetchMeals}
              tintColor="#4F46E5"
            />
          }
        >
          {/* Header Section */}
          <StyledLinearGradient
            colors={['#4F46E5', '#302F4E']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="h-[200px] relative"
          >
            <LinearGradient
              colors={['rgba(15, 15, 20, 0)', 'rgba(15, 15, 20, 0.8)', 'rgba(15, 15, 20, 1)']}
              className="h-full p-6 justify-end"
            >
              <StyledView className="flex-row justify-between items-center">
                <StyledView>
                  <StyledText className="text-white/70 text-lg">
                    Track Your
                  </StyledText>
                  <StyledText className="text-white font-bold text-3xl">
                    Daily Nutrition
                  </StyledText>
                </StyledView>
                <StyledView className="flex-row">
                  <TouchableOpacity
                    onPress={() => setFilterModalVisible(true)}
                    className="bg-black/30 p-4 rounded-full mr-2"
                  >
                    <Ionicons name="filter" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setAddModalVisible(true)}
                    className="bg-black/30 p-4 rounded-full"
                  >
                    <Ionicons name="add" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </StyledView>
              </StyledView>

              {/* Quick Stats */}
              <StyledView className="flex-row mt-4 mb-4 space-x-2">
                <StyledView className="bg-black/30 px-3 py-1 rounded-full flex-row items-center">
                  <Ionicons name="flame-outline" size={16} color="#FFFFFF" />
                  <StyledText className="text-white ml-1">
                    {Math.round(meals.reduce((sum, meal) => Math.max(0, sum + Number(meal.calories)), 0))} cal today
                  </StyledText>
                </StyledView>
                <StyledView className="bg-black/30 px-3 py-1 rounded-full flex-row items-center">
                  <Ionicons name="restaurant-outline" size={16} color="#FFFFFF" />
                  <StyledText className="text-white ml-1">
                    {meals.filter(meal => {
                      const mealDate = new Date(meal.created_at);
                      return format(mealDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                    }).length} meals today
                  </StyledText>
                </StyledView>
              </StyledView>
            </LinearGradient>
          </StyledLinearGradient>

          {/* Search and Filter Section */}
          <StyledView className="px-4 -mt-8">
            <StyledView className="bg-[#1F1F28] p-4 rounded-2xl shadow-lg">
              <StyledView className="flex-row items-center mb-4">
                <StyledView className="flex-1 flex-row items-center bg-[#2C2C3E] rounded-xl p-2">
                  <Ionicons name="search" size={20} color="#9CA3AF" />
                  <TextInput
                    className="flex-1 text-white ml-2"
                    placeholder="Search meals..."
                    placeholderTextColor="#9CA3AF"
                    value={searchText}
                    onChangeText={setSearchText}
                  />
                </StyledView>
              </StyledView>

              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
              >
                <TouchableOpacity
                  onPress={() => setSelectedMealType(null)}
                  className={`
                    mr-2 px-4 py-2 rounded-xl
                    ${!selectedMealType ? 'bg-[#4F46E5]' : 'bg-[#2C2C3E]'}
                  `}
                >
                  <StyledText className={`
                    ${!selectedMealType ? 'text-white' : 'text-[#9CA3AF]'}
                  `}>
                    All
                  </StyledText>
                </TouchableOpacity>
                {MEAL_TYPES.map(type => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setSelectedMealType(type)}
                    className={`
                      mr-2 px-4 py-2 rounded-xl
                      ${selectedMealType === type ? 'bg-[#4F46E5]' : 'bg-[#2C2C3E]'}
                    `}
                  >
                    <StyledText className={`
                      ${selectedMealType === type ? 'text-white' : 'text-[#9CA3AF]'}
                    `}>
                      {type}
                    </StyledText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </StyledView>
          </StyledView>

          {/* Meals List */}
          <StyledView className="p-4">
            {filteredMeals.map((meal) => (
              <MealCard
                key={meal.meal_id}
                meal={meal}
                onEdit={handleOpenEditModal}
                onDelete={handleDeleteMeal}
              />
            ))}
          </StyledView>

          <StyledView className="px-4">
            <MealAnalytics meals={meals} MEAL_TYPES={MEAL_TYPES} />
          </StyledView>
        </ScrollView>

        <MealFormModal
          visible={addModalVisible}
          onClose={handleCloseModal}
          onSubmit={handleSubmitMeal}
          editingMeal={editingMeal}
          initialValues={modalInitialValues}
        />

        <FilterModal
          visible={filterModalVisible}
          onClose={() => setFilterModalVisible(false)}
          dateRange={dateRange}
          setDateRange={setDateRange}
          sortBy={sortBy}
          setSortBy={setSortBy}
          calorieRange={calorieRange}
          setCalorieRange={setCalorieRange}
        />
      </SafeAreaView>
    </StyledView>
  );
}