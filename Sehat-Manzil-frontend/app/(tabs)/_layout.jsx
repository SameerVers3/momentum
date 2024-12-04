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
        width: 50, // Ensures consistent width for centering
        height: 50, // Ensures consistent height for centering
      }}
    >
      <Ionicons
        name={iconName} // Dynamically switch between filled and outline icons
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
        tabBarActiveTintColor: "#8000FF",
        tabBarInactiveTintColor: "#CDCDE0",
        tabBarStyle: {
          backgroundColor: "#161622",
          paddingBottom: 10,
          paddingTop: 10,
          height: 64,
          position: 'absolute', // Floating tab bar
          left: 20,
          right: 20,
          borderTopLeftRadius: 20, // Round only the top-left corner
          borderTopRightRadius: 20, // Round only the top-right corner
          display: 'flex', // Ensure tab bar behaves as a flex container
          justifyContent: 'center',
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
              name="home" // Base name of the icon
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
        name="bookmark"
        options={{
          title: "Bookmark",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name="bookmark"
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
              name="barbell" // Icon representing trainer/fitness
              color={color}
              focused={focused}
            />
          ),
          tabBarStyle: {
            display: 'none', // Hide this tab for now
          },
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
