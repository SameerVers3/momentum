import React, { useState, useEffect } from "react";
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
  Modal,
  TextInput
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from "expo-linear-gradient";
import { router } from 'expo-router';

const { width } = Dimensions.get("window");

const ExercisePage = () => {
  const [exercises, setExercises] = useState([]);
  const [workouts, setWorkouts] = useState([]); // State for workouts
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [workoutModalVisible, setWorkoutModalVisible] = useState(false); // Workout modal visibility
  const [exercise, setExercise] = useState({
    name: "",
    muscle_group: "",
    sets: 1,
    reps: 1,
    workout_id: "",
  });
  const [searchText, setSearchText] = useState(""); // Added state for search bar

  useEffect(() => {
    fetchExercises();
    fetchWorkouts(); // Fetch workouts when the component mounts
  }, []);

  const fetchExercises = async () => {
    try {
      const authToken = await AsyncStorage.getItem("userToken");
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/exercise/`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      setExercises(Array.isArray(response.data.exercises) ? response.data.exercises : []);
    } catch (error) {
      Alert.alert("Error", "Could not fetch exercises");
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkouts = async () => {
    try {
      const authToken = await AsyncStorage.getItem("userToken");
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/workouts/`, // Assuming this is the endpoint for workouts
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      setWorkouts(response.data.workouts || []);
    } catch (error) {
      Alert.alert("Error", "Could not fetch workouts");
    }
  };

  const handleExerciseSubmit = async () => {
    if (!exercise.name || !exercise.workout_id) {
      Alert.alert("Error", "Name and workout ID are required.");
      return;
    }
    try {
      const authToken = await AsyncStorage.getItem("userToken");
      await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/exercises/create`,
        exercise,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      Alert.alert("Success", "Exercise created successfully");
      fetchExercises(); // Refresh exercise list
      setModalVisible(false);
    } catch (error) {
      Alert.alert("Error", "Failed to create exercise");
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userToken");
      router.replace("/(auth)/Login");
    } catch (error) {
      Alert.alert("Error", "Failed to log out");
    }
  };

  const filteredExercises = exercises.filter(exercise =>
    exercise.name.toLowerCase().includes(searchText.toLowerCase()) ||
    exercise.muscle_group.toLowerCase().includes(searchText.toLowerCase())
  );

  const ExerciseStatCard = ({ label, value, icon }) => (
    <Animatable.View
      animation="fadeInUp"
      duration={800}
      style={{
        backgroundColor: "#1F1F28",
        borderRadius: 15,
        padding: 16,
        alignItems: "center",
        marginHorizontal: 10,
        width: width * 0.3,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 4 },
      }}
    >
      <Ionicons name={icon} size={28} color="#4F46E5" />
      <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18, marginTop: 8 }}>{value}</Text>
      <Text style={{ color: "#9CA3AF", fontSize: 12 }}>{label}</Text>
    </Animatable.View>
  );

  const ExerciseMenuItem = ({ title, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1F1F28",
        borderRadius: 15,
        padding: 16,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 4 },
      }}
    >
      <Ionicons name="fitness" size={24} color="#4F46E5" />
      <Text style={{ color: "#fff", marginLeft: 16, flex: 1 }}>{title}</Text>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0F0F14", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#0F0F14" }}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView className="mb-16">
        <ScrollView>
          {/* Profile Header */}
          <LinearGradient
            colors={["#4F46E5", "#302F4E"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              alignItems: "center",
              paddingVertical: 40,
              borderBottomLeftRadius: 40,
              borderBottomRightRadius: 40,
            }}
          >
            <View style={{ alignItems: "center" }}>
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 24 }}>
                Exercise Page
              </Text>
            </View>
          </LinearGradient>

          {/* Search Bar */}
          <View style={{ marginTop: 16, marginHorizontal: 16 }}>
            <TextInput
              style={{
                backgroundColor: "#1F1F28",
                color: "#fff",
                padding: 12,
                borderRadius: 8,
                fontSize: 16,
                marginBottom: 16,
              }}
              placeholder="Search exercises..."
              placeholderTextColor="#9CA3AF"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          {/* Exercise Menu */}
          <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
            <Text style={{ color: "#9CA3AF", marginBottom: 8 }}>Exercise Management</Text>
            <ExerciseMenuItem
              title="Add New Exercise"
              onPress={() => setModalVisible(true)}
            />
            {/* Other menu items can be added here */}
          </View>

        </ScrollView>
      </SafeAreaView>

      {/* Floating Button */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={{
          position: "absolute",
          bottom: 100,
          right: 30,
          backgroundColor: "#4F46E5",
          borderRadius: 50,
          padding: 16,
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowOffset: { width: 0, height: 4 },
        }}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Modal for Adding New Exercise */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-opacity-70">
          <View className="w-4/5 p-4 bg-transparent bg-gray-900 border border-gray-700 rounded-lg">
            <Text className="text-xl font-bold text-white mb-4">Add New Exercise</Text>

            <TextInput
              className="border p-2 mb-4 rounded bg-transparent text-white"
              placeholder="Exercise Name"
              placeholderTextColor="#9CA3AF"
              value={exercise.name}
              onChangeText={(text) => setExercise({ ...exercise, name: text })}
            />
            <TextInput
              className="border p-2 mb-4 rounded bg-transparent text-white"
              placeholder="Muscle Group"
              placeholderTextColor="#9CA3AF"
              value={exercise.muscle_group}
              onChangeText={(text) => setExercise({ ...exercise, muscle_group: text })}
            />
            <TextInput
              className="border p-2 mb-4 rounded bg-transparent text-white"
              placeholder="Sets"
              placeholderTextColor="#9CA3AF"
              value={exercise.sets.toString()}
              onChangeText={(text) => setExercise({ ...exercise, sets: parseInt(text) })}
              keyboardType="numeric"
            />
            <TextInput
              className="border p-2 mb-4 rounded bg-transparent text-white"
              placeholder="Reps"
              placeholderTextColor="#9CA3AF"
              value={exercise.reps.toString()}
              onChangeText={(text) => setExercise({ ...exercise, reps: parseInt(text) })}
              keyboardType="numeric"
            />

            {/* Workout Selection Button */}
            <TouchableOpacity
              onPress={() => setWorkoutModalVisible(true)} // Show workout modal
              style={{
                backgroundColor: "#4F46E5",
                borderRadius: 15,
                padding: 16,
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
                Select Workout
              </Text>
            </TouchableOpacity>

            {/* Save Exercise */}
            <TouchableOpacity
              onPress={handleExerciseSubmit}
              style={{
                backgroundColor: "#4F46E5",
                borderRadius: 15,
                padding: 16,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
                Save Exercise
              </Text>
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{
                backgroundColor: "#E5E5E5",
                borderRadius: 15,
                padding: 16,
                alignItems: "center",
                marginTop: 8,
              }}
            >
              <Text style={{ color: "#000", fontWeight: "bold", fontSize: 16 }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Workout Selection Modal */}
      <Modal
        transparent={true}
        visible={workoutModalVisible}
        animationType="slide"
        onRequestClose={() => setWorkoutModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.7)" }}>
          <View style={{
            width: width * 0.8,
            padding: 20,
            backgroundColor: "#1F1F28",
            borderRadius: 10,
          }}>
            <Text style={{ color: "#fff", fontSize: 20, marginBottom: 10, textAlign: "center" }}>Select Workout</Text>
            <ScrollView>
              {workouts.map((workout) => (
                <TouchableOpacity
                  key={workout.workout_id}
                  style={{
                    padding: 12,
                    backgroundColor: "#302F4E",
                    borderRadius: 8,
                    marginBottom: 8,
                  }}
                  onPress={() => {
                    setExercise({ ...exercise, workout_id: workout.workout_id });
                    setWorkoutModalVisible(false);
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 16 }}>
                    {workout.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setWorkoutModalVisible(false)}
              style={{
                backgroundColor: "#4F46E5",
                borderRadius: 15,
                padding: 12,
                alignItems: "center",
                marginTop: 16,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 16 }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ExercisePage;
