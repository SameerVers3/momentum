import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { View, Text,TouchableOpacity, SafeAreaView, ScrollView, Image } from "react-native";
import { router } from "expo-router";

const AboutDevelopersPage = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0F0F14", marginTop: '20px' }}>
      <View className="flex-row items-center px-4 py-3 mt-12 bg-gray-800">
        <TouchableOpacity onPress={() => router.replace('/(tabs)/profile')} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#4F46E5" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-lg">Privacy Policy</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Header */}
        <Text style={{ color: "#fff", fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>
          About the Developers
        </Text>
        
        {/* Introduction */}
        <Text style={{ color: "#9CA3AF", fontSize: 16, lineHeight: 24, marginBottom: 16 }}>
          We are a passionate team dedicated to creating innovative, user-friendly, and efficient 
          solutions to make your life easier. Here’s a bit about us:
        </Text>

        {/* Developer Profiles */}
        <View style={{ backgroundColor: "#1F1F28", padding: 16, borderRadius: 15, marginBottom: 16 }}>
          <Image
            source={{ uri: "https://via.placeholder.com/100" }}
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              alignSelf: "center",
              marginBottom: 16,
              borderColor: "#4F46E5",
              borderWidth: 2
            }}
          />
          <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 8 }}>
            Jane Doe
          </Text>
          <Text style={{ color: "#9CA3AF", fontSize: 14, textAlign: "center", marginBottom: 8 }}>
            Lead Developer
          </Text>
          <Text style={{ color: "#9CA3AF", fontSize: 14, lineHeight: 22, textAlign: "center" }}>
            Jane is an expert in full-stack development with a passion for designing seamless user 
            experiences. She’s been coding for over 10 years and loves working on innovative projects.
          </Text>
        </View>

        <View style={{ backgroundColor: "#1F1F28", padding: 16, borderRadius: 15, marginBottom: 16 }}>
          <Image
            source={{ uri: "https://via.placeholder.com/100" }}
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              alignSelf: "center",
              marginBottom: 16,
              borderColor: "#4F46E5",
              borderWidth: 2
            }}
          />
          <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 8 }}>
            John Smith
          </Text>
          <Text style={{ color: "#9CA3AF", fontSize: 14, textAlign: "center", marginBottom: 8 }}>
            UI/UX Designer
          </Text>
          <Text style={{ color: "#9CA3AF", fontSize: 14, lineHeight: 22, textAlign: "center" }}>
            John specializes in crafting beautiful and intuitive interfaces. His creative vision 
            ensures the app is both functional and visually appealing.
          </Text>
        </View>

        {/* Conclusion */}
        <Text style={{ color: "#9CA3AF", fontSize: 16, lineHeight: 24, marginTop: 16 }}>
          Together, our team is committed to building software that meets your needs and exceeds 
          expectations. We’re always working to improve and bring new ideas to life. Thank you 
          for supporting us!
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AboutDevelopersPage;
