import React from "react";
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const PrivacyPage = () => {
  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      {/* Header with Back Button */}
      <View className="flex-row items-center px-4 mt-12 py-3 bg-gray-800">
        <TouchableOpacity onPress={() => router.replace('/(tabs)/profile')} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#4F46E5" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-lg">Privacy Policy</Text>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} className="px-4">
        <Text className="text-gray-200 text-lg font-bold mt-4 mb-2">Introduction</Text>
        <Text className="text-gray-400 text-base leading-6">
          At [Your App Name], we are committed to protecting your privacy. This page outlines how we 
          handle your personal data and ensure it is secure.
        </Text>

        {/* Data Collection Section */}
        <Text className="text-white text-lg font-bold mt-6 mb-2">Data Collection</Text>
        <Text className="text-gray-400 text-base leading-6">
          We collect personal data such as your name, email address, and usage statistics to provide 
          better services. Your data is never shared with third parties without your consent.
        </Text>

        {/* Security Section */}
        <Text className="text-white text-lg font-bold mt-6 mb-2">Security</Text>
        <Text className="text-gray-400 text-base leading-6">
          All your data is encrypted and stored securely on our servers. We employ industry-standard 
          measures to prevent unauthorized access.
        </Text>

        {/* Contact Section */}
        <Text className="text-white text-lg font-bold mt-6 mb-2">Contact Us</Text>
        <Text className="text-gray-400 text-base leading-6">
          If you have any questions about this Privacy Policy, please contact us at 
          <Text className="text-blue-500"> support@yourapp.com</Text>.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacyPage;
