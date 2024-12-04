import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { LineChart, BarChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const HomeScreen = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const authToken = await AsyncStorage.getItem("userToken");
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/dashboard/data`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#0F0F14",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#0F0F14" }}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView>
        <ScrollView>
          {/* Header */}
          <LinearGradient
            colors={["#4F46E5", "#302F4E"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              alignItems: "center",
              paddingVertical: 40,
              borderBottomLeftRadius: 40,
              borderBottomRightRadius: 40,
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontWeight: "bold",
                fontSize: 24,
              }}
            >
              Welcome Back!
            </Text>
            <Text style={{ color: "#E5E5E5", marginTop: 4 }}>
              Here's a summary of your progress
            </Text>
          </LinearGradient>

          {/* Line Chart */}
          <View style={{ marginTop: 20, paddingHorizontal: 16 }}>
            <Text style={{ color: "#fff", marginBottom: 8, fontSize: 18 }}>
              Daily Activity
            </Text>
            <LineChart
              data={{
                labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                datasets: [
                  {
                    data: data?.activity || [0, 0, 0, 0, 0, 0, 0],
                  },
                ],
              }}
              width={width - 32}
              height={220}
              yAxisSuffix="k"
              chartConfig={{
                backgroundColor: "#0F0F14",
                backgroundGradientFrom: "#1F1F28",
                backgroundGradientTo: "#1F1F28",
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(75, 192, 192, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
              }}
              style={{
                borderRadius: 16,
              }}
            />
          </View>

          {/* Bar Chart */}
          <View style={{ marginTop: 20, paddingHorizontal: 16 }}>
            <Text style={{ color: "#fff", marginBottom: 8, fontSize: 18 }}>
              Weekly Goals
            </Text>
            <BarChart
              data={{
                labels: ["Steps", "Calories", "Sleep", "Water"],
                datasets: [
                  {
                    data: data?.weeklyGoals || [0, 0, 0, 0],
                  },
                ],
              }}
              width={width - 32}
              height={220}
              yAxisSuffix="%"
              chartConfig={{
                backgroundColor: "#0F0F14",
                backgroundGradientFrom: "#1F1F28",
                backgroundGradientTo: "#1F1F28",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
              }}
              style={{
                borderRadius: 16,
              }}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default HomeScreen;
