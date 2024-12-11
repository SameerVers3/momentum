import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView, 
  Dimensions, 
  ActivityIndicator, 
  TouchableOpacity,
  FlatList,
  StatusBar,
  Alert
} from "react-native";
import { LineChart, BarChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { styled } from "nativewind";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

// Styled components
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledLinearGradient = styled(LinearGradient);

// Chart configuration
const chartConfig = {
  backgroundColor: "transparent",
  backgroundGradientFrom: "#1F1F28",
  backgroundGradientTo: "#1F1F28",
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: "4",
    strokeWidth: "2",
    stroke: "#4F46E5",
  },
};

const ChartPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    try {
      const authToken = await AsyncStorage.getItem("userToken");
      if (!authToken) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/progress/bmi`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      // Basic data validation
      if (!response.data || 
          !response.data.weightData || 
          !response.data.heightData || 
          !response.data.bmiData) {
        throw new Error("Invalid data format");
      }

      setData(response.data);
    } catch (error) {
      console.error("Error fetching chart data:", error);
      setError(error.message);
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const extractValues = (key) => {
    return data && data[key]
      ? data[key]
          .map((entry) => {
            const value = parseFloat(entry[key.replace("Data", "").toLowerCase()] || 0);
            return isNaN(value) ? 0 : value;
          })
          .filter(val => val !== 0)
      : [];
  };

  const extractLabels = () => {
    return data && data.weightData
      ? data.weightData.map((entry) => 
          new Date(entry.date).toLocaleDateString("en-US", { 
            month: 'short', 
            day: 'numeric' 
          })
        )
      : [];
  };

  const calculateAnalytics = (values) => {
    if (!values.length) return { min: 0, max: 0, avg: 0 };
    const sum = values.reduce((acc, val) => acc + val, 0);
    return {
      min: parseFloat(Math.min(...values).toFixed(2)),
      max: parseFloat(Math.max(...values).toFixed(2)),
      avg: parseFloat((sum / values.length).toFixed(2)),
    };
  };

  if (loading) {
    return (
      <StyledView className="flex-1 bg-[#0F0F14] items-center justify-center">
        <ActivityIndicator size="large" color="#4F46E5" />
      </StyledView>
    );
  }

  if (error) {
    return (
      <StyledView className="flex-1 justify-center items-center p-4 bg-[#0F0F14]">
        <StyledText className="text-red-500 text-lg text-center">
          {error}
        </StyledText>
        <TouchableOpacity 
          className="mt-4 bg-indigo-600 p-3 rounded-lg"
          onPress={() => router.replace('/(tabs)/profile')}
        >
          <StyledText className="text-white text-center">Go Back</StyledText>
        </TouchableOpacity>
      </StyledView>
    );
  }

  const weightValues = extractValues("weightData");
  const heightValues = extractValues("heightData");
  const bmiValues = extractValues("bmiData");

  const labels = extractLabels();

  const weightStats = calculateAnalytics(weightValues);
  const heightStats = calculateAnalytics(heightValues);
  const bmiStats = calculateAnalytics(bmiValues);

  // Combined Chart Data
  const combinedChartData = {
    labels,
    datasets: [
      {
        data: weightValues,
        color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`, // Blue for weight
      },
      {
        data: heightValues,
        color: (opacity = 1) => `rgba(255, 165, 0, ${opacity})`, // Orange for height
      },
      {
        data: bmiValues,
        color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`, // Green for BMI
      },
    ],
  };

  const weightChartData = {
    labels,
    datasets: [
      {
        data: weightValues,
        color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`, // Blue for weight
      },
    ],
  };

  // Height Graph
  const heightChartData = {
    labels,
    datasets: [
      {
        data: heightValues,
        color: (opacity = 1) => `rgba(255, 165, 0, ${opacity})`, // Orange for height
      },
    ],
  };

  // Pie Chart Data
  const pieChartData = [
    {
      name: "Weight",
      population: weightStats.avg,
      color: "#4F46E5",
      legendFontColor: "#FFFFFF",
      legendFontSize: 15,
    },
    {
      name: "Height",
      population: heightStats.avg,
      color: "#FF9A00",
      legendFontColor: "#FFFFFF",
      legendFontSize: 15,
    },
    {
      name: "BMI",
      population: bmiStats.avg,
      color: "#22C55E",
      legendFontColor: "#FFFFFF",
      legendFontSize: 15,
    },
  ];

  if (
    data.weightData.length < 1 ||
    data.heightData.length < 1||
    data.bmiData.length < 1
  ) {
    console.log(data);
    return (
      <StyledSafeAreaView>
        <StyledView className="mt-12 flex-row items-center p-4 bg-[#0F0F14]">
          <TouchableOpacity 
            className="mr-4"
            onPress={() => router.replace('/(tabs)/profile')}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <StyledText className="text-white text-2xl font-bold">
            Health Progress
          </StyledText>
        </StyledView>
        <StyledView className="flex-1 justify-center items-center bg-[#0F0F14]">
          <StyledText className="text-red-500 text-lg text-center">
            No data found
          </StyledText>
        </StyledView>
      </StyledSafeAreaView>
    );
  }

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
                  <Ionicons name="stats-chart" size={24} color="#FFFFFF" />
                </StyledView>
              </StyledView>

              {/* Title and Stats */}
              <StyledView>
                <StyledText className="text-white/70 text-lg mb-1">
                  Your Progress
                </StyledText>
                <StyledText className="text-white font-bold text-3xl mb-4">
                  Health Analytics
                </StyledText>
                <StyledView className="flex-row items-center flex-wrap gap-2">
                  <StyledView className="bg-black/30 px-3 py-1 rounded-full flex-row items-center">
                    <Ionicons name="body-outline" size={16} color="#FFFFFF" />
                    <StyledText className="text-white ml-1">
                      BMI: {bmiStats.avg.toFixed(1)}
                    </StyledText>
                  </StyledView>
                  <StyledView className="bg-black/30 px-3 py-1 rounded-full flex-row items-center">
                    <Ionicons name="trending-up" size={16} color="#FFFFFF" />
                    <StyledText className="text-white ml-1">
                      Weight: {weightStats.avg}kg
                    </StyledText>
                  </StyledView>
                </StyledView>
              </StyledView>
            </LinearGradient>
          </StyledLinearGradient>

          {/* Charts Section */}
          <StyledView className="px-4 -mt-8">
            {/* Weight Progress Card */}
            <StyledView className="bg-[#1F1F28] p-4 rounded-2xl shadow-lg border border-gray-800/50 mb-6">
              <StyledView className="flex-row items-center justify-between mb-4">
                <StyledText className="text-white font-bold text-lg">Weight Progress</StyledText>
                <StyledView className="bg-[#2C2C3E] p-2 rounded-xl">
                  <Ionicons name="scale-outline" size={20} color="#4F46E5" />
                </StyledView>
              </StyledView>
              <LineChart
                data={weightChartData}
                width={width - 48}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
              />
              <StyledView className="flex-row justify-between mt-4">
                <StyledView>
                  <StyledText className="text-[#9CA3AF] text-sm">Min</StyledText>
                  <StyledText className="text-white font-medium">{weightStats.min}kg</StyledText>
                </StyledView>
                <StyledView>
                  <StyledText className="text-[#9CA3AF] text-sm">Average</StyledText>
                  <StyledText className="text-white font-medium">{weightStats.avg}kg</StyledText>
                </StyledView>
                <StyledView>
                  <StyledText className="text-[#9CA3AF] text-sm">Max</StyledText>
                  <StyledText className="text-white font-medium">{weightStats.max}kg</StyledText>
                </StyledView>
              </StyledView>
            </StyledView>

            {/* BMI Progress Card */}
            <StyledView className="bg-[#1F1F28] p-4 rounded-2xl shadow-lg border border-gray-800/50 mb-6">
              <StyledView className="flex-row items-center justify-between mb-4">
                <StyledText className="text-white font-bold text-lg">BMI Overview</StyledText>
                <StyledView className="bg-[#2C2C3E] p-2 rounded-xl">
                  <Ionicons name="fitness-outline" size={20} color="#4F46E5" />
                </StyledView>
              </StyledView>
              <BarChart
                data={{
                  labels,
                  datasets: [{ data: bmiValues }],
                }}
                width={width - 48}
                height={220}
                chartConfig={chartConfig}
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
              />
              <StyledView className="flex-row justify-between mt-4">
                <StyledView>
                  <StyledText className="text-[#9CA3AF] text-sm">Min</StyledText>
                  <StyledText className="text-white font-medium">{bmiStats.min}</StyledText>
                </StyledView>
                <StyledView>
                  <StyledText className="text-[#9CA3AF] text-sm">Average</StyledText>
                  <StyledText className="text-white font-medium">{bmiStats.avg}</StyledText>
                </StyledView>
                <StyledView>
                  <StyledText className="text-[#9CA3AF] text-sm">Max</StyledText>
                  <StyledText className="text-white font-medium">{bmiStats.max}</StyledText>
                </StyledView>
              </StyledView>
            </StyledView>

            {/* Trend Analysis Card */}
            <StyledView className="bg-[#1F1F28] p-4 rounded-2xl shadow-lg border border-gray-800/50 mb-6">
              <StyledView className="flex-row items-center justify-between mb-4">
                <StyledText className="text-white font-bold text-lg">Progress Insights</StyledText>
                <StyledView className="bg-[#2C2C3E] p-2 rounded-xl">
                  <Ionicons name="analytics-outline" size={20} color="#4F46E5" />
                </StyledView>
              </StyledView>
              
              {/* Weight Change Analysis */}
              <StyledView className="mb-4">
                <StyledView className="flex-row justify-between items-center mb-2">
                  <StyledText className="text-[#9CA3AF]">Weight Change (30 days)</StyledText>
                  <StyledText className={`${
                    weightValues[weightValues.length - 1] - weightValues[0] > 0 
                      ? 'text-red-500' 
                      : 'text-green-500'
                  }`}>
                    {Math.abs(weightValues[weightValues.length - 1] - weightValues[0]).toFixed(1)}kg
                    {weightValues[weightValues.length - 1] - weightValues[0] > 0 ? ' ↑' : ' ↓'}
                  </StyledText>
                </StyledView>
                <StyledView className="bg-[#2C2C3E] h-2 rounded-full overflow-hidden">
                  <StyledView 
                    className="bg-[#4F46E5] h-full rounded-full"
                    style={{ 
                      width: `${Math.min(
                        Math.abs(
                          ((weightValues[weightValues.length - 1] - weightValues[0]) / weightValues[0]) * 100
                        ), 100
                      )}%` 
                    }}
                  />
                </StyledView>
              </StyledView>

              {/* BMI Category */}
              <StyledView className="mb-4 bg-[#2C2C3E] p-3 rounded-xl">
                <StyledText className="text-[#9CA3AF] mb-1">BMI Category</StyledText>
                <StyledText className="text-white font-medium">
                  {bmiStats.avg < 18.5 
                    ? 'Underweight' 
                    : bmiStats.avg < 25 
                    ? 'Normal Weight' 
                    : bmiStats.avg < 30 
                    ? 'Overweight' 
                    : 'Obese'
                  }
                </StyledText>
                <StyledText className="text-[#9CA3AF] text-sm mt-1">
                  {bmiStats.avg < 18.5 
                    ? 'Consider gaining some weight' 
                    : bmiStats.avg < 25 
                    ? "You're in a healthy range" 
                    : bmiStats.avg < 30 
                    ? 'Consider losing some weight' 
                    : 'Please consult a healthcare provider'
                  }
                </StyledText>
              </StyledView>

              {/* Weekly Progress */}
              <StyledView className="flex-row justify-between">
                <StyledView className="bg-[#2C2C3E] p-3 rounded-xl flex-1 mr-2">
                  <StyledText className="text-[#9CA3AF] text-sm">Weekly Goal</StyledText>
                  <StyledText className="text-white font-medium">
                    {Math.abs(weightValues[weightValues.length - 1] - weightValues[weightValues.length - 7] || 0).toFixed(1)}kg
                  </StyledText>
                  <StyledText className="text-[#9CA3AF] text-xs">Last 7 days</StyledText>
                </StyledView>
                <StyledView className="bg-[#2C2C3E] p-3 rounded-xl flex-1 ml-2">
                  <StyledText className="text-[#9CA3AF] text-sm">Monthly Goal</StyledText>
                  <StyledText className="text-white font-medium">
                    {Math.abs(weightValues[weightValues.length - 1] - weightValues[weightValues.length - 30] || 0).toFixed(1)}kg
                  </StyledText>
                  <StyledText className="text-[#9CA3AF] text-xs">Last 30 days</StyledText>
                </StyledView>
              </StyledView>
            </StyledView>

            {/* Health Score Card */}
            <StyledView className="bg-[#1F1F28] p-4 rounded-2xl shadow-lg border border-gray-800/50 mb-6">
              <StyledView className="flex-row items-center justify-between mb-4">
                <StyledText className="text-white font-bold text-lg">Health Score</StyledText>
                <StyledView className="bg-[#2C2C3E] p-2 rounded-xl">
                  <Ionicons name="heart-outline" size={20} color="#4F46E5" />
                </StyledView>
              </StyledView>

              {/* Health Score Circle */}
              <StyledView className="items-center mb-4">
                <StyledView className="bg-[#2C2C3E] w-24 h-24 rounded-full items-center justify-center mb-2">
                  <StyledText className="text-white text-2xl font-bold">
                    {Math.min(
                      Math.round(
                        (bmiStats.avg >= 18.5 && bmiStats.avg <= 25 ? 100 : 
                         Math.max(0, 100 - Math.abs(bmiStats.avg - 21.75) * 10))
                      ), 100
                    )}%
                  </StyledText>
                </StyledView>
                <StyledText className="text-[#9CA3AF] text-sm text-center">
                  Based on BMI and weight trends
                </StyledText>
              </StyledView>

              {/* Health Metrics */}
              <StyledView className="flex-row justify-between">
                <StyledView className="items-center flex-1">
                  <StyledText className="text-[#9CA3AF] text-sm">Weight Stability</StyledText>
                  <StyledText className="text-white font-medium">
                    {Math.abs(weightValues[weightValues.length - 1] - weightStats.avg) < 2 
                      ? 'Good' 
                      : 'Needs Work'}
                  </StyledText>
                </StyledView>
                <StyledView className="items-center flex-1">
                  <StyledText className="text-[#9CA3AF] text-sm">BMI Range</StyledText>
                  <StyledText className="text-white font-medium">
                    {bmiStats.avg >= 18.5 && bmiStats.avg <= 25 ? 'Optimal' : 'Sub-optimal'}
                  </StyledText>
                </StyledView>
              </StyledView>
            </StyledView>

            {/* Recommendations Card */}
            <StyledView className="bg-[#1F1F28] p-4 rounded-2xl shadow-lg border border-gray-800/50 mb-20">
              <StyledView className="flex-row items-center justify-between mb-4">
                <StyledText className="text-white font-bold text-lg">Recommendations</StyledText>
                <StyledView className="bg-[#2C2C3E] p-2 rounded-xl">
                  <Ionicons name="bulb-outline" size={20} color="#4F46E5" />
                </StyledView>
              </StyledView>

              {[
                {
                  title: weightValues[weightValues.length - 1] > weightValues[0] 
                    ? 'Weight Gain Detected' 
                    : 'Weight Loss Detected',
                  message: weightValues[weightValues.length - 1] > weightValues[0]
                    ? 'Consider increasing physical activity'
                    : 'Keep up the good work with your routine',
                  icon: 'fitness-outline'
                },
                {
                  title: 'BMI Status',
                  message: `Your BMI suggests you're in the ${
                    bmiStats.avg < 18.5 
                      ? 'underweight' 
                      : bmiStats.avg < 25 
                      ? 'healthy' 
                      : bmiStats.avg < 30 
                      ? 'overweight' 
                      : 'obese'
                  } range`,
                  icon: 'body-outline'
                }
              ].map((item, index) => (
                <StyledView 
                  key={index} 
                  className="flex-row items-center p-3 bg-[#2C2C3E] rounded-xl mb-2"
                >
                  <StyledView className="bg-[#4F46E5]/10 p-2 rounded-lg mr-3">
                    <Ionicons name={item.icon} size={20} color="#4F46E5" />
                  </StyledView>
                  <StyledView className="flex-1">
                    <StyledText className="text-white font-medium">{item.title}</StyledText>
                    <StyledText className="text-[#9CA3AF] text-sm">{item.message}</StyledText>
                  </StyledView>
                </StyledView>
              ))}
            </StyledView>
          </StyledView>
        </ScrollView>
      </SafeAreaView>
    </StyledView>
  );
};

export default ChartPage;