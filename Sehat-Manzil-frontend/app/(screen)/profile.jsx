import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Modal,
  FlatList,
  Dimensions
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";

const { width } = Dimensions.get("window");

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    gender: "",
    date_of_birth: "",
    current_height: "",
    current_weight: "",
    goal: "",
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [genderModalVisible, setGenderModalVisible] = useState(false);
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const genderOptions = ["Male", "Female", "Other"];
  const goalOptions = ["Improve Shape", "Lean & Tone", "Lose Fat"];

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const authToken = await AsyncStorage.getItem("userToken");
      if (!authToken) {
        Alert.alert("Error", "No authentication token found.");
        return;
      }

      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/user/profile`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      if (response.data.success) {
        setProfile(response.data.data);
        setFormData({
          name: response.data.data.name,
          email: response.data.data.email,
          gender: response.data.data.gender || "",
          date_of_birth: formateDate(response.data.data.date_of_birth) || "",
          current_height: response.data.data.current_height.toString(),
          current_weight: response.data.data.current_weight.toString(),
          goal: response.data.data.goal,
        });
      }
    } catch (error) {
      Alert.alert("Error", "Could not fetch profile");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || formData.date_of_birth;
    setShowDatePicker(false);
    const formattedDate = formateDate(currentDate);
    handleInputChange("date_of_birth", formattedDate);
  };

  const formateDate = (date) => {
    const dateObj = new Date(date);
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleGenderSelect = (selectedGender) => {
    handleInputChange("gender", selectedGender);
    setGenderModalVisible(false);
  };

  const handleGoalSelect = (selectedGoal) => {
    handleInputChange("goal", selectedGoal);
    setGoalModalVisible(false);
  };

  const handleUpdateProfile = async () => {
    const { name, email, gender, date_of_birth, current_height, current_weight, goal } = formData;

    // Validate if all fields are filled
    if (!name || !email || !gender || !date_of_birth || !current_height || !current_weight || !goal) {
      Alert.alert("Error", "All fields are required.");
      return;
    }

    // Validate that height and weight are numeric
    if (isNaN(current_height) || isNaN(current_weight)) {
      Alert.alert("Error", "Height and Weight must be numeric.");
      return;
    }

    try {
      setUpdating(true);
      const authToken = await AsyncStorage.getItem("userToken");
      if (!authToken) {
        Alert.alert("Error", "No authentication token found.");
        return;
      }

      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/user/profile`,
        {
          name,
          email,
          gender,
          date_of_birth, // Ensure DD-MM-YYYY format
          height: current_height,  // Ensure numeric values
          weight: current_weight,  // Ensure numeric values
          goal,
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      if (response.data.success) {
        Alert.alert("Success", "Profile updated successfully!");
        router.replace("/(tabs)/profile");
      } else {
        Alert.alert("Error", "Failed to update profile.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to update profile.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0F0F14", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#1F1F28" }}>
      <StatusBar barStyle="light-content" />
      <ScrollView style={{ padding: 20 }}>
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)/profile")}
          style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}
          className="mt-12"
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <Text style={{ marginLeft: 10, fontSize: 18, color: "#fff", fontWeight: "600" }}>Back</Text>
        </TouchableOpacity>

        <View style={{ alignItems: "center", marginBottom: 30 }}>
          <Ionicons name="person" size={100} color="#4F46E5" />
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 24, marginTop: 10 }}>Edit Profile</Text>
        </View>

        {/* Form Fields */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
          {/* Name Input */}
          <View style={{ width: "48%", marginBottom: 20 }}>
            <Text style={{ color: "#fff", fontSize: 16 }}>Full Name</Text>
            <TextInput
              style={inputStyle}
              placeholder="Enter your name"
              placeholderTextColor="#bbb"
              value={formData.name}
              onChangeText={(text) => handleInputChange("name", text)}
            />
          </View>

          {/* Email Input */}
          <View style={{ width: "48%", marginBottom: 20 }}>
            <Text style={{ color: "#fff", fontSize: 16 }}>Email</Text>
            <TextInput
              style={inputStyle}
              placeholder="Enter your email"
              placeholderTextColor="#bbb"
              value={formData.email}
              onChangeText={(text) => handleInputChange("email", text)}
            />
          </View>
        </View>

        {/* Gender Selection */}
        <Text style={{ color: "#fff", fontSize: 16, marginBottom: 8 }}>Gender</Text>
        <TouchableOpacity onPress={() => setGenderModalVisible(true)} style={selectButtonStyle}>
          <Text style={{ color: "#fff", fontSize: 16 }}>{formData.gender || "Select Gender"}</Text>
        </TouchableOpacity>

        {/* Goal Selection */}
        <Text style={{ color: "#fff", fontSize: 16, marginBottom: 8 }}>Goal</Text>
        <TouchableOpacity onPress={() => setGoalModalVisible(true)} style={selectButtonStyle}>
          <Text style={{ color: "#fff", fontSize: 16 }}>{formData.goal || "Select Goal"}</Text>
        </TouchableOpacity>

        {/* Date of Birth */}
        <Text style={{ color: "#fff", fontSize: 16, marginBottom: 8 }}>Date of Birth</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={selectButtonStyle}>
          <Text style={{ color: "#fff", fontSize: 16 }}>{formData.date_of_birth || "Select Date"}</Text>
        </TouchableOpacity>

        {/* Height and Weight */}
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          {/* Height */}
          <View style={{ width: "48%", marginBottom: 20 }}>
            <Text style={{ color: "#fff", fontSize: 16 }}>Current Height (cm)</Text>
            <TextInput
              style={inputStyle}
              keyboardType="numeric"
              value={formData.current_height}
              onChangeText={(text) => handleInputChange("current_height", text)}
            />
          </View>

          {/* Weight */}
          <View style={{ width: "48%", marginBottom: 20 }}>
            <Text style={{ color: "#fff", fontSize: 16 }}>Current Weight (kg)</Text>
            <TextInput
              style={inputStyle}
              keyboardType="numeric"
              value={formData.current_weight}
              onChangeText={(text) => handleInputChange("current_weight", text)}
            />
          </View>
        </View>

        {/* Update Button */}
        <TouchableOpacity
          style={updateButtonStyle}
          onPress={handleUpdateProfile}
          disabled={updating}
          className="mb-12"
        >
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "600" }}>
            {updating ? "Updating..." : "Update Profile"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Gender Modal */}
      <Modal
        visible={genderModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setGenderModalVisible(false)}
      >
        <TouchableOpacity style={modalOverlayStyle} onPress={() => setGenderModalVisible(false)}>
          <View style={modalContentStyle}>
            <FlatList
              data={genderOptions}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleGenderSelect(item)}
                  style={modalItemStyle}
                >
                  <Text style={{ color: "#fff", fontSize: 18 }}>{item}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Goal Modal */}
      <Modal
        visible={goalModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setGoalModalVisible(false)}
      >
        <TouchableOpacity style={modalOverlayStyle} onPress={() => setGoalModalVisible(false)}>
          <View style={modalContentStyle}>
            <FlatList
              data={goalOptions}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleGoalSelect(item)}
                  style={modalItemStyle}
                >
                  <Text style={{ color: "#fff", fontSize: 18 }}>{item}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={new Date(formData.date_of_birth)}
          mode="date"
          onChange={handleDateChange}
          display="spinner"
        />
      )}
    </SafeAreaView>
  );
};

const inputStyle = {
  backgroundColor: "#2A2A34", // Darker shade to match theme but less intense
  color: "#fff",
  padding: 16,
  borderRadius: 15,
  borderWidth: 1,
  borderColor: "#444", // Muted border to be less flashy
  marginBottom: 12,
};

const selectButtonStyle = {
  backgroundColor: "#2A2A34", // Matching dark theme
  borderWidth: 1,
  borderColor: "#444", // Subtle border for a more minimal look
  borderRadius: 15,
  padding: 16,
  marginBottom: 16,
  justifyContent: "center",
  alignItems: "center",
};

const updateButtonStyle = {
  backgroundColor: "#4F46E5", // Accent color for the button
  borderRadius: 15,
  paddingVertical: 16,
  paddingHorizontal: 30,
  alignItems: "center",
  justifyContent: "center"
};

const modalOverlayStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "rgba(0, 0, 0, 0.7)", // Subtle overlay for focus
};

const modalContentStyle = {
  backgroundColor: "#2A2A34", // Matching the dark shade
  borderRadius: 15,
  padding: 24,
  width: "80%",
};

const modalItemStyle = {
  padding: 12,
  borderBottomWidth: 1,
  borderBottomColor: "#444", // Subtle borders
};

export default ProfilePage;
