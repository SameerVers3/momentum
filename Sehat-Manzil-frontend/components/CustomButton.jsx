import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';

const CustomButton = ({
  title,
  handlePress,
  containerStyles,
  textStyles,
  isLoading
}) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={isLoading}
      style={{ borderRadius: 99 }} // Adjust the border radius here
    >
      <LinearGradient
        colors={['#983BCB', '#4023D7']} // Set your gradient colors
        start={{ x: 0.1, y: 0.5 }} // Adjust start point
        end={{ x: 0.9, y: 0.5 }}   // Adjust end point
        className="rounded-5xl justify-center items-center "
        style={{
          borderRadius: 99, 
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 50, // Maintain the min height of the button
          ...containerStyles // Apply any additional container styles passed as props
        }}
      >
        <Text className={`text-white font-bold ${textStyles} text-lg`}>
          {title}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default CustomButton;
