import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    Modal,
    FlatList,
    TouchableWithoutFeedback,
    Platform,
    Alert,
} from 'react-native';
import { ChevronDownIcon } from 'react-native-heroicons/solid';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker'; // Import DateTimePicker
import { SafeAreaView } from 'react-native-safe-area-context';

import { images } from "../../constants"
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Registration2 = () => {
    const [gender, setGender] = useState(''); // To hold the selected gender
    const [isGenderModalVisible, setGenderModalVisible] = useState(false); // Modal visibility
    const [dateOfBirth, setDateOfBirth] = useState(null); // Initialize date as null
    const [showDatePicker, setShowDatePicker] = useState(false); // Control date picker visibility
    const [weight, setWeight] = useState(''); // State for weight
    const [height, setHeight] = useState(''); // State for height

    const genderOptions = ['Male', 'Female', 'Other']; // Gender options

    useEffect(() => {
        const checkUserGoal = async () => {
            try {
                const user = await AsyncStorage.getItem('user');
                const parsedUser = user ? JSON.parse(user) : null;
    
                if (parsedUser?.goal) {
                    // If goal exists, navigate to home
                    router.push('/home');
                }
            } catch (error) {
                console.error('Error checking user goal:', error);
            }
        };
    
        checkUserGoal();
    }, []);

    const selectGender = (selectedGender) => {
        setGender(selectedGender); // Set selected gender
        setGenderModalVisible(false); // Close modal
    };

    const onDateChange = (event, selectedDate) => {
        if (selectedDate) {
            setDateOfBirth(selectedDate); // Set selected date
        }
        setShowDatePicker(Platform.OS === 'ios'); // Keep iOS picker open, close Android picker
    };

    const formatDate = (date) => {
        const day = date.getDate();
        const month = date.getMonth() + 1; // Months are zero-indexed
        const year = date.getFullYear();
        return `${day < 10 ? '0' + day : day}-${month < 10 ? '0' + month : month}-${year}`;
    };

    const handleNumericInput = (input, setter) => {
        const numericValue = input.replace(/[^0-9]/g, ''); // Remove non-numeric characters
        setter(numericValue); // Update the state with numeric value
    };

    const nextpage = async () => {
        if (!gender || !dateOfBirth || !weight || !height) {
            Alert.alert('Error', 'Fill all required fields');
            return;
        }

        try {
            const user = await AsyncStorage.getItem('user');
            const parsedUser = user ? JSON.parse(user) : {};

            await AsyncStorage.setItem('user', JSON.stringify({
                ...parsedUser,
                gender,
                dateOfBirth: formatDate(dateOfBirth),
                weight,
                height,
            }));

            const data = await AsyncStorage.getItem('user');
            const parsedData = data ? JSON.parse(data) : {};
            router.push('/usergoals');
        } catch (error) {
            console.error('Error reading or updating AsyncStorage:', error);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-[#1C1C1C]">
            <View className="flex-1 px-6 py-10 justify-between">
                <View className="items-center">
                    <Image
                        source={images.registration2}
                        className="w-48 h-48 mb-6"
                    />
                    <Text className="text-white text-2xl font-bold mb-2">Let's complete your profile</Text>
                    <Text className="text-gray-400 text-base mb-8">It will help us to know more about you!</Text>
                </View>

                <View className="space-y-4">
                    {/* Gender Input */}
                    <TouchableOpacity
                        onPress={() => setGenderModalVisible(true)}
                        className="bg-[#2C2C2E] rounded-xl flex-row items-center justify-between px-4 py-3"
                    >
                        <TextInput
                            className="text-white text-base flex-1"
                            placeholder="Choose Gender"
                            placeholderTextColor="#6B7280"
                            value={gender}
                            editable={false}
                        />
                        <ChevronDownIcon color="#6B7280" size={20} />
                    </TouchableOpacity>

                    {/* Date of Birth Input */}
                    <TouchableOpacity
                        onPress={() => setShowDatePicker(true)}
                        className="bg-[#2C2C2E] rounded-xl px-4 py-3"
                    >
                        <TextInput
                            className="text-white text-base"
                            placeholder="Date of Birth"
                            placeholderTextColor="#6B7280"
                            value={dateOfBirth ? formatDate(dateOfBirth) : ''}
                            editable={false}
                        />
                    </TouchableOpacity>

                    {/* DateTimePicker modal */}
                    {showDatePicker && (
                        <DateTimePicker
                            value={dateOfBirth || new Date()}
                            mode="date"
                            display="spinner"
                            onChange={onDateChange}
                            maximumDate={new Date()}
                        />
                    )}

                    {/* Weight and Height Inputs */}
                    <View className="flex-row justify-between">
                        <View className="bg-[#2C2C2E] rounded-xl px-4 py-3 w-[48%] flex-row items-center justify-between">
                            <TextInput
                                className="text-white text-base flex-1"
                                placeholder="Your Weight"
                                placeholderTextColor="#6B7280"
                                value={weight}
                                onChangeText={(text) => handleNumericInput(text, setWeight)}
                                keyboardType="numeric"
                            />
                            <Text className="text-[#8E8E93] ml-2">KG</Text>
                        </View>
                        <View className="bg-[#2C2C2E] rounded-xl px-4 py-3 w-[48%] flex-row items-center justify-between">
                            <TextInput
                                className="text-white text-base flex-1"
                                placeholder="Your Height"
                                placeholderTextColor="#6B7280"
                                value={height}
                                onChangeText={(text) => handleNumericInput(text, setHeight)}
                                keyboardType="numeric"
                            />
                            <Text className="text-[#8E8E93] ml-2">CM</Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity onPress={nextpage}>
                    <LinearGradient
                        colors={['#8A2BE2', '#5D3FD3']}
                        start={[0, 0]}
                        end={[1, 1]}
                        className="rounded-xl py-4 items-center mt-8"
                    >
                        <Text className="text-white text-lg font-semibold">Next</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* Gender Selection Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isGenderModalVisible}
                onRequestClose={() => setGenderModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setGenderModalVisible(false)}>
                    <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
                        <View className="bg-[#2C2C2E] w-80 rounded-xl p-5">
                            <Text className="text-white text-xl mb-4">Select Gender</Text>
                            <FlatList
                                data={genderOptions}
                                keyExtractor={(item) => item}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        onPress={() => selectGender(item)}
                                        className="py-3 border-b border-gray-600"
                                    >
                                        <Text className="text-white text-lg">{item}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </SafeAreaView>
    );
};

export default Registration2;
