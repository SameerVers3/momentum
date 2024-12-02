import { Slot, SplashScreen, Stack } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import { router } from 'expo-router';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(null);
  const [error, setError] = useState(null);

  // Load custom fonts
  const [fontsLoaded, fontError] = useFonts({
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
  });

  // Verify user session
  const verifySession = useCallback(async (token) => {
    try {
      const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/auth/verifysession`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data;
    } catch (err) {
      console.error('Session verification error:', err);
      return false;
    }
  }, []);

  // Check user login status
  const checkLoginStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      // Ensure fonts are loaded
      if (!fontsLoaded) {
        return;
      }

      // Get user token from storage
      const userToken = await AsyncStorage.getItem('userToken');

      if (userToken) {
        // Verify the session
        const data = await verifySession(userToken);
        console.log(data);
        if (data.success === true) {
          console.log("User is logged in");
          const user = data.user;
          if (user.status === 'not verified') {
            console.log("User is not verified");
            setIsVerified(false);
          }
          setIsLoggedIn(true);
        } else {
          // Invalid token, clear it
          await AsyncStorage.removeItem('userToken');
          setIsLoggedIn(false);
        }
      } else {
        // No token found
        setIsLoggedIn(false);
      }
    } catch (err) {
      console.error('Login status check error:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, verifySession]);

  // Effect to handle login status check
  useEffect(() => {
    checkLoginStatus();
  }, [checkLoginStatus]);

  // Handle font loading errors
  useEffect(() => {
    if (fontError) {
      console.error('Font loading error:', fontError);
      setError(fontError);
      SplashScreen.hideAsync();
    }
  }, [fontError]);

  // Navigation effect
  useEffect(() => {
    if (!isVerified && isLoggedIn === true) {
      console.log("User is not verified, redirecting to verification screen...");
      try {
        router.replace('/(auth)/userprofile')
      } catch (err) {
        console.error('Navigation error:', err);
      }
      return;
    }
    if (isLoggedIn === true) {
      try {
        router.replace('/(tabs)/profile')
      } catch (err) {
        console.error('Navigation error:', err);
      }
    } else if (isLoggedIn === false) {
      try {
        router.replace('/');
      } catch (err) {
        console.error('Navigation error:', err);
      }
    }
  }, [isLoggedIn]);

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Checking authentication...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
      </View>
    );
  }

  // Main layout rendering
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Slot />
    </Stack>
  );
};

export default RootLayout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 20,
  },
});