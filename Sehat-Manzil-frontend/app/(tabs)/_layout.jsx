import { View } from 'react-native';
import React from 'react';
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const TabIcon = ({ name, color, focused }) => {
  const iconName = focused ? name : `${name}-outline`;

  return (
    <View
      className="flex justify-center items-center"
      style={{
        width: 50,
        height: 50,
      }}
    >
      <Ionicons
        name={iconName}
        size={28}
        color={color}
      />
    </View>
  );
};

const TabsLayout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#4F46E5",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          backgroundColor: "#1F1F28",
          paddingBottom: 10,
          paddingTop: 10,
          height: 64,
          position: 'absolute',
          left: 20,
          right: 20,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          display: 'flex',
          justifyContent: 'center',
          borderTopWidth: 0,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.25,
          shadowRadius: 10,
          elevation: 5,
          borderWidth: 1,
          borderColor: "rgba(79, 70, 229, 0.1)",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name="home"
              color={color}
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="create"
        options={{
          title: "Create",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name="add"
              color={color}
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name="person"
              color={color}
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="meals"
        options={{
          title: "meals",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name="fast-food"
              color={color}
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="workouts"
        options={{
          title: "workouts",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name="barbell"
              color={color}
              focused={focused}
            />
          ),
        }}
      />

      {/* Future Trainer Tab */}
      <Tabs.Screen
        name="trainer"
        options={{
          title: "Trainer (Coming Soon)",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name="barbell"
              color={color}
              focused={focused}
            />
          ),
          tabBarStyle: {
            display: 'none',
          },
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
