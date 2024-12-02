import { View, Text } from 'react-native'
import React from 'react'
import {Stack} from "expo-router"
import {StatusBar} from "expo-status-bar"
const DashboardLayout = () => {
  return (
    <>
      <Stack>
        <Stack.Screen name='home' options={{headerShown: false}}/>
        <Stack.Screen name='manage-workouts' options={{headerShown: false}}/>
        <Stack.Screen name='add-workouts' options={{headerShown: false}}/>
        <Stack.Screen name='workout-details' options={{headerShown: false}}/>
        <Stack.Screen name='view-workouts' options={{headerShown: false}}/>
        <Stack.Screen name='search-exercise' options={{headerShown: false}}/>
        <Stack.Screen name='exercise-details' options={{headerShown: false}}/>
      </Stack>
      <StatusBar backgroundColor="#161622"/>
    </>
  )
}

export default DashboardLayout