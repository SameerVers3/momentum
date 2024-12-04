import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

const Screens = () => {
  return (
    <Stack>
        <Stack.Screen name='privacy' options={{headerShown:false}}/>
        <Stack.Screen name='support' options={{headerShown:false}}/>
    </Stack>
  )
}

export default Screens

const styles = StyleSheet.create({})