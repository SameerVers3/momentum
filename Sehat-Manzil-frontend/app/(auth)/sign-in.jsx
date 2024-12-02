import { View, Text, ScrollView, Image, Alert } from 'react-native'
import React, { useState} from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link, router } from 'expo-router'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { images } from "../../constants"
import FormField from '../../components/FormField'
import CustomButton from '../../components/CustomButton'
import { useEffect } from 'react'
import { BASE_URL } from '../../constants/api'

const SignIn = () => {
    const [form, setForm] = useState({
        email: '',
        password: ''
    })

    const [isSubmitting, setIsSubmitting] = useState(false)

    

    // In the submit function, change the router.replace line:
const submit = async () => {
  
  if (!form.email || !form.password) {
      Alert.alert('Error', 'Please fill in all fields');
      setIsSubmitting(false);
      return;
  }
  setIsSubmitting(true);
  try {
      const response = await axios.post(`${BASE_URL}/signin`, {
          email: form.email,
          pass: form.password
      }, {
          headers: { "Content-Type": "application/json" }
      });

      if (response.data.success) {
          // Login successful
          console.log('Login successful:', response.data.user.email);
          const profile = {
            email: response.data.user.email
          }
          await AsyncStorage.setItem('user',JSON.stringify(profile) );  
          router.replace('/home'); 
      }
  } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      Alert.alert(
          'Error',
          error.response?.data?.message || 'An error occurred during sign in'
      );
  } finally {
      setIsSubmitting(false);
  }
}

useEffect(() => {
    const checkUser = async () => {
        try {
            const user = await AsyncStorage.getItem('user');
            if (user) {
                router.replace('/userprofile');
            }
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    };

    checkUser();
}, []);

    return (
        <SafeAreaView className="bg-primary h-full">
            <ScrollView>
                <View className="w-full justify-center min-h-[85vh] px-4 my-6">
                    <Image
                        source={images.logo}
                        resizeMode='contain'
                        className="w-[115px] h-[35px] mx-auto"
                    />

                    <Text className="text-2xl text-white text-semibold mt-10 front-psemibold">
                        Log in to Aora
                    </Text>

                    <FormField
                        title="Email"
                        value={form.email}
                        handleChangeText={(e) => setForm({ ...form, email: e })}
                        otherStyles="mt-7"
                        keyboardType="email-address"
                    />

                    <FormField
                        title="Password"
                        value={form.password}
                        handleChangeText={(e) => setForm({ ...form, password: e })}
                        otherStyles="mt-7"
                        secureTextEntry
                    />

                    <CustomButton
                        title="Sign In"
                        handlePress={submit}
                        containerStyles="mt-7"
                        isLoading={isSubmitting}
                    />

                    <View className="justify-center pt-5 flex-row gap-2">
                        <Text className="text-lg text-gray-100 font-pregular">
                            Don't have an Account?
                        </Text>
                        <Link
                            href="/sign-up"
                            className="text-lg text-secondary-200 font-psemibold"
                        >
                            Sign Up
                        </Link>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default SignIn
