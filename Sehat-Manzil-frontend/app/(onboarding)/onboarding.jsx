import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient'; // Assuming you use expo-linear-gradient
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons
import { images } from '../../constants';

const OnBoarding = () => {

    const [index, setIndex] = useState(0)
    const onBoardingArr = [
        {
            title: 'Track Your Goal',
            description: 'Don\'t worry if you have trouble determining your goals, We can help you determine your goals and track your goals',
            image: images.onBoarding1
        },
        {
            title: 'Get Burn',
            description: 'Let\'s keep burning, to achieve your goals, it hurts only temporarily, if you give up now you will be in pain forever',
            image: images.onBoarding2
        },
        {
            title: 'Eat Well',
            description: 'Let\'s start a healthy lifestyle with us, we can determine your diet every day. Healthy eating is fun',
            image: images.onBoarding3
        },
        {
            title: 'Improve Sleep Quality',
            description: 'Improve the quality of your sleep with us, good quality sleep can bring a good mood in the morning',
            image: images.onBoarding4
        }
    ]

    async function handleClick() {
        if (index < onBoardingArr.length - 1) {
            setIndex((prevIndex) => prevIndex + 1);
        } else {
            await AsyncStorage.setItem('onboarded', 'true')
            router.replace('/Login')   
        }
    }

    return (
        <SafeAreaView className="bg-background flex-1 items-center">
            <View className="w-full flex-1 flex-col justify-start">
                {/* Image sticked to the top */}
                <Image source={onBoardingArr[index].image} resizeMode='cover' className="w-full h-80" />
            </View>
            <View className="px-5 mt-5">
                <Text className="text-2xl text-white font-pbold">{onBoardingArr[index].title}</Text>
                <Text className="text-white mt-5 font-pextralight">
                    {onBoardingArr[index].description}
                </Text>
            </View>

            {/* Button container aligned to the right */}
            <View className="flex-row items-center justify-end w-full px-5 mt-5 mb-10">
                <LinearGradient
                    colors={['#983BCB', '#4023D7']}
                    start={{ x: 0.25, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="w-20 h-20 rounded-full justify-center items-center"
                >
                    <TouchableOpacity onPress={handleClick} className="w-full h-full justify-center items-center">
                        {/* Changed the ">" icon to Ionicons */}
                        <Ionicons name="arrow-forward" size={30} color="white" />
                    </TouchableOpacity>
                </LinearGradient>
            </View>
        </SafeAreaView>
    );
}

export default OnBoarding;
