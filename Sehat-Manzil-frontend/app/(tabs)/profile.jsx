import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Switch,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Alert,
  ActivityIndicator
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from "expo-linear-gradient";
import { router } from 'expo-router';

const { width } = Dimensions.get("window");

const ProfileScreen = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);


  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userToken");
      router.replace("/(auth)/Login");
    } catch (error) {
      Alert.alert("Error", "Failed to log out");
    }
  };

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

  const ProfileStatCard = ({ label, value, icon }) => (
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
        shadowOffset: { width: 0, height: 4 }
      }}
    >
      <Ionicons name={icon} size={28} color="#4F46E5" />
      <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18, marginTop: 8 }}>{value}</Text>
      <Text style={{ color: "#9CA3AF", fontSize: 12 }}>{label}</Text>
    </Animatable.View>
  );

  const ProfileMenuItem = ({ icon, title, onPress }) => (
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
        shadowOffset: { width: 0, height: 4 }
      }}
    >
      <Ionicons name={icon} size={24} color="#4F46E5" />
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
              borderBottomRightRadius: 40
            }}
          >
            <View style={{ alignItems: "center" }}>
              <Image
                source={{ uri: profile?.image_url || "https://via.placeholder.com/150" }}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  borderWidth: 4,
                  borderColor: "#fff",
                  marginBottom: 16
                }}
              />
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 24 }}>
                {profile?.name || "Anonymous User"}
              </Text>
              <Text style={{ color: "#E5E5E5", marginTop: 4 }}>{profile?.email}</Text>
            </View>
          </LinearGradient>

          {/* Profile Stats */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 16 }}>
            <ProfileStatCard label="Height" value={`${profile?.current_height || "0"} cm`} icon="fitness" />
            <ProfileStatCard label="Weight" value={`${profile?.current_weight || "0"} kg`} icon="body" />
            <ProfileStatCard label="Goal" value={profile?.goal || "N/A"} icon="trophy" />
          </ScrollView>

          {/* Profile Sections */}
          <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
            <Text style={{ color: "#9CA3AF", marginBottom: 8 }}>Account</Text>
            <ProfileMenuItem
              icon="person"
              title="Personal Information"
              onPress={() => router.replace("/(screen)/profile")}
            />
            <ProfileMenuItem icon="stats-chart" title="Fitness Progress" onPress={() => router.replace("/(screen)/progress")} />
          </View>

          <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
            <Text style={{ color: "#9CA3AF", marginBottom: 8 }}>Settings</Text>
            <ProfileMenuItem icon="lock-closed" title="Privacy" onPress={() =>  router.replace("/(screen)/privacy")} />
            <ProfileMenuItem icon="help-circle" title="About the Devs " onPress={() =>  router.replace("/(screen)/about")} />  
          </View>

          <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
            <TouchableOpacity
              onPress={handleLogout}
              style={{
                backgroundColor: "#4F46E5",
                borderRadius: 15,
                padding: 16,
                margin: 16,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default ProfileScreen;
