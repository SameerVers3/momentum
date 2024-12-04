import React from "react";
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from "react-native";

const SupportPage = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0F0F14" }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ color: "#fff", fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>
          Support
        </Text>
        <Text style={{ color: "#9CA3AF", fontSize: 16, lineHeight: 24, marginBottom: 16 }}>
          Need help? We're here for you! Choose one of the support options below to reach out.
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: "#1F1F28",
            padding: 16,
            borderRadius: 15,
            marginBottom: 16,
            alignItems: "center"
          }}
        >
          <Text style={{ color: "#4F46E5", fontSize: 16, fontWeight: "bold" }}>Contact Support</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            backgroundColor: "#1F1F28",
            padding: 16,
            borderRadius: 15,
            marginBottom: 16,
            alignItems: "center"
          }}
        >
          <Text style={{ color: "#4F46E5", fontSize: 16, fontWeight: "bold" }}>FAQs</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            backgroundColor: "#1F1F28",
            padding: 16,
            borderRadius: 15,
            alignItems: "center"
          }}
        >
          <Text style={{ color: "#4F46E5", fontSize: 16, fontWeight: "bold" }}>Chat with Us</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SupportPage;
