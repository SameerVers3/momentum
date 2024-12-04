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
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { images } from '../../constants';
import { router } from 'expo-router';

const Registration2 = () => {
    // Define theme locally

    const colors = {
        background: '#2A2C38',
        textPrimary: '#ffffff',
        textSecondary: '#ffffff',
        textPlaceholder: '#9CA3AF', //gray
        inputBackground: '#161818', //
        primaryGradientStart: '#6366F1', // bg-indigo-600
        primaryGradientEnd: '#FF8961',
        textOnPrimary: '#FFFFFF',
        modalOverlay: 'rgba(0, 0, 0, 0.5)',
        modalBackground: '#232533', // ligher shade of gray
        divider: '#232533', // light gray
    };

    const fonts = {
        size: {
            small: 14,
            medium: 16,
            large: 18,
        },
        weight: {
            regular: '400',
            bold: '700',
        },
    };

    const [gender, setGender] = useState('');
    const [isGenderModalVisible, setGenderModalVisible] = useState(false);
    const [dateOfBirth, setDateOfBirth] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');

    const genderOptions = ['Male', 'Female', 'Other'];

    const selectGender = (selectedGender) => {
        setGender(selectedGender);
        setGenderModalVisible(false);
    };

    const onDateChange = (event, selectedDate) => {
        if (selectedDate) {
            setDateOfBirth(selectedDate);
        }
        setShowDatePicker(Platform.OS === 'ios');
    };

    const formatDate = (date) => {
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `${day < 10 ? '0' + day : day}-${month < 10 ? '0' + month : month}-${year}`;
    };

    const handleNumericInput = (input, setter) => {
        const numericValue = input.replace(/[^0-9]/g, '');
        setter(numericValue);
    };

    const nextPage = async () => {
        if (!gender || !dateOfBirth || !weight || !height) {
            Alert.alert('Error', 'Fill all required fields');
            return;
        }
    
        try {
            const profileData = {
                gender,
                dateOfBirth: formatDate(dateOfBirth),
                currentWeight: weight,
                currentHeight: height,
            };
    
            // Save locally
            const user = await AsyncStorage.getItem('user');
            const parsedUser = user ? JSON.parse(user) : {};
            await AsyncStorage.setItem('user', JSON.stringify({ ...parsedUser, ...profileData }));
    
            // Navigate with profile data
            router.push({
                pathname: '/usergoals',
                params: profileData,
            });
        } catch (error) {
            Alert.alert('Error', 'Failed to update profile');
        }
    };
    
      

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <View style={{ flex: 1, paddingHorizontal: 24, paddingVertical: 40, justifyContent: 'space-between' }}>
                <View style={{ alignItems: 'center' }}>
                    <Image source={images.registration2} style={{ width: 150, height: 150, marginBottom: 24 }} />
                    <Text style={{ color: colors.textPrimary, fontSize: fonts.size.large, fontWeight: fonts.weight.bold }}>
                        Let's complete your profile
                    </Text>
                    <Text style={{ color: colors.textSecondary, fontSize: fonts.size.medium, marginBottom: 32 }}>
                        It will help us to know more about you!
                    </Text>
                </View>

                <View style={{ gap: 16 }}>
                    {/* Gender Input */}
                    <TouchableOpacity
                        onPress={() => setGenderModalVisible(true)}
                        style={{
                            backgroundColor: colors.inputBackground,
                            borderRadius: 12,
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                        }}
                    >
                        <TextInput
                            style={{ color: colors.textPrimary, fontSize: fonts.size.medium, flex: 1 }}
                            placeholder="Choose Gender"
                            placeholderTextColor={colors.textPlaceholder}
                            value={gender}
                            editable={false}
                        />
                        <ChevronDownIcon color={colors.textPlaceholder} size={20} />
                    </TouchableOpacity>

                    {/* Date of Birth Input */}
                    <TouchableOpacity
                        onPress={() => setShowDatePicker(true)}
                        style={{
                            backgroundColor: colors.inputBackground,
                            borderRadius: 12,
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                        }}
                    >
                        <TextInput
                            style={{ color: colors.textPrimary, fontSize: fonts.size.medium }}
                            placeholder="Date of Birth"
                            placeholderTextColor={colors.textPlaceholder}
                            value={dateOfBirth ? formatDate(dateOfBirth) : ''}
                            editable={false}
                        />
                    </TouchableOpacity>

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
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View
                            style={{
                                backgroundColor: colors.inputBackground,
                                borderRadius: 12,
                                paddingHorizontal: 16,
                                paddingVertical: 12,
                                flexDirection: 'row',
                                alignItems: 'center',
                                width: '48%',
                            }}
                        >
                            <TextInput
                                style={{ color: colors.textPrimary, fontSize: fonts.size.medium, flex: 1 }}
                                placeholder="Your Weight"
                                placeholderTextColor={colors.textPlaceholder}
                                value={weight}
                                onChangeText={(text) => handleNumericInput(text, setWeight)}
                                keyboardType="numeric"
                            />
                            <Text style={{ color: colors.textSecondary, marginLeft: 8 }}>KG</Text>
                        </View>
                        <View
                            style={{
                                backgroundColor: colors.inputBackground,
                                borderRadius: 12,
                                paddingHorizontal: 16,
                                paddingVertical: 12,
                                flexDirection: 'row',
                                alignItems: 'center',
                                width: '48%',
                            }}
                        >
                            <TextInput
                                style={{ color: colors.textPrimary, fontSize: fonts.size.medium, flex: 1 }}
                                placeholder="Your Height"
                                placeholderTextColor={colors.textPlaceholder}
                                value={height}
                                onChangeText={(text) => handleNumericInput(text, setHeight)}
                                keyboardType="numeric"
                            />
                            <Text style={{ color: colors.textSecondary, marginLeft: 8 }}>CM</Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity onPress={nextPage}>
                    <View
                        style={{
                            borderRadius: 12,
                            paddingVertical: 16,
                            alignItems: 'center',
                            marginTop: 32,
                            backgroundColor: colors.primaryGradientStart,
                            borderRadius: 12,
                        }}
                    >
                        <Text style={{ color: colors.textOnPrimary, fontSize: fonts.size.large, fontWeight: fonts.weight.bold }}>
                            Next
                        </Text>
                    </View>
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
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.modalOverlay }}>
                        <View style={{ backgroundColor: colors.modalBackground, width: 320, borderRadius: 12, padding: 20 }}>
                            <Text style={{ color: colors.textPrimary, fontSize: fonts.size.large, marginBottom: 16 }}>
                                Select Gender
                            </Text>
                            <FlatList
                                data={genderOptions}
                                keyExtractor={(item) => item}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        onPress={() => selectGender(item)}
                                        style={{
                                            paddingVertical: 12,
                                            borderBottomWidth: 1,
                                            borderBottomColor: colors.divider,
                                        }}
                                    >
                                        <Text style={{ color: colors.textPrimary, fontSize: fonts.size.medium }}>{item}</Text>
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
