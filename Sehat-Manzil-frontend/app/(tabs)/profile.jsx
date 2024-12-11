import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from 'expo-router';
import { styled } from "nativewind";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledLinearGradient = styled(LinearGradient);

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

const ProfileScreen = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const authToken = await AsyncStorage.getItem("userToken");
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/user/profile`,
        {
          headers: { Authorization: `Bearer ${authToken}` }
        }
      );
      console.log(response.data);

      if (response.data.success) {
        setProfile(response.data.data);
      }
    } catch (error) {
      Alert.alert("Error", "Could not fetch profile");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserProfile(); // Fetch profile data again
    setRefreshing(false);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userToken");
      router.replace("/(auth)/Login");
    } catch (error) {
      Alert.alert("Error", "Failed to log out");
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
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4F46E5" />
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
              className="h-full p-6 justify-end"
            >
              {/* Profile Header */}
              <StyledView className="flex-row items-center justify-between mb-6">
                <StyledView>
                  <StyledText className="text-white/70 text-lg mb-1">
                    Welcome back
                  </StyledText>
                  <StyledText className="text-white font-bold text-3xl">
                    {profile?.name || "Anonymous User"}
                  </StyledText>
                </StyledView>
                <StyledView className="bg-black/30 p-6 rounded-3xl">
                  <Ionicons name="person" size={48} color="#FFFFFF" />
                </StyledView>
              </StyledView>

              {/* Stats Row */}
              <StyledView className="flex-row items-center flex-wrap gap-2">
                <StyledView className="bg-black/30 px-3 py-1 rounded-full flex-row items-center">
                  <Ionicons name="body-outline" size={16} color="#FFFFFF" />
                  <StyledText className="text-white ml-1">
                    {profile?.current_weight || "0"} kg
                  </StyledText>
                </StyledView>
                <StyledView className="bg-black/30 px-3 py-1 rounded-full flex-row items-center">
                  <Ionicons name="resize-outline" size={16} color="#FFFFFF" />
                  <StyledText className="text-white ml-1">
                    {profile?.current_height || "0"} cm
                  </StyledText>
                </StyledView>
                <StyledView className="bg-black/30 px-3 py-1 rounded-full flex-row items-center">
                  <Ionicons name="trophy-outline" size={16} color="#FFFFFF" />
                  <StyledText className="text-white ml-1">
                    {profile?.goal || "No Goal"}
                  </StyledText>
                </StyledView>
              </StyledView>
            </LinearGradient>
          </StyledLinearGradient>

          {/* Main Content */}
          <StyledView className="px-4 -mt-8">
            {/* Profile Card */}
            <StyledView className="bg-[#1F1F28] p-4 rounded-2xl shadow-lg border border-gray-800/50 mb-6">
              <StyledView className="flex-row items-center mb-4">
                <StyledView className="bg-[#2C2C3E] p-3 rounded-full mr-4">
                  <Ionicons name="mail-outline" size={20} color="#4F46E5" />
                </StyledView>
                <StyledView>
                  <StyledText className="text-[#9CA3AF] text-sm">Email</StyledText>
                  <StyledText className="text-white">{profile?.email}</StyledText>
                </StyledView>
              </StyledView>

              <StyledView className="flex-row items-center">
                <StyledView className="bg-[#2C2C3E] p-3 rounded-full mr-4">
                  <Ionicons name="trophy-outline" size={20} color="#4F46E5" />
                </StyledView>
                <StyledView>
                  <StyledText className="text-[#9CA3AF] text-sm">Goal</StyledText>
                  <StyledText className="text-white">{profile?.goal || "Not set"}</StyledText>
                </StyledView>
              </StyledView>
            </StyledView>

            {/* Menu Sections */}
            <StyledText className="text-white text-xl font-bold mb-4">
              Settings
            </StyledText>

            {/* Account Settings */}
            <StyledView className="bg-[#1F1F28] rounded-2xl mb-4">
              <StyledTouchableOpacity 
                className="p-4 flex-row items-center justify-between border-b border-gray-800"
                onPress={() => router.replace("/(screen)/profile")}
              >
                <StyledView className="flex-row items-center">
                  <StyledView className="bg-[#2C2C3E] p-2 rounded-xl mr-3">
                    <Ionicons name="person-outline" size={20} color="#4F46E5" />
                  </StyledView>
                  <StyledText className="text-white">Personal Information</StyledText>
                </StyledView>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </StyledTouchableOpacity>

              <StyledTouchableOpacity 
                className="p-4 flex-row items-center justify-between"
                onPress={() => router.replace("/(screen)/progress")}
              >
                <StyledView className="flex-row items-center">
                  <StyledView className="bg-[#2C2C3E] p-2 rounded-xl mr-3">
                    <Ionicons name="stats-chart" size={20} color="#4F46E5" />
                  </StyledView>
                  <StyledText className="text-white">Fitness Progress</StyledText>
                </StyledView>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </StyledTouchableOpacity>
            </StyledView>

            {/* Other Settings */}
            <StyledView className="bg-[#1F1F28] rounded-2xl mb-6">
              <StyledTouchableOpacity 
                className="p-4 flex-row items-center justify-between border-b border-gray-800"
                onPress={() => router.replace("/(screen)/privacy")}
              >
                <StyledView className="flex-row items-center">
                  <StyledView className="bg-[#2C2C3E] p-2 rounded-xl mr-3">
                    <Ionicons name="lock-closed-outline" size={20} color="#4F46E5" />
                  </StyledView>
                  <StyledText className="text-white">Privacy Settings</StyledText>
                </StyledView>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </StyledTouchableOpacity>

              <StyledTouchableOpacity 
                className="p-4 flex-row items-center justify-between"
                onPress={() => router.replace("/(screen)/about")}
              >
                <StyledView className="flex-row items-center">
                  <StyledView className="bg-[#2C2C3E] p-2 rounded-xl mr-3">
                    <Ionicons name="information-circle-outline" size={20} color="#4F46E5" />
                  </StyledView>
                  <StyledText className="text-white">About the Devs</StyledText>
                </StyledView>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </StyledTouchableOpacity>
            </StyledView>

            {/* Logout Button */}
            <StyledTouchableOpacity
              onPress={handleLogout}
              className="bg-[#1F1F28] p-4 rounded-2xl flex-row items-center justify-center mb-8 mb-20"
            >
              <Ionicons name="log-out-outline" size={20} color="#FF4545" />
              <StyledText className="text-[#FF4545] font-semibold ml-2">
                Logout
              </StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        </ScrollView>
      </SafeAreaView>
    </StyledView>
  );
};

export default ProfileScreen;
