import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from 'expo-router';
import axios from 'axios';
import Constants from 'expo-constants';

const RegistrationScreen1 = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // Error state for each field
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    terms: ""
  });

  // Loading state for registration
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate phone number (11 digits only)
  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{11}$/;
    return phoneRegex.test(phone);
  };

  // Validate password strength
  const validatePassword = (password) => {
    return password.length >= 6;
  };

  // Handle registration submission
  const handleRegistration = async () => {
    setIsLoading(true);
    // Reset previous errors
    setErrors({
      name: "",
      email: "",
      phone: "",
      password: "",
      terms: ""
    });

    // Validation checks
    let isValid = true;
    const newErrors = { ...errors };

    // Name validation
    if (!name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    // Email validation
    if (!email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = "Invalid email format";
      isValid = false;
    }

    // Phone validation
    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
      isValid = false;
    } else if (!validatePhone(phone)) {
      newErrors.phone = "Phone must be 11 digits";
      isValid = false;
    }

    // Password validation
    if (!password.trim()) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (!validatePassword(password)) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    // Terms validation
    if (!acceptedTerms) {
      newErrors.terms = "You must accept the terms and conditions";
      isValid = false;
    }

    // Update errors
    setErrors(newErrors);

    // If all validations pass, proceed with registration
    if (isValid) {
      try {
        setIsLoading(true);
        
        // Get backend URL from environment variables
        const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
        
        if (!backendUrl) {
          throw new Error('Backend URL is not configured');
        }

        // Prepare registration data
        const registrationData = {
          name,
          email,
          password,
          role: 'user'  // Default role as specified in your backend
        };

        // Make API call
        const response = await axios.post(`${backendUrl}/auth/register`, registrationData);

        // Show success alert
        setModalMessage("Your account has been created successfully!");
        setIsSuccess(true);
        setModalVisible(true);

        // Reset form
        setName("");
        setEmail("");
        setPhone("");
        setPassword("");
        setAcceptedTerms(false);

      } catch (error) {
        // Handle errors
        if (axios.isAxiosError(error)) {
          // Backend validation errors
          if (error.response?.data?.errors) {
            const backendErrors = error.response.data.errors;
            const apiErrors = {
              name: backendErrors.find((e) => e.path[0] === 'name')?.message || "",
              email: backendErrors.find((e) => e.path[0] === 'email')?.message || "",
              password: backendErrors.find((e) => e.path[0] === 'password')?.message || "",
            };
            setErrors(prevErrors => ({...prevErrors, ...apiErrors}));
          } 
          
          // Generic error message
          setModalMessage(
            axios.isAxiosError(error) && error.response?.data?.message
              ? error.response.data.message
              : "An error occurred during registration"
          );
          setIsSuccess(false);
          setModalVisible(true);

        } else {
          // Network or other errors
          Alert.alert(
            "Error", 
            "An unexpected error occurred. Please try again."
          );
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
    >
      <SafeAreaView className="flex-1 bg-background">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="px-4 flex-1 justify-between py-5">
            {/* Header */}
            <View>
              <Text className="text-white text-lg text-center mt-12">
                Hey there,
              </Text>
              <Text className="text-white text-2xl text-center font-bold mb-8">
                Create an Account
              </Text>

              {/* Inputs */}
              <View className="space-y-3">
                {/* Name Input */}
                <View>
                  <View className="flex-row items-center bg-[#161818] rounded-xl p-3">
                    <Ionicons
                      name="person-outline"
                      size={22}
                      color="#9CA3AF"
                      style={{ marginRight: 8 }}
                    />
                    <TextInput
                      className="flex-1 text-white"
                      placeholder="Full Name"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="default"
                      value={name}
                      onChangeText={setName}
                    />
                  </View>
                  {errors.name ? (
                    <Text className="text-red-500 text-xs mt-1 ml-2">
                      {errors.name}
                    </Text>
                  ) : null}
                </View>

                {/* Phone Input */}
                <View>
                  <View className="flex-row items-center bg-[#161818] rounded-xl p-3">
                    <Ionicons
                      name="call-outline"
                      size={22}
                      color="#9CA3AF"
                      style={{ marginRight: 8 }}
                    />
                    <TextInput
                      className="flex-1 text-white"
                      placeholder="Phone Number"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="phone-pad"
                      value={phone}
                      onChangeText={(text) => {
                        // Only allow digits
                        const cleanedText = text.replace(/[^0-9]/g, '');
                        setPhone(cleanedText);
                      }}
                      maxLength={11}
                    />
                  </View>
                  {errors.phone ? (
                    <Text className="text-red-500 text-xs mt-1 ml-2">
                      {errors.phone}
                    </Text>
                  ) : null}
                </View>

                {/* Email Input */}
                <View>
                  <View className="flex-row items-center bg-[#161818] rounded-xl p-3">
                    <Ionicons
                      name="mail-outline"
                      size={22}
                      color="#9CA3AF"
                      style={{ marginRight: 8 }}
                    />
                    <TextInput
                      className="flex-1 text-white"
                      placeholder="Email"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="email-address"
                      value={email}
                      onChangeText={setEmail}
                    />
                  </View>
                  {errors.email ? (
                    <Text className="text-red-500 text-xs mt-1 ml-2">
                      {errors.email}
                    </Text>
                  ) : null}
                </View>

                {/* Password Input */}
                <View>
                  <View className="flex-row items-center bg-[#161818] rounded-xl p-3">
                    <Ionicons
                      name="lock-closed-outline"
                      size={22}
                      color="#9CA3AF"
                      style={{ marginRight: 8 }}
                    />
                    <TextInput
                      className="flex-1 text-white"
                      placeholder="Password"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Ionicons
                        name={showPassword ? "eye-off" : "eye"}
                        size={22}
                        color="#9CA3AF"
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.password ? (
                    <Text className="text-red-500 text-xs mt-1 ml-2">
                      {errors.password}
                    </Text>
                  ) : null}
                </View>

                {/* Terms Checkbox */}
                <View className="flex-row items-center">
                  <TouchableOpacity
                    onPress={() => setAcceptedTerms(!acceptedTerms)}
                    className="flex-row items-center"
                  >
                    <View
                      className={`w-4 h-4 border border-gray-500 rounded mr-2 ${
                        acceptedTerms ? "bg-indigo-600 border-indigo-600" : ""
                      }`}
                    />
                    <Text className="text-gray-300 text-sm">
                      By continuing, you accept our Privacy Policy and Terms of
                      Use
                    </Text>
                  </TouchableOpacity>
                </View>
                {errors.terms ? (
                  <Text className="text-red-500 text-xs mt-1 ml-2">
                    {errors.terms}
                  </Text>
                ) : null}
              </View>
            </View>

            {/* Buttons */}
            <View>
              {/* Register Button */}
              <TouchableOpacity 
                className="bg-indigo-600 rounded-full py-3 items-center mb-4 mt-8 flex-row justify-center"
                onPress={handleRegistration}
              >
                {
                  isLoading ? (
                    <>
                      <ActivityIndicator size="small" color="#FFF" />
                      <Ionicons
                        name="log-in-outline"
                        size={22}
                        color="white"
                        style={{ marginRight: 8 }}
                        />
                      <Text className="text-white font-bold text-lg">Register</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons
                        name="log-in-outline"
                        size={22}
                        color="white"
                        style={{ marginRight: 8 }}
                        />
                      <Text className="text-white font-bold text-lg">Register</Text>
                    </>
                  )
                }

              </TouchableOpacity>

              {/* Divider */}
              <Text className="text-gray-400 text-center mb-3">Or</Text>

              {/* Google Sign-In Button */}
              <View className="flex-row justify-center mb-4 space-x-3">
                <TouchableOpacity className="w-full py-3 bg-gray-700 rounded-full justify-center items-center flex-row">
                  <Ionicons
                    name="logo-google"
                    size={22}
                    color="white"
                    style={{ marginRight: 8 }}
                  />
                  <Text className="text-white text-lg">
                    Continue with Google
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Login Link */}
              <View className="flex-row justify-center mt-8">
                <Text className="text-gray-400 text-sm">
                  Already have an account?{" "}
                </Text>
                <TouchableOpacity onPress={() => router.replace('/Login')}>
                  <Text className="text-indigo-600 font-bold text-sm">
                    Login
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>

        <Modal
          transparent={true}
          animationType="fade"
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
            <View className="bg-[#1F1F1F] rounded-lg p-6 w-4/5">
              {/* Modal Icon */}
              <Ionicons
                name={isSuccess ? "checkmark-circle" : "close-circle"}
                size={40}
                color={isSuccess ? "#34D399" : "#F87171"}
                style={{ alignSelf: "center", marginBottom: 16 }}
              />
              
              {/* Modal Message */}
              <Text className="text-white text-center text-lg">
                {modalMessage}
              </Text>

              {/* Close Button */}
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="bg-indigo-600 rounded-full py-2 mt-4 w-full"
              >
                <Text className="text-white text-center font-bold">Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default RegistrationScreen1;