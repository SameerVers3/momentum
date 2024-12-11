import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Dimensions,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { styled } from "nativewind";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { LineChart } from "react-native-chart-kit";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledScrollView = styled(ScrollView);
const StyledSafeAreaView = styled(SafeAreaView);
const StyledLinearGradient = styled(LinearGradient);

const DashboardCard = ({ title, value, subtitle, icon, color = "#4F46E5", gradient = false }) => (
  <StyledView 
    className="bg-[#1F1F28] rounded-3xl p-5 border border-[#4F46E5]/5 shadow-lg"
    style={{ 
      shadowColor: color,
      shadowOpacity: 0.1,
      shadowRadius: 10,
    }}
  >
    <StyledView className="flex-row items-center justify-between">
      <StyledView className="flex-1">
        <StyledText className="text-gray-400 text-sm mb-2">{title}</StyledText>
        <StyledText className="text-white text-2xl font-bold" style={{ color }}>
          {value}
        </StyledText>
        {subtitle && (
          <StyledText className="text-gray-400 text-xs mt-2">{subtitle}</StyledText>
        )}
      </StyledView>
      <StyledLinearGradient
        colors={gradient ? [color, `${color}80`] : [`${color}20`, `${color}10`]}
        className="w-14 h-14 rounded-2xl items-center justify-center"
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons name={icon} size={28} color={gradient ? "white" : color} />
      </StyledLinearGradient>
    </StyledView>
  </StyledView>
);

