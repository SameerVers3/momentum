import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

const AuthLayout = () => {
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false, // Hide headers for all screens
          // animation: "slide_from_right", // Default transition animation
          // gestureEnabled: true, // Enable swipe gestures
          animation: "none"
        }}
      >
        <Stack.Screen name="Login" />
        <Stack.Screen name="Registration1" />
        <Stack.Screen name="usergoals" />
        <Stack.Screen name="userprofile" />
        <Stack.Screen name="welcome" />
      </Stack>
      <StatusBar backgroundColor="#2A2C38" style="light" />
    </>
  );
};

export default AuthLayout;
