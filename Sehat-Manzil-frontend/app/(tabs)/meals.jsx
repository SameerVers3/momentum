import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, ScrollView, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';

// Define the API URL (replace with your actual backend URL)
const BASE_URL = 'http://your-api-url.com'; // Example URL

// Fetch all meals for the authenticated user
const getMeals = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/meals`);
    return response.data; // Ensure your API returns the data under a 'meals' key
  } catch (error) {
    console.error('Error fetching meals:', error);
    throw error;
  }
};

// Create a new meal
const createMeal = async (mealData) => {
  try {
    const response = await axios.post(`${BASE_URL}/meals`, mealData);
    return response.data;
  } catch (error) {
    console.error('Error creating meal:', error);
    throw error;
  }
};

// Update an existing meal
const updateMeal = async (mealId, updatedData) => {
  try {
    const response = await axios.put(`${BASE_URL}/meals/${mealId}`, updatedData);
    return response.data;
  } catch (error) {
    console.error('Error updating meal:', error);
    throw error;
  }
};

// Delete a meal
const deleteMeal = async (mealId) => {
  try {
    const response = await axios.delete(`${BASE_URL}/meals/${mealId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting meal:', error);
    throw error;
  }
};

export default function MealPage() {
  const [meals, setMeals] = useState([]);
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');
  const [mealTime, setMealTime] = useState('Breakfast');

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    try {
      const response = await getMeals();
      setMeals(response.meals); // Assuming meals are returned under "meals"
    } catch (error) {
      console.error('Error fetching meals:', error);
      Alert.alert('Error', 'Failed to fetch meals');
    }
  };

  const handleAddMeal = async () => {
    try {
      const newMeal = {
        name: mealName,
        calories,
        protein,
        carbs,
        fats,
        mealTime,
      };

      await createMeal(newMeal);
      Alert.alert('Success', 'Meal added successfully');
      fetchMeals(); // Refresh the meal list
      resetForm(); // Clear the form fields
    } catch (error) {
      console.error('Error adding meal:', error);
      Alert.alert('Error', 'Failed to add meal');
    }
  };

  const handleUpdateMeal = async (mealId) => {
    try {
      const updatedMeal = {
        name: mealName,
        calories,
        protein,
        carbs,
        fats,
        mealTime,
      };

      await updateMeal(mealId, updatedMeal);
      Alert.alert('Success', 'Meal updated successfully');
      fetchMeals(); // Refresh the meal list
      resetForm(); // Clear the form fields
    } catch (error) {
      console.error('Error updating meal:', error);
      Alert.alert('Error', 'Failed to update meal');
    }
  };

  const handleDeleteMeal = async (mealId) => {
    try {
      await deleteMeal(mealId);
      Alert.alert('Success', 'Meal deleted successfully');
      fetchMeals(); // Refresh the meal list
    } catch (error) {
      console.error('Error deleting meal:', error);
      Alert.alert('Error', 'Failed to delete meal');
    }
  };

  const resetForm = () => {
    setMealName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFats('');
    setMealTime('Breakfast');
  };

  return (
    <ScrollView className="p-4 bg-gray-800">
      <Text className="text-2xl font-bold text-white mb-6">Meal Tracker</Text>

      {/* Add Meal Form */}
      <View className="bg-gray-900 p-6 rounded-lg shadow-lg mb-6">
        <Text className="text-lg text-white mb-2">Add a new meal</Text>
        <TextInput
          value={mealName}
          onChangeText={setMealName}
          placeholder="Meal Name"
          placeholderTextColor="#aaa"
          className="text-white p-3 rounded mb-4 bg-gray-700"
        />
        <TextInput
          value={calories}
          onChangeText={setCalories}
          keyboardType="numeric"
          placeholder="Calories"
          placeholderTextColor="#aaa"
          className="text-white p-3 rounded mb-4 bg-gray-700"
        />
        <TextInput
          value={protein}
          onChangeText={setProtein}
          keyboardType="numeric"
          placeholder="Protein"
          placeholderTextColor="#aaa"
          className="text-white p-3 rounded mb-4 bg-gray-700"
        />
        <TextInput
          value={carbs}
          onChangeText={setCarbs}
          keyboardType="numeric"
          placeholder="Carbs"
          placeholderTextColor="#aaa"
          className="text-white p-3 rounded mb-4 bg-gray-700"
        />
        <TextInput
          value={fats}
          onChangeText={setFats}
          keyboardType="numeric"
          placeholder="Fats"
          placeholderTextColor="#aaa"
          className="text-white p-3 rounded mb-4 bg-gray-700"
        />
        <View className="flex-row justify-between">
          <TouchableOpacity
            onPress={handleAddMeal}
            className="bg-indigo-600 px-6 py-2 rounded-md"
          >
            <Text className="text-white font-semibold">Add Meal</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Meal List */}
      <Text className="text-lg text-white mb-4">Your Meals</Text>
      {meals.map((meal) => (
        <View key={meal.id} className="bg-gray-900 p-4 rounded-lg shadow-lg mb-4">
          <Text className="text-white text-xl">{meal.name}</Text>
          <Text className="text-gray-400">{meal.meal_time}</Text>
          <Text className="text-white">Calories: {meal.calories}</Text>
          <Text className="text-white">Protein: {meal.protein}g</Text>
          <Text className="text-white">Carbs: {meal.carbs}g</Text>
          <Text className="text-white">Fats: {meal.fats}g</Text>

          <View className="flex-row justify-between mt-4">
            <TouchableOpacity
              onPress={() => handleUpdateMeal(meal.id)}
              className="bg-indigo-600 px-4 py-2 rounded-md"
            >
              <Text className="text-white font-semibold">Update</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleDeleteMeal(meal.id)}
              className="bg-red-600 px-4 py-2 rounded-md"
            >
              <Text className="text-white font-semibold">Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

