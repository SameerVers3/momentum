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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { styled } from "nativewind";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledLinearGradient = styled(LinearGradient);



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
      <StyledView className="flex-1 bg-[#0F0F14] items-center justify-center">
        <ActivityIndicator size="large" color="#4F46E5" />
      </StyledView>
    );
  }

  return (
    <StyledView className="flex-1 bg-[#0F0F14]">
      <StatusBar barStyle="light-content" />
      <SafeAreaView className="flex-1">
        <ScrollView className="flex-1">
          {/* Hero Section */}
          <StyledView className="px-6 pt-12 pb-20 relative">
            {/* Back Button and Title */}
            <StyledView className="flex-row items-center justify-between mb-8">
              <StyledTouchableOpacity
                onPress={() => router.replace("/(tabs)/profile")}
                className="bg-[#1F1F28] p-2 rounded-full"
              >
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              </StyledTouchableOpacity>
              <StyledView className="bg-[#1F1F28] p-3 rounded-full">
                <Ionicons name="person" size={24} color="#4F46E5" />
              </StyledView>
            </StyledView>

            <StyledView className="mb-6">
              <StyledText className="text-white/70 text-lg mb-1">
                Edit Profile
              </StyledText>
              <StyledText className="text-white font-bold text-3xl">
                {formData.name || "Your Name"}
              </StyledText>
            </StyledView>

            {/* Quick Stats */}
            <StyledView className="flex-row justify-between">
              <StyledView className="bg-[#1F1F28] px-4 py-3 rounded-2xl flex-1 mr-3">
                <StyledView className="flex-row items-center">
                  <StyledView className="bg-[#2C2C3E] p-2 rounded-lg mr-3">
                    <Ionicons name="body-outline" size={18} color="#4F46E5" />
                  </StyledView>
                  <StyledView>
                    <StyledText className="text-white/70 text-sm">Weight</StyledText>
                    <StyledText className="text-white font-medium">
                      {formData.current_weight || "0"} kg
                    </StyledText>
                  </StyledView>
                </StyledView>
              </StyledView>
              <StyledView className="bg-[#1F1F28] px-4 py-3 rounded-2xl flex-1">
                <StyledView className="flex-row items-center">
                  <StyledView className="bg-[#2C2C3E] p-2 rounded-lg mr-3">
                    <Ionicons name="resize-outline" size={18} color="#4F46E5" />
                  </StyledView>
                  <StyledView>
                    <StyledText className="text-white/70 text-sm">Height</StyledText>
                    <StyledText className="text-white font-medium">
                      {formData.current_height || "0"} cm
                    </StyledText>
                  </StyledView>
                </StyledView>
              </StyledView>
            </StyledView>
          </StyledView>

          {/* Main Content */}
          <StyledView className="px-4 -mt-8">
            {/* Form Card */}
            <StyledView className="bg-[#1F1F28] p-6 rounded-2xl shadow-lg border border-gray-800/50">
              {/* Name & Email Section */}
              <StyledView className="mb-6">
                <StyledText className="text-white/70 text-sm mb-2">Personal Info</StyledText>
                <StyledView className="space-y-4">
                  <StyledView>
                    <StyledText className="text-[#9CA3AF] text-sm mb-2">Full Name</StyledText>
                    <TextInput
                      className="bg-[#2C2C3E] text-white p-4 rounded-xl"
                      placeholderTextColor="#9CA3AF"
                      value={formData.name}
                      onChangeText={(text) => handleInputChange("name", text)}
                    />
                  </StyledView>
                  <StyledView>
                    <StyledText className="text-[#9CA3AF] text-sm mb-2">Email</StyledText>
                    <TextInput
                      className="bg-[#2C2C3E] text-white p-4 rounded-xl"
                      placeholderTextColor="#9CA3AF"
                      value={formData.email}
                      onChangeText={(text) => handleInputChange("email", text)}
                    />
                  </StyledView>
                </StyledView>
              </StyledView>

              {/* Personal Details Section */}
              <StyledView className="mb-6">
                <StyledText className="text-white/70 text-sm mb-2">Personal Details</StyledText>
                <StyledView className="space-y-4">
                  {/* Gender Selection */}
                  <StyledTouchableOpacity 
                    onPress={() => setGenderModalVisible(true)}
                    className="bg-[#2C2C3E] p-4 rounded-xl flex-row justify-between items-center"
                  >
                    <StyledView>
                      <StyledText className="text-[#9CA3AF] text-sm mb-1">Gender</StyledText>
                      <StyledText className="text-white">{formData.gender || "Select Gender"}</StyledText>
                    </StyledView>
                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                  </StyledTouchableOpacity>

                  {/* Date of Birth */}
                  <StyledTouchableOpacity 
                    onPress={() => setShowDatePicker(true)}
                    className="bg-[#2C2C3E] p-4 rounded-xl flex-row justify-between items-center"
                  >
                    <StyledView>
                      <StyledText className="text-[#9CA3AF] text-sm mb-1">Date of Birth</StyledText>
                      <StyledText className="text-white">{formData.date_of_birth || "Select Date"}</StyledText>
                    </StyledView>
                    <Ionicons name="calendar-outline" size={20} color="#9CA3AF" />
                  </StyledTouchableOpacity>
                </StyledView>
              </StyledView>

              {/* Measurements Section */}
              <StyledView className="mb-6">
                <StyledText className="text-white/70 text-sm mb-2">Body Measurements</StyledText>
                <StyledView className="flex-row space-x-4">
                  <StyledView className="flex-1">
                    <StyledText className="text-[#9CA3AF] text-sm mb-2">Height (cm)</StyledText>
                    <TextInput
                      className="bg-[#2C2C3E] text-white p-4 rounded-xl"
                      keyboardType="numeric"
                      value={formData.current_height}
                      onChangeText={(text) => handleInputChange("current_height", text)}
                    />
                  </StyledView>
                  <StyledView className="flex-1">
                    <StyledText className="text-[#9CA3AF] text-sm mb-2">Weight (kg)</StyledText>
                    <TextInput
                      className="bg-[#2C2C3E] text-white p-4 rounded-xl"
                      keyboardType="numeric"
                      value={formData.current_weight}
                      onChangeText={(text) => handleInputChange("current_weight", text)}
                    />
                  </StyledView>
                </StyledView>
              </StyledView>

              {/* Goal Selection */}
              <StyledView className="mb-6">
                <StyledText className="text-white/70 text-sm mb-2">Fitness Goal</StyledText>
                <StyledTouchableOpacity 
                  onPress={() => setGoalModalVisible(true)}
                  className="bg-[#2C2C3E] p-4 rounded-xl flex-row justify-between items-center"
                >
                  <StyledView>
                    <StyledText className="text-[#9CA3AF] text-sm mb-1">Goal</StyledText>
                    <StyledText className="text-white">{formData.goal || "Select Goal"}</StyledText>
                  </StyledView>
                  <Ionicons name="trophy-outline" size={20} color="#9CA3AF" />
                </StyledTouchableOpacity>
              </StyledView>
            </StyledView>

            {/* Update Button */}
            <StyledTouchableOpacity
              onPress={handleUpdateProfile}
              disabled={updating}
              className="bg-[#4F46E5] p-4 rounded-xl flex-row items-center justify-center mt-6 mb-8"
            >
              {updating ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="save-outline" size={20} color="#FFFFFF" />
                  <StyledText className="text-white font-semibold ml-2">
                    Save Changes
                  </StyledText>
                </>
              )}
            </StyledTouchableOpacity>
          </StyledView>
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
    </StyledView>
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
