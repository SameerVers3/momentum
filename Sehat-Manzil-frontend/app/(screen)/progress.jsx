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
  Alert
} from "react-native";
import { LineChart, BarChart, PieChart } from "react-native-chart-kit";
import { ChevronLeftIcon, TrendingUpIcon, RulerIcon, ScaleIcon } from "lucide-react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { styled } from "nativewind";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

// Styled components
const StyledSafeAreaView = styled(SafeAreaView, "flex-1 bg-[#0F0F14]");
const StyledScrollView = styled(ScrollView, "px-4");
const StyledView = styled(View);
const StyledText = styled(Text);

// Chart configuration
const chartConfig = {
  backgroundColor: "#0F0F14",
  backgroundGradientFrom: "#0F0F14",
  backgroundGradientTo: "#0F0F14",
  decimalPlaces: 2,
  color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
  style: { borderRadius: 16 },
  propsForDots: {
    r: "6",
    strokeWidth: "2",
    stroke: "rgba(79, 70, 229, 1)",
  },
};

const ChartPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

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
      <StyledView className="flex-1 justify-center items-center bg-[#0F0F14]">
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
          onPress={() => navigation.goBack()}
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
            <ChevronLeftIcon color="white" size={24} />
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
    <StyledSafeAreaView>
      <StyledView className="flex-row items-center p-4 bg-[#0F0F14]">
        <TouchableOpacity 
          className="mr-4"
          onPress={() => router.replace('/(tabs)/profile')}
        >
          <ChevronLeftIcon color="white" size={24} />
        </TouchableOpacity>
        <StyledText className="text-white text-2xl font-bold">
          Health Progress
        </StyledText>
      </StyledView>
      
      <StyledScrollView>
        {/* Combined Health Metrics Chart */}
        <StyledView className="mb-6 bg-[#1A1A2E] rounded-xl p-4">
          <StyledView className="flex-row items-center mb-4">
            <TrendingUpIcon color="white" size={24} className="mr-2" />
            <StyledText className="text-white text-xl font-bold">
              Combined Health Metrics
            </StyledText>
          </StyledView>
          <LineChart
            data={combinedChartData}
            width={width - 48}
            height={250}
            chartConfig={chartConfig}
            bezier
            style={{ borderRadius: 16 }}
          />
        </StyledView>

        {/* BMI Bar Chart */}
        <StyledView className="mb-6 bg-[#1A1A2E] rounded-xl p-4">
          <StyledView className="flex-row items-center mb-4">
            <ScaleIcon color="white" size={24} className="mr-2" />
            <StyledText className="text-white text-xl font-bold">
              BMI Overview
            </StyledText>
          </StyledView>
          <BarChart
            data={{
              labels,
              datasets: [{ data: bmiValues }],
            }}
            width={width - 48}
            height={250}
            chartConfig={chartConfig}
            style={{ borderRadius: 16 }}
          />
        </StyledView>

        <StyledView className="mb-6 bg-[#1A1A2E] rounded-xl p-4">
          <StyledView className="flex-row items-center mb-4">
            <StyledText className="text-white text-xl font-bold">
              Weight Progress
            </StyledText>
          </StyledView>
          <LineChart
            data={weightChartData}
            width={width - 48}
            height={250}
            chartConfig={chartConfig}
            bezier
            style={{ borderRadius: 16 }}
          />
        </StyledView>

        {/* Height Chart */}
        <StyledView className="mb-6 bg-[#1A1A2E] rounded-xl p-4">
          <StyledView className="flex-row items-center mb-4">
            <StyledText className="text-white text-xl font-bold">
              Height Progress
            </StyledText>
          </StyledView>
          <LineChart
            data={heightChartData}
            width={width - 48}
            height={250}
            chartConfig={chartConfig}
            bezier
            style={{ borderRadius: 16 }}
          />
        </StyledView>

        {/* Analytics Summary */}
        <StyledView className="mb-6 bg-[#1A1A2E] rounded-xl p-4">
          <StyledView className="flex-row items-center mb-4">
            <RulerIcon color="white" size={24} className="mr-2" />
            <StyledText className="text-white text-xl font-bold">
              Analytics Summary
            </StyledText>
          </StyledView>
          <StyledView className="space-y-2">
            <StyledText className="text-gray-300">
              Weight - Min: {weightStats.min}, Max: {weightStats.max}, Avg: {weightStats.avg}
            </StyledText>
            <StyledText className="text-gray-300">
              Height - Min: {heightStats.min}, Max: {heightStats.max}, Avg: {heightStats.avg}
            </StyledText>
            <StyledText className="text-gray-300">
              BMI - Min: {bmiStats.min}, Max: {bmiStats.max}, Avg: {bmiStats.avg}
            </StyledText>
          </StyledView>
        </StyledView>

        {/* Detailed Data Tables */}
        {["weightData", "heightData", "bmiData"].map((key, index) => (
          <StyledView key={index} className="mb-6 bg-[#1A1A2E] rounded-xl p-4">
            <StyledText className="text-white text-xl font-bold mb-4">
              {key.replace("Data", "").toUpperCase()} Details
            </StyledText>
            <FlatList
              data={data[key]}
              keyExtractor={(item, idx) => idx.toString()}
              renderItem={({ item }) => (
                <StyledView className="flex-row justify-between py-2 border-b border-gray-700">
                  <StyledText className="text-gray-300">
                    {new Date(item.date).toLocaleDateString("en-US")}
                  </StyledText>
                  <StyledText className="text-white">
                    {parseFloat(item[key.replace("Data", "").toLowerCase()]).toFixed(2)}
                  </StyledText>
                </StyledView>
              )}
            />
          </StyledView>
        ))}
      </StyledScrollView>
    </StyledSafeAreaView>
  );
};

export default ChartPage;