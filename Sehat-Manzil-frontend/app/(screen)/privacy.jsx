import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styled } from "nativewind";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledLinearGradient = styled(LinearGradient);

const privacyData = [
  {
    title: "Data Collection",
    description: "We collect minimal personal data to provide our services",
    icon: "document-text",
    items: [
      {
        title: "Personal Information",
        details: "Name, email, age, and other basic information you provide"
      },
      {
        title: "Health & Fitness Data",
        details: "Weight, height, workout history, and fitness goals"
      },
      {
        title: "Usage Statistics",
        details: "App interactions, workout completion rates, and preferences"
      },
    ]
  },
  {
    title: "Data Security",
    description: "Your data is encrypted and securely stored",
    icon: "shield-checkmark",
    items: [
      {
        title: "End-to-end Encryption",
        details: "All data transmissions are encrypted using industry standards"
      },
      {
        title: "Secure Storage",
        details: "Data is stored in secure, encrypted databases"
      },
      {
        title: "Regular Security Audits",
        details: "We perform regular security checks and updates"
      },
    ]
  },
  {
    title: "Data Usage",
    description: "How we use your data to improve your experience",
    icon: "analytics",
    items: [
      "Personalized Workouts",
      "Progress Tracking",
      "Health Insights",
    ]
  },
  {
    title: "Your Rights",
    description: "Control over your personal data",
    icon: "key",
    items: [
      "Access Your Data",
      "Delete Your Data",
      "Export Your Data",
    ]
  }
];

const PrivacyPage = () => {
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (index) => {
    setOpenSection(openSection === index ? null : index);
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
                  <Ionicons name="shield-checkmark" size={24} color="#FFFFFF" />
                </StyledView>
              </StyledView>

              {/* Title */}
              <StyledView>
                <StyledText className="text-white/70 text-lg mb-1">
                  Security
                </StyledText>
                <StyledText className="text-white font-bold text-3xl mb-4">
                  Privacy Policy
                </StyledText>
              </StyledView>
            </LinearGradient>
          </StyledLinearGradient>

          {/* Content Section */}
          <StyledView className="px-4 -mt-8">
            {privacyData.map((section, index) => (
              <StyledView 
                key={index}
                className="bg-[#1F1F28] rounded-2xl shadow-lg border border-gray-800/50 mb-6 overflow-hidden"
              >
                {/* Section Header - Now Touchable */}
                <StyledTouchableOpacity 
                  className="p-4 flex-row items-center justify-between"
                  onPress={() => toggleSection(index)}
                >
                  <StyledView className="flex-row items-center flex-1">
                    <StyledView className="bg-[#2C2C3E] p-2 rounded-xl mr-3">
                      <Ionicons name={section.icon} size={20} color="#4F46E5" />
                    </StyledView>
                    <StyledView className="flex-1">
                      <StyledText className="text-white font-bold text-lg">
                        {section.title}
                      </StyledText>
                      <StyledText className="text-[#9CA3AF] text-sm">
                        {section.description}
                      </StyledText>
                    </StyledView>
                  </StyledView>
                  <Ionicons 
                    name={openSection === index ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#9CA3AF" 
                  />
                </StyledTouchableOpacity>

                {/* Dropdown Content */}
                {openSection === index && (
                  <StyledView className="bg-[#2C2C3E]/50">
                    {section.items.map((item, itemIndex) => (
                      <StyledView 
                        key={itemIndex}
                        className="p-4 border-t border-gray-800/50"
                      >
                        <StyledView className="flex-row items-center mb-2">
                          <StyledView className="bg-[#2C2C3E] p-2 rounded-lg mr-3">
                            <Ionicons 
                              name="information-circle" 
                              size={16} 
                              color="#4F46E5" 
                            />
                          </StyledView>
                          <StyledText className="text-white font-medium">
                            {item.title}
                          </StyledText>
                        </StyledView>
                        <StyledText className="text-[#9CA3AF] ml-11">
                          {item.details}
                        </StyledText>
                      </StyledView>
                    ))}
                  </StyledView>
                )}
              </StyledView>
            ))}

            {/* Contact Section */}
            <StyledView className="bg-[#1F1F28] p-4 rounded-2xl shadow-lg border border-gray-800/50 mb-20">
              <StyledView className="flex-row items-center justify-between mb-4">
                <StyledText className="text-white font-bold text-lg">Need Help?</StyledText>
                <StyledView className="bg-[#2C2C3E] p-2 rounded-xl">
                  <Ionicons name="mail" size={20} color="#4F46E5" />
                </StyledView>
              </StyledView>

              <StyledText className="text-[#9CA3AF] mb-4">
                Contact us for any privacy concerns or questions
              </StyledText>

              <StyledTouchableOpacity 
                className="bg-[#4F46E5] p-4 rounded-xl flex-row items-center justify-center"
              >
                <Ionicons name="mail-outline" size={20} color="#FFFFFF" />
                <StyledText className="text-white font-semibold ml-2">
                  Contact Support
                </StyledText>
              </StyledTouchableOpacity>
            </StyledView>
          </StyledView>
        </ScrollView>
      </SafeAreaView>
    </StyledView>
  );
};

export default PrivacyPage;