const ActivityItem = ({ log, index }) => (
  <StyledTouchableOpacity
    className={`bg-[#1F1F28] rounded-2xl mb-3 p-4 border border-[#4F46E5]/5 
      ${index === 0 ? 'bg-gradient-to-r from-[#1F1F28] to-[#4F46E5]/5' : ''}`}
    style={{
      shadowColor: log.performed_at ? "#4F46E5" : "#FF6B6B",
      shadowOpacity: index === 0 ? 0.1 : 0.05,
      shadowRadius: 10,
    }}
  >
    <StyledView className="flex-row items-center">
      <StyledLinearGradient
        colors={log.performed_at ? ['#4F46E5', '#4F46E580'] : ['#FF6B6B', '#FF6B6B80']}
        className="w-12 h-12 rounded-xl items-center justify-center mr-4"
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons 
          name={log.performed_at ? "barbell" : "fast-food"} 
          size={24} 
          color="white" 
        />
      </StyledLinearGradient>
      <StyledView className="flex-1">
        <StyledText className="text-white font-bold text-base">
          {log.performed_at ? "Workout Completed" : "Meal Logged"}
        </StyledText>
        <StyledView className="flex-row items-center mt-1">
          <Ionicons 
            name="time-outline" 
            size={14} 
            color="#9CA3AF" 
          />
          <StyledText className="text-gray-400 text-xs ml-1">
            {new Date(log.performed_at || log.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </StyledText>
        </StyledView>
      </StyledView>
      <StyledView 
        className={`px-3 py-1 rounded-full ${
          log.performed_at ? 'bg-[#4F46E5]/10' : 'bg-[#FF6B6B]/10'
        }`}
      >
        <StyledText 
          className={`text-sm font-medium ${
            log.performed_at ? 'text-[#4F46E5]' : 'text-[#FF6B6B]'
          }`}
        >
          {log.performed_at 
            ? `${parseFloat(log.calories_burned || 0).toFixed(0)} cal`
            : `${log.calories || 0} cal`
          }
        </StyledText>
      </StyledView>
    </StyledView>
  </StyledTouchableOpacity>
);

const UserStatsCard = ({ userProfile }) => (
  <StyledView className="bg-[#1F1F28] rounded-3xl p-6 m-5 mb-14 border border-[#4F46E5]/5">
    <StyledView className="flex-row justify-between items-center mb-4">
      <StyledText className="text-white text-lg font-bold">Your Stats</StyledText>
      <StyledTouchableOpacity 
        className="bg-[#2C2C3E] px-3 py-1 rounded-full"
        onPress={() => router.push("/profile")}
      >
        <StyledText className="text-gray-400 text-sm">Update</StyledText>
      </StyledTouchableOpacity>
    </StyledView>

    <StyledView className="flex-row justify-between ">
      <StyledView className="items-center">
        <StyledView className="bg-[#4F46E5]/10 w-12 h-12 rounded-full items-center justify-center mb-2">
          <Ionicons name="body-outline" size={24} color="#4F46E5" />
        </StyledView>
        <StyledText className="text-white text-lg font-bold">
          {userProfile?.current_height || '--'} cm
        </StyledText>
        <StyledText className="text-gray-400 text-xs mt-1">Height</StyledText>
      </StyledView>

      <StyledView className="items-center">
        <StyledView className="bg-[#4F46E5]/10 w-12 h-12 rounded-full items-center justify-center mb-2">
          <Ionicons name="scale-outline" size={24} color="#4F46E5" />
        </StyledView>
        <StyledText className="text-white text-lg font-bold">
          {userProfile?.current_weight || '--'} kg
        </StyledText>
        <StyledText className="text-gray-400 text-xs mt-1">Weight</StyledText>
      </StyledView>

      <StyledView className="items-center">
        <StyledView className="bg-[#4F46E5]/10 w-12 h-12 rounded-full items-center justify-center mb-2">
          <Ionicons name="fitness-outline" size={24} color="#4F46E5" />
        </StyledView>
        <StyledText className="text-white text-lg font-bold">
          {calculateBMI(userProfile?.current_height, userProfile?.current_weight)?.toFixed(1) || '--'}
        </StyledText>
        <StyledText className="text-gray-400 text-xs mt-1">BMI</StyledText>
      </StyledView>
    </StyledView>
  </StyledView>
);

const calculateBMI = (height, weight) => {
  if (!height || !weight) return null;
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
};

const getBMICategory = (bmi) => {
  if (!bmi) return null;
  if (bmi < 18.5) return { label: 'Underweight', color: '#FFB020' };
  if (bmi < 25) return { label: 'Normal', color: '#4CAF50' };
  if (bmi < 30) return { label: 'Overweight', color: '#FF9800' };
  return { label: 'Obese', color: '#F44336' };
};

const Dashboard = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [mealLogs, setMealLogs] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  const fetchData = async () => {
    try {
      const authToken = await AsyncStorage.getItem("userToken");
      
      // Fetch user profile
      const profileResponse = await axios.get(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/user/profile`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setUserProfile(profileResponse.data.data);

      // Fetch workout logs
      const workoutResponse = await axios.get(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/workout/logExercise`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setWorkoutLogs(workoutResponse.data.workoutLogs || []);

      // Fetch meal logs (adjust endpoint as needed)
      const mealResponse = await axios.get(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/meal/logs`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setMealLogs(mealResponse.data.mealLogs || []);
    } catch (error) {
      Alert.alert("Error", "Could not fetch dashboard data");
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate dashboard stats
  const todayStats = {
    workouts: workoutLogs.filter(log => {
      if (!log.performed_at) return false;
      const logDate = new Date(log.performed_at);
      const today = new Date();
      return logDate.toDateString() === today.toDateString();
    }).length,
    calories: {
      burned: workoutLogs
        .filter(log => {
          if (!log.performed_at) return false;
          const logDate = new Date(log.performed_at);
          const today = new Date();
          return logDate.toDateString() === today.toDateString();
        })
        .reduce((sum, log) => sum + (parseFloat(log.calories_burned || 0)), 0),
      consumed: mealLogs
        .filter(log => {
          if (!log.created_at) return false;
          const logDate = new Date(log.created_at);
          const today = new Date();
          return logDate.toDateString() === today.toDateString();
        })
        .reduce((sum, log) => sum + (log.calories || 0), 0),
    },
  };

  const getWeeklyData = (logs, isWorkout = true) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = new Array(7).fill(0);
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    logs.forEach(log => {
      const logDate = new Date(isWorkout ? log.performed_at : log.created_at);
      if (logDate >= startOfWeek) {
        const dayIndex = logDate.getDay();
        data[dayIndex] += isWorkout 
          ? parseFloat(log.calories_burned || 0)
          : (log.calories || 0);
      }
    });

    return { labels: days, data };
  };

  const calculateStreak = (logs) => {
    if (!logs.length) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let streak = 0;
    let currentDate = new Date(today);

    while (true) {
      const hasWorkout = logs.some(log => {
        const logDate = new Date(log.performed_at);
        logDate.setHours(0, 0, 0, 0);
        return logDate.getTime() === currentDate.getTime();
      });

      if (!hasWorkout) break;
      
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  };

  const chartConfig = {
    backgroundColor: "#1F1F28",
    backgroundGradientFrom: "#1F1F28",
    backgroundGradientTo: "#1F1F28",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
    style: { 
      borderRadius: 16,
      paddingRight: 0
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      strokeOpacity: 0.2,
      strokeColor: "#fff"
    },
    propsForLabels: {
      fontSize: 11,
      fontWeight: "600"
    },
    propsForVerticalLabels: {
      fontSize: 10,
      fontWeight: "400"
    }
  };

  if (loading) {
    return (
      <StyledView className="flex-1 bg-[#0F0F14] items-center justify-center">
        <ActivityIndicator size="large" color="#4F46E5" />
      </StyledView>
    );
  }

  return (
    <StyledView className="flex-1 bg-[#0F0F14]">
      <StatusBar barStyle="light-content" />
      <StyledSafeAreaView className="flex-1">
        <StyledScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#4F46E5"
              colors={["#4F46E5"]}
              progressBackgroundColor="#1F1F28"
            />
          }
        >
          {/* Hero Section */}
          <StyledLinearGradient
            colors={['#4F46E5', '#302F4E']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="h-[250px] relative"
          >
            <LinearGradient
              colors={['rgba(15, 15, 20, 0)', 'rgba(15, 15, 20, 0.9)', 'rgba(15, 15, 20, 1)']}
              className="h-full px-6 pt-4"
            >
              <StyledView className="flex-row items-center justify-between mt-8 mb-6">
                <StyledView>
                  <StyledText className="text-white/80 text-base">
                    Welcome back
                  </StyledText>
                  <StyledText className="text-white text-2xl font-bold mt-1">
                  {console.log(userProfile)}
                    {userProfile?.name?.split(' ')[0] || 'User'} 👋
                  </StyledText>
                </StyledView>
                <StyledTouchableOpacity 
                  className="bg-white/10 p-2 rounded-full border border-white/20"
                  onPress={() => router.push("/profile")}
                >
                  {userProfile?.profile_picture ? (
                    <Image 
                      source={{ uri: userProfile.profile_picture }}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <Ionicons name="person" size={24} color="white" />
                  )}
                </StyledTouchableOpacity>
              </StyledView>

              <StyledView className="flex-row justify-between mb-4">
                <StyledView className="bg-white/10 px-4 py-2 rounded-2xl">
                  <StyledText className="text-white/60 text-xs">Today's Workouts</StyledText>
                  <StyledText className="text-white text-lg font-bold">
                    {todayStats.workouts}
                  </StyledText>
                </StyledView>
                <StyledView className="bg-white/10 px-4 py-2 rounded-2xl">
                  <StyledText className="text-white/60 text-xs">Calories Burned</StyledText>
                  <StyledText className="text-white text-lg font-bold">
                    {todayStats.calories.burned.toFixed(0)}
                  </StyledText>
                </StyledView>
              </StyledView>
            </LinearGradient>
          </StyledLinearGradient>

          <UserStatsCard userProfile={userProfile} />

          <StyledView className="px-4 -mt-8">
            {/* Today's Overview Card */}
            <StyledView className="bg-[#1F1F28] rounded-3xl p-6 mb-6 border border-[#4F46E5]/5 shadow-lg">
              <StyledView className="flex-row justify-between items-center mb-4">
                <StyledText className="text-white text-lg font-bold">Today's Overview</StyledText>
                <StyledView className="bg-[#2C2C3E] px-3 py-1 rounded-full">
                  <StyledText className="text-gray-400 text-sm">
                    {new Date().toLocaleDateString('en-US', { 
                      month: 'short',
                      day: 'numeric'
                    })}
                  </StyledText>
                </StyledView>
              </StyledView>

              <StyledView className="flex-row justify-between mb-4">
                <StyledView>
                  <StyledText className="text-gray-400 text-sm">Burned</StyledText>
                  <StyledText className="text-[#4F46E5] text-2xl font-bold mt-1">
                    {todayStats.calories.burned.toFixed(0)}
                  </StyledText>
                </StyledView>
                <StyledView className="items-center">
                  <StyledText className="text-gray-400 text-sm">Goal</StyledText>
                  <StyledText className="text-white text-2xl font-bold mt-1">2000</StyledText>
                </StyledView>
                <StyledView className="items-end">
                  <StyledText className="text-gray-400 text-sm">Consumed</StyledText>
                  <StyledText className="text-[#FF6B6B] text-2xl font-bold mt-1">
                    {todayStats.calories.consumed}
                  </StyledText>
                </StyledView>
              </StyledView>

              <StyledView className="h-2 bg-[#2C2C3E] rounded-full overflow-hidden">
                <StyledLinearGradient
                  colors={['#4F46E5', '#FF6B6B']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="h-full"
                  style={{ 
                    width: `${todayStats.calories.consumed > 0 
                      ? Math.min((todayStats.calories.burned / 2000) * 100, 100)
                      : 0}%` 
                  }}
                />
              </StyledView>
            </StyledView>

            {/* Stats Grid */}
            <StyledView className="flex-row flex-wrap gap-4 mb-6">
              <StyledView className="flex-1">
                <DashboardCard
                  title="Workout"
                  value={todayStats.workouts}
                  subtitle="Today"
                  icon="barbell"
                  color="#4F46E5"
                />
              </StyledView>
              <StyledView className="flex-1">
                <DashboardCard
                  title="Streak"
                  value={`${calculateStreak(workoutLogs)} days`}
                  icon="flame"
                  color="#FF6B6B"
                />
              </StyledView>
            </StyledView>

            {/* Weekly Progress Chart */}
            <StyledView className="bg-[#1F1F28] rounded-3xl p-6 mb-6 border border-[#4F46E5]/5">
              <StyledView className="flex-row items-center justify-between mb-6">
                <StyledView>
                  <StyledText className="text-white text-lg font-bold">Weekly Progress</StyledText>
                  <StyledText className="text-gray-400 text-xs mt-1">
                    Last 7 days activity
                  </StyledText>
                </StyledView>
                <StyledView className="flex-row items-center space-x-4">
                  <StyledView className="flex-row items-center">
                    <StyledLinearGradient
                      colors={['#4F46E5', '#4F46E580']}
                      className="w-3 h-3 rounded-full mr-2"
                    />
                    <StyledText className="text-gray-400 text-xs">Burned</StyledText>
                  </StyledView>
                  <StyledView className="flex-row items-center">
                    <StyledLinearGradient
                      colors={['#FF6B6B', '#FF6B6B80']}
                      className="w-3 h-3 rounded-full mr-2"
                    />
                    <StyledText className="text-gray-400 text-xs">Consumed</StyledText>
                  </StyledView>
                </StyledView>
              </StyledView>
              
              <LineChart
                data={{
                  labels: getWeeklyData(workoutLogs).labels,
                  datasets: [
                    {
                      data: getWeeklyData(workoutLogs).data,
                      color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
                      strokeWidth: 2,
                    },
                    {
                      data: getWeeklyData(mealLogs, false).data,
                      color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`,
                      strokeWidth: 2,
                    },
                  ],
                }}
                width={Dimensions.get("window").width - 48}
                height={180}
                chartConfig={chartConfig}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
                withVerticalLines={false}
                withHorizontalLines={true}
                withHorizontalLabels={true}
                withShadow={false}
                segments={4}
                formatYLabel={(value) => `${parseInt(value)}`}
              />
            </StyledView>

            {/* Quick Actions */}
            <StyledView className="mb-8">
              <StyledText className="text-white text-lg font-bold mb-4">Quick Actions</StyledText>
              <StyledView className="grid grid-cols-2 gap-4">
                <StyledTouchableOpacity 
                  className="bg-[#1F1F28] rounded-2xl p-4 border border-[#4F46E5]/5"
                  onPress={() => router.push("/log-workout")}
                >
                  <StyledView className="bg-[#4F46E5]/10 w-12 h-12 rounded-full items-center justify-center mb-2">
                    <Ionicons name="barbell" size={24} color="#4F46E5" />
                  </StyledView>
                  <StyledText className="text-white font-bold">Log Workout</StyledText>
                  <StyledText className="text-gray-400 text-xs mt-1">Track your exercise</StyledText>
                </StyledTouchableOpacity>

                <StyledTouchableOpacity 
                  className="bg-[#1F1F28] rounded-2xl p-4 border border-[#4F46E5]/5"
                  onPress={() => router.push("/meals")}
                >
                  <StyledView className="bg-[#4F46E5]/10 w-12 h-12 rounded-full items-center justify-center mb-2">
                    <Ionicons name="fast-food" size={24} color="#4F46E5" />
                  </StyledView>
                  <StyledText className="text-white font-bold">Log Meal</StyledText>
                  <StyledText className="text-gray-400 text-xs mt-1">Track your nutrition</StyledText>
                </StyledTouchableOpacity>

                <StyledTouchableOpacity 
                  className="bg-[#1F1F28] rounded-2xl p-4 border border-[#4F46E5]/5"
                  onPress={() => router.push("/progress")}
                >
                  <StyledView className="bg-[#4F46E5]/10 w-12 h-12 rounded-full items-center justify-center mb-2">
                    <Ionicons name="trending-up" size={24} color="#4F46E5" />
                  </StyledView>
                  <StyledText className="text-white font-bold">View Progress</StyledText>
                  <StyledText className="text-gray-400 text-xs mt-1">Track your journey</StyledText>
                </StyledTouchableOpacity>

                <StyledTouchableOpacity 
                  className="bg-[#1F1F28] rounded-2xl p-4 border border-[#4F46E5]/5"
                  onPress={() => router.push("/goals")}
                >
                  <StyledView className="bg-[#4F46E5]/10 w-12 h-12 rounded-full items-center justify-center mb-2">
                    <Ionicons name="flag" size={24} color="#4F46E5" />
                  </StyledView>
                  <StyledText className="text-white font-bold">Set Goals</StyledText>
                  <StyledText className="text-gray-400 text-xs mt-1">Define targets</StyledText>
                </StyledTouchableOpacity>
              </StyledView>
            </StyledView>

            {/* Recent Activity */}
            <StyledView className="mb-6">
              <StyledView className="flex-row items-center justify-between mb-4">
                <StyledText className="text-white text-lg font-bold">Recent Activity</StyledText>
                <StyledTouchableOpacity>
                  <StyledText className="text-[#4F46E5]">See All</StyledText>
                </StyledTouchableOpacity>
              </StyledView>
              
              {[...workoutLogs, ...mealLogs]
                .sort((a, b) => new Date(b.performed_at || b.created_at) - new Date(a.performed_at || a.created_at))
                .slice(0, 5)
                .map((log, index) => (
                  <ActivityItem key={index} log={log} index={index} />
                ))}
            </StyledView>
          </StyledView>
        </StyledScrollView>
      </StyledSafeAreaView>
    </StyledView>
  );
};

export default Dashboard;
