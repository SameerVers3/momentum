import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styled } from "nativewind";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledLinearGradient = styled(LinearGradient);

const teamMembers = [
  {
    name: "Sameer",
    role: "Lead Developer",
    image: "https://via.placeholder.com/100",
    github: "https://github.com/johndoe",
    linkedin: "https://linkedin.com/in/johndoe",
    skills: ["React Native", "Node.js", "UI/UX"]
  },
  {
    name: "Ali Nazir",
    role: "Developer",
    image: "https://via.placeholder.com/100",
    github: "https://github.com/janesmith",
    linkedin: "https://linkedin.com/in/janesmith",
    skills: ["Python", "AWS", "Database Design"]
  },
  // Add more team members as needed
];

const appFeatures = [
  {
    title: "Workout Tracking",
    description: "Track your workouts with detailed progress monitoring",
    icon: "fitness"
  },
  {
    title: "Custom Plans",
    description: "Create and follow personalized workout plans",
    icon: "calendar"
  },
  {
    title: "Progress Analytics",
    description: "Visualize your fitness journey with detailed analytics",
    icon: "stats-chart"
  },
];

const AboutPage = () => {
  const openLink = (url) => {
    Linking.openURL(url);
  };

  return (
    <StyledView className="flex-1 bg-[#0F0F14]">
      <StatusBar barStyle="light-content" />
      <SafeAreaView className="flex-1">
        <ScrollView className="flex-1">
          {/* Hero Section */}
          <StyledLinearGradient
            colors={['#4F46E5', '#2C73D2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="h-[200px] relative"
          >
            <LinearGradient
              colors={['rgba(15, 15, 20, 0)', 'rgba(15, 15, 20, 0.8)', 'rgba(15, 15, 20, 1)']}
              className="h-full p-6 justify-end"
            >
              {/* Header */}
              <StyledView className="flex-row items-center justify-between mt-20">
                <StyledTouchableOpacity
                  onPress={() => router.replace("/(tabs)/profile")}
                  className="bg-black/30 p-2 rounded-full"
                >
                  <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </StyledTouchableOpacity>
                <StyledView className="bg-black/30 p-4 rounded-2xl">
                  <Ionicons name="information-circle" size={24} color="#FFFFFF" />
                </StyledView>
              </StyledView>

              {/* Title */}
              <StyledView>
                <StyledText className="text-white/70 text-lg mb-1">
                  About Us
                </StyledText>
                <StyledText className="text-white font-bold text-3xl mb-4">
                  Meet the Team
                </StyledText>
              </StyledView>
            </LinearGradient>
          </StyledLinearGradient>

          {/* Content Section */}
          <StyledView className="px-4 -mt-8">
            {/* App Version Card */}
            <StyledView className="bg-[#1F1F28] p-4 rounded-2xl shadow-lg border border-gray-800/50 mb-6">
              <StyledView className="flex-row items-center justify-between">
                <StyledView>
                  <StyledText className="text-white font-bold text-lg">FitTrack</StyledText>
                  <StyledText className="text-[#9CA3AF]">Version 1.0.0</StyledText>
                </StyledView>
                <StyledView className="bg-[#2C2C3E] p-2 rounded-xl">
                  <Ionicons name="logo-github" size={20} color="#4F46E5" />
                </StyledView>
              </StyledView>
            </StyledView>

            {/* Features Section */}
            <StyledText className="text-white font-bold text-xl mb-4">Features</StyledText>
            {appFeatures.map((feature, index) => (
              <StyledView 
                key={index}
                className="bg-[#1F1F28] p-4 rounded-2xl shadow-lg border border-gray-800/50 mb-4"
              >
                <StyledView className="flex-row items-center">
                  <StyledView className="bg-[#2C2C3E] p-3 rounded-xl mr-4">
                    <Ionicons name={feature.icon} size={24} color="#4F46E5" />
                  </StyledView>
                  <StyledView className="flex-1">
                    <StyledText className="text-white font-bold text-lg">{feature.title}</StyledText>
                    <StyledText className="text-[#9CA3AF]">{feature.description}</StyledText>
                  </StyledView>
                </StyledView>
              </StyledView>
            ))}

            {/* Team Section */}
            <StyledText className="text-white font-bold text-xl mb-4">Development Team</StyledText>
            {teamMembers.map((member, index) => (
              <StyledView 
                key={index}
                className="bg-[#1F1F28] p-4 rounded-2xl shadow-lg border border-gray-800/50 mb-4"
              >
                <StyledView className="flex-row items-center mb-4">
                  <Image
                    source={{ uri: member.image }}
                    className="w-16 h-16 rounded-xl mr-4"
                  />
                  <StyledView className="flex-1">
                    <StyledText className="text-white font-bold text-lg">{member.name}</StyledText>
                    <StyledText className="text-[#9CA3AF]">{member.role}</StyledText>
                  </StyledView>
                </StyledView>

                {/* Skills */}
                <StyledView className="flex-row flex-wrap gap-2 mb-4">
                  {member.skills.map((skill, skillIndex) => (
                    <StyledView 
                      key={skillIndex}
                      className="bg-[#2C2C3E] px-3 py-1 rounded-full"
                    >
                      <StyledText className="text-[#4F46E5]">{skill}</StyledText>
                    </StyledView>
                  ))}
                </StyledView>

                {/* Social Links */}
                <StyledView className="flex-row justify-end space-x-3">
                  <StyledTouchableOpacity 
                    onPress={() => openLink(member.github)}
                    className="bg-[#2C2C3E] p-2 rounded-xl"
                  >
                    <Ionicons name="logo-github" size={20} color="#4F46E5" />
                  </StyledTouchableOpacity>
                  <StyledTouchableOpacity 
                    onPress={() => openLink(member.linkedin)}
                    className="bg-[#2C2C3E] p-2 rounded-xl"
                  >
                    <Ionicons name="logo-linkedin" size={20} color="#4F46E5" />
                  </StyledTouchableOpacity>
                </StyledView>
              </StyledView>
            ))}

            {/* Contact Card */}
            <StyledView className="bg-[#1F1F28] p-4 rounded-2xl shadow-lg border border-gray-800/50 mb-20">
              <StyledView className="flex-row items-center justify-between mb-4">
                <StyledText className="text-white font-bold text-lg">Get in Touch</StyledText>
                <StyledView className="bg-[#2C2C3E] p-2 rounded-xl">
                  <Ionicons name="mail" size={20} color="#4F46E5" />
                </StyledView>
              </StyledView>
              <StyledText className="text-[#9CA3AF] mb-4">
                Have questions or feedback? We'd love to hear from you!
              </StyledText>
              <StyledTouchableOpacity 
                className="bg-[#4F46E5] p-4 rounded-xl flex-row items-center justify-center"
              >
                <Ionicons name="mail-outline" size={20} color="#FFFFFF" />
                <StyledText className="text-white font-semibold ml-2">
                  Contact Us
                </StyledText>
              </StyledTouchableOpacity>
            </StyledView>
          </StyledView>
        </ScrollView>
      </SafeAreaView>
    </StyledView>
  );
};

export default AboutPage;
