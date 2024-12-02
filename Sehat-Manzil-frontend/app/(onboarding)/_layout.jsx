import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

const OnboardingLayout = () => {
  return (
    <Stack>
        <Stack.Screen name='onboarding' options={{headerShown:false}}/>
    </Stack>
  )
}

export default OnboardingLayout

const styles = StyleSheet.create({})