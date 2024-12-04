import React from "react";

import { View, Text, SafeAreaView, ScrollView } from "react-native";

const PrivacyPage = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0F0F14" }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ color: "#fff", fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>
          Privacy Policy
        </Text>
        <Text style={{ color: "#9CA3AF", fontSize: 16, lineHeight: 24 }}>
          At [Your App Name], we are committed to protecting your privacy. This page outlines how we 
          handle your personal data and ensure it is secure.
        </Text>
        <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold", marginTop: 16 }}>
          Data Collection
        </Text>
        <Text style={{ color: "#9CA3AF", fontSize: 16, lineHeight: 24, marginBottom: 16 }}>
          We collect personal data such as your name, email address, and usage statistics 
          to provide better services. Your data is never shared with third parties without 
          your consent.
        </Text>
        <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold", marginTop: 16 }}>
          Security
        </Text>
        <Text style={{ color: "#9CA3AF", fontSize: 16, lineHeight: 24, marginBottom: 16 }}>
          All your data is encrypted and stored securely on our servers. We employ industry-standard 
          measures to prevent unauthorized access.
        </Text>
        <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold", marginTop: 16 }}>
          Contact Us
        </Text>
        <Text style={{ color: "#9CA3AF", fontSize: 16, lineHeight: 24 }}>
          If you have any questions about this Privacy Policy, please contact us at 
          support@yourapp.com.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacyPage;
