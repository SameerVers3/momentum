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

const WorkoutsPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('plans'); // 'plans' or 'history'

  const fetchData = async () => {
    try {
      const authToken = await AsyncStorage.getItem("userToken");
      
      // Fetch workout plans
      const plansResponse = await axios.get(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/workout/getWorkoutPlansByUser`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setWorkoutPlans(plansResponse.data.workoutPlans || []);
      
      console.log("plansResponse.data", plansResponse.data);
      // Fetch workout logs
      const logsResponse = await axios.get(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/workout/logExercise`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      console.log(logsResponse.data);
      setWorkoutLogs(logsResponse.data.workoutLogs || []);
    } catch (error) {
      Alert.alert("Error", "Could not fetch workout data");
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const WorkoutAnalytics = ({ workoutLogs }) => {
    // Calculate analytics
    const totalWorkouts = workoutLogs.length;
    const totalDuration = workoutLogs.reduce((sum, log) => sum + (parseInt(log.duration) || 0), 0);
    const totalCalories = workoutLogs.reduce((sum, log) => sum + (parseFloat(log.calories_burned) || 0), 0);
    
    // Get workouts in the last 7 days
    const last7Days = workoutLogs.filter(log => {
      const logDate = new Date(log.performed_at);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return logDate >= sevenDaysAgo;
    }).length;

    // Calculate average duration per workout
    const avgDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;

    // Prepare data for the last 7 days graph
    const last7DaysData = () => {
      const dates = [];
      const durations = [];
      const calories = [];
      
      // Get today's date at midnight for consistent comparison
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dates.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        
        const logsForDay = workoutLogs.filter(log => {
          if (!log.performed_at) return false;
          
          try {
            const logDate = new Date(log.performed_at);
            logDate.setHours(0, 0, 0, 0);
            return logDate.getTime() === date.getTime();
          } catch (error) {
            console.error('Invalid date:', log.performed_at);
            return false;
          }
        });
        
        // Calculate totals for the day with proper number conversion
        const dayDuration = logsForDay.reduce((sum, log) => {
          const duration = parseInt(log.duration) || 0;
          return sum + duration;
        }, 0);

        const dayCalories = logsForDay.reduce((sum, log) => {
          const calories = parseFloat(log.calories_burned) || 0;
          return sum + calories;
        }, 0);
        
        durations.push(dayDuration);
        calories.push(dayCalories);
      }

      return { dates, durations, calories };
    };

    const { dates, durations, calories } = last7DaysData();

    useEffect(() => {
      const { dates, durations, calories } = last7DaysData();
      console.log('Graph Data:', {
        dates,
        durations,
        calories,
        workoutLogs: workoutLogs.map(log => ({
          date: new Date(log.created_at),
          duration: log.duration,
          calories: log.calories_burned
        }))
      });
    }, [workoutLogs]);

    return (
      <StyledView className="mb-6">
        <StyledText className="text-white text-xl font-bold mb-4">
          Workout Analytics
        </StyledText>
        
        {/* Stats Grid */}
        <StyledView className="flex-row flex-wrap gap-4">
          {/* Total Workouts Card */}
          <StyledView className="flex-1 min-w-[45%] bg-[#1F1F28] rounded-2xl p-4 border border-[#4F46E5]/10">
            <StyledView className="bg-[#4F46E5]/20 w-10 h-10 rounded-full items-center justify-center mb-2">
              <Ionicons name="fitness" size={20} color="#4F46E5" />
            </StyledView>
            <StyledText className="text-white text-2xl font-bold">
              {totalWorkouts}
            </StyledText>
            <StyledText className="text-gray-400 text-sm">
              Total Workouts
            </StyledText>
          </StyledView>

          {/* Last 7 Days Card */}
          <StyledView className="flex-1 min-w-[45%] bg-[#1F1F28] rounded-2xl p-4 border border-[#4F46E5]/10">
            <StyledView className="bg-[#4F46E5]/20 w-10 h-10 rounded-full items-center justify-center mb-2">
              <Ionicons name="calendar" size={20} color="#4F46E5" />
            </StyledView>
            <StyledText className="text-white text-2xl font-bold">
              {last7Days}
            </StyledText>
            <StyledText className="text-gray-400 text-sm">
              Last 7 Days
            </StyledText>
          </StyledView>

          {/* Total Duration Card */}
          <StyledView className="flex-1 min-w-[45%] bg-[#1F1F28] rounded-2xl p-4 border border-[#4F46E5]/10">
            <StyledView className="bg-[#4F46E5]/20 w-10 h-10 rounded-full items-center justify-center mb-2">
              <Ionicons name="time" size={20} color="#4F46E5" />
            </StyledView>
            <StyledText className="text-white text-2xl font-bold">
              {totalDuration}
            </StyledText>
            <StyledText className="text-gray-400 text-sm">
              Total Minutes
            </StyledText>
          </StyledView>

          {/* Total Calories Card */}
          <StyledView className="flex-1 min-w-[45%] bg-[#1F1F28] rounded-2xl p-4 border border-[#4F46E5]/10">
            <StyledView className="bg-[#4F46E5]/20 w-10 h-10 rounded-full items-center justify-center mb-2">
              <Ionicons name="flame" size={20} color="#4F46E5" />
            </StyledView>
            <StyledText className="text-white text-2xl font-bold">
              {totalCalories}
            </StyledText>
            <StyledText className="text-gray-400 text-sm">
              Calories Burned
            </StyledText>
          </StyledView>
        </StyledView>

        {/* Average Stats */}
        <StyledView className="bg-[#1F1F28] rounded-2xl mt-4 p-4 border border-[#4F46E5]/10">
          <StyledView className="flex-row items-center justify-between">
            <StyledView>
              <StyledText className="text-gray-400 text-sm">
                Average Duration
              </StyledText>
              <StyledText className="text-white text-lg font-bold">
                {avgDuration} min/workout
              </StyledText>
            </StyledView>
            <StyledView>
              <StyledText className="text-gray-400 text-sm">
                Avg. Calories
              </StyledText>
              <StyledText className="text-white text-lg font-bold">
                {totalWorkouts > 0 ? Math.round(totalCalories / totalWorkouts) : 0} cal/workout
              </StyledText>
            </StyledView>
          </StyledView>
        </StyledView>

        {/* Workout Trends Graph */}
        <StyledView className="mt-6">
          <StyledText className="text-white text-xl font-bold mb-4">
            Weekly Trends
          </StyledText>
          
          <StyledView className="bg-[#1F1F28] rounded-2xl p-4 border border-[#4F46E5]/10">
            <LineChart
              data={{
                labels: dates,
                datasets: [
                  {
                    data: durations.some(d => d > 0) ? durations : [0],
                    color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
                    strokeWidth: 2
                  }
                ]
              }}
              width={Dimensions.get("window").width - 48} // -48 for padding
              height={220}
              chartConfig={{
                backgroundColor: "#1F1F28",
                backgroundGradientFrom: "#1F1F28",
                backgroundGradientTo: "#1F1F28",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
                style: {
                  borderRadius: 16
                },
                propsForDots: {
                  r: "6",
                  strokeWidth: "2",
                  stroke: "#4F46E5"
                }
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16
              }}
            />
            <StyledText className="text-gray-400 text-sm text-center mt-2">
              Workout Duration (minutes)
            </StyledText>
          </StyledView>

          {/* Calories Trend Graph */}
          <StyledView className="bg-[#1F1F28] rounded-2xl p-4 border border-[#4F46E5]/10 mt-4">
            <LineChart
              data={{
                labels: dates,
                datasets: [
                  {
                    data: calories.some(c => c > 0) ? calories : [0],
                    color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
                    strokeWidth: 2
                  }
                ]
              }}
              width={Dimensions.get("window").width - 48}
              height={220}
              chartConfig={{
                backgroundColor: "#1F1F28",
                backgroundGradientFrom: "#1F1F28",
                backgroundGradientTo: "#1F1F28",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
                style: {
                  borderRadius: 16
                },
                propsForDots: {
                  r: "6",
                  strokeWidth: "2",
                  stroke: "#EF4444"
                }
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16
              }}
            />
            <StyledText className="text-gray-400 text-sm text-center mt-2">
              Calories Burned
            </StyledText>
          </StyledView>
        </StyledView>
      </StyledView>
    );
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
          {/* Header with Gradient */}
          <StyledLinearGradient
            colors={['#4F46E5', '#302F4E']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="h-[180px]"
          >
            <LinearGradient
              colors={['rgba(15, 15, 20, 0)', 'rgba(15, 15, 20, 0.9)', 'rgba(15, 15, 20, 1)']}
              className="h-full px-6 pb-4 justify-end"
            >
              <StyledText className="text-white text-3xl font-bold mb-2">
                My Workouts
              </StyledText>
              <StyledText className="text-gray-400 text-lg">
                Track your fitness journey
              </StyledText>
            </LinearGradient>
          </StyledLinearGradient>

          {/* Tab Selector */}
          <StyledView className="flex-row px-4 -mt-4 mb-4">
            <StyledTouchableOpacity
              onPress={() => setActiveTab('plans')}
              className={`flex-1 py-3 ${activeTab === 'plans' ? 'border-b-2 border-[#4F46E5]' : ''}`}
            >
              <StyledText className={`text-center font-semibold ${activeTab === 'plans' ? 'text-[#4F46E5]' : 'text-gray-400'}`}>
                Workout Plans
              </StyledText>
            </StyledTouchableOpacity>
            <StyledTouchableOpacity
              onPress={() => setActiveTab('history')}
              className={`flex-1 py-3 ${activeTab === 'history' ? 'border-b-2 border-[#4F46E5]' : ''}`}
            >
              <StyledText className={`text-center font-semibold ${activeTab === 'history' ? 'text-[#4F46E5]' : 'text-gray-400'}`}>
                History
              </StyledText>
            </StyledTouchableOpacity>
          </StyledView>

          <StyledView className="px-4">
            {activeTab === 'plans' ? (
              // Workout Plans Section
              workoutPlans.length === 0 ? (
                <StyledView className="bg-[#1F1F28] rounded-2xl p-6 items-center">
                  <Ionicons name="fitness-outline" size={48} color="#4F46E5" />
                  <StyledText className="text-white text-lg font-semibold mt-4">
                    No Workout Plans Yet
                  </StyledText>
                  <StyledText className="text-gray-400 text-center mt-2">
                    Start adding workouts to create your personal training plan
                  </StyledText>
                  <StyledTouchableOpacity
                    onPress={() => router.push("/browse-workouts")}
                    className="bg-[#4F46E5] px-6 py-3 rounded-full mt-4"
                  >
                    <StyledText className="text-white font-semibold">
                      Browse Workouts
                    </StyledText>
                  </StyledTouchableOpacity>
                </StyledView>
              ) : (
                workoutPlans.map((plan, index) => (
                  <StyledView
                    key={index}
                    className="bg-[#1F1F28] rounded-2xl mb-4 overflow-hidden shadow-lg border border-[#4F46E5]/10"
                  >
                    <StyledView className="p-4">
                      <StyledView className="flex-row items-center justify-between">
                        <StyledView className="flex-row items-center flex-1">
                          <StyledView className="bg-[#4F46E5]/20 w-12 h-12 rounded-2xl items-center justify-center mr-4">
                            <Ionicons name="barbell-outline" size={24} color="#4F46E5" />
                          </StyledView>
                          <StyledView className="flex-1">
                            <StyledText className="text-white text-lg font-bold">
                              {plan.description || `Workout Plan ${index + 1}`}
                            </StyledText>
                            <StyledText className="text-gray-400">
                              Started: {formatDate(plan.start_date)}
                            </StyledText>
                          </StyledView>
                        </StyledView>
                        <StyledTouchableOpacity
                          onPress={() => {
                            router.push({
                              pathname: "/log-workout",
                              params: { workout: JSON.stringify(plan) }
                            });
                          }}
                          className="bg-[#2C2C3E] p-3 rounded-xl"
                        >
                          <Ionicons name="add-outline" size={24} color="#FFFFFF" />
                        </StyledTouchableOpacity>
                      </StyledView>
                    </StyledView>
                  </StyledView>
                ))
              )
            ) : (
              // Workout History Section
              workoutLogs.length === 0 ? (
                <StyledView className="bg-[#1F1F28] rounded-2xl p-6 items-center">
                  <Ionicons name="time-outline" size={48} color="#4F46E5" />
                  <StyledText className="text-white text-lg font-semibold mt-4">
                    No Workout History
                  </StyledText>
                  <StyledText className="text-gray-400 text-center mt-2">
                    Your completed workouts will appear here
                  </StyledText>
                </StyledView>
              ) : (
                <>
                  <WorkoutAnalytics workoutLogs={workoutLogs} />
                  
                  <StyledText className="text-white text-xl font-bold mb-4">
                    Recent Workouts
                  </StyledText>

                  {workoutLogs.map((log, index) => (
                    <StyledView
                      key={log.log_id || index}
                      className="bg-[#1F1F28] rounded-2xl mb-4 overflow-hidden shadow-lg border border-[#4F46E5]/10"
                    >
                      <StyledView className="p-4">
                        <StyledView className="flex-row items-center mb-3">
                          <StyledView className="bg-[#4F46E5]/20 w-12 h-12 rounded-2xl items-center justify-center mr-4">
                            <Ionicons name="checkmark-circle-outline" size={24} color="#4F46E5" />
                          </StyledView>
                          <StyledView className="flex-1">
                            <StyledText className="text-white text-lg font-bold">
                              Completed Workout
                            </StyledText>
                            <StyledText className="text-gray-400">
                              {formatDate(log.performed_at)}
                            </StyledText>
                          </StyledView>
                        </StyledView>
                        
                        <StyledView className="flex-row justify-between mt-2">
                          <StyledView className="bg-[#2C2C3E] px-3 py-1 rounded-full">
                            <StyledText className="text-gray-400">
                              {log.duration} min
                            </StyledText>
                          </StyledView>
                          <StyledView className="bg-[#2C2C3E] px-3 py-1 rounded-full">
                            <StyledText className="text-gray-400">
                              {parseFloat(log.calories_burned).toFixed(0)} cal
                            </StyledText>
                          </StyledView>
                        </StyledView>

                        {log.notes && (
                          <StyledText className="text-gray-400 mt-3">
                            {log.notes}
                          </StyledText>
                        )}
                      </StyledView>
                    </StyledView>
                  ))}
                </>
              )
            )}
          </StyledView>
        </StyledScrollView>
      </StyledSafeAreaView>
    </StyledView>
  );
};

export default WorkoutsPage; 