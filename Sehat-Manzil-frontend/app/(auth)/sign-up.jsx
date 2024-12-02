import { View, Text, ScrollView, Image, Alert} from 'react-native'
import React, {useState} from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link, router } from 'expo-router'
import axios from 'axios'

import {images } from "../../constants"
import FormField from '../../components/FormField'
import CustomButton from '../../components/CustomButton'
import { BASE_URL } from '../../constants/api'
import AsyncStorage from '@react-native-async-storage/async-storage'

const SignUp = () => {

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false) 

  const submit = async () => {
    setIsSubmitting(true);  // Set loading state
      console.log(form.email + ' submitted' + form.password)

      if(!form.username || !form.password){
        Alert.alert('error','Fill all fields');
        setIsSubmitting(false); 
        return;
      }
    try {
        // Sending form data (email and password) to the API
        const res = await axios.post(`${BASE_URL}/adduser`, {
            email: form.email,
            pass: form.password, // Use the correct form field name for password
        },
      {headers:{"Content-Type":"application/json"}});

        // Handle successful response
        console.log('User added successfully:', res.data);
        setIsSubmitting(false);
        const profile = {
          email: form.email,
        };
        await AsyncStorage.setItem('user', JSON.stringify(profile));
   // Reset loading state
        router.replace('/userprofile')
    } catch (error) {
        console.error('Error submitting form:', error.response?.data || error.message);
        setIsSubmitting(false); // Reset loading state
    }
}

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
            Sign up to Aora
          </Text>

          <FormField
            title="Username"
            value={form.username}
            handleChangeText={(e) => setForm({ ...form, username: e })}
            otherStyles="mt-7"
          />

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
          />

          <CustomButton
            title="Sign Up"
            handlePress={submit}
            containerStyles="mt-7"
            isLoading={isSubmitting}
          />

          <View className="justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-gray-100 font-pregular"> Have an Account already? </Text>
            <Link href="/sign-in"
              className="text-lg text-secondary-200 font-psemibold"
            >Sign In</Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignUp