import { ScrollView, Text, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '../constants';
import CustomButton from '../components/CustomButton';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';

export default function SplashScreen() {

    const onboarded =  () => {
        router.push('/onboarding');
    };

  return (
    <SafeAreaView className="bg-background h-full">
        <View className="flex-1 justify-between p-12">
            <View className="flex-1 justify-center items-center">
                <Image 
                    source={images.logo} 
                    resizeMode='contain' 
                    className="w-[200px] h-[50px]"
                />
                <Text
                    className="text-gray-100 text-center pt-1 font-bold"
                >
                    Everybody Can Train
                </Text>
            </View>

            <View>
                <CustomButton
                    title="Get Started"
                    handlePress={onboarded}
                />
            </View>
        </View>
    </SafeAreaView>
  );
}
