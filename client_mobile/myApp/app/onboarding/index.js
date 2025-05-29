import React from 'react';
import Onboarding from 'react-native-onboarding-swiper';
import { Image, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

export default function OnboardingScreen() {
  const handleDone = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    router.replace('/auth/signup'); // or wherever
  };

  // Custom Dot Component for rectangular dots
  const CustomDot = ({ selected }) => {
    return (
      <View
        style={[
          styles.dot,
          selected ? styles.activeDot : styles.inactiveDot,
        ]}
      />
    );
  };

  // Custom Done Button Component
  const CustomDoneButton = ({ ...props }) => {
    return (
      <TouchableOpacity style={styles.button} onPress={props.onPress}>
        <Text style={styles.buttonText}>Done</Text>
      </TouchableOpacity>
    );
  };

  // Custom Next Button Component
  const CustomNextButton = ({ ...props }) => {
    return (
      <TouchableOpacity style={styles.button} onPress={props.onPress}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    );
  };

  // Custom Skip Button Component
  const CustomSkipButton = ({ ...props }) => {
    return (
      <TouchableOpacity style={styles.button} onPress={props.onPress}>
        <Text style={styles.buttonText}>skip</Text>
      </TouchableOpacity>
    );
  };

  return (
    <Onboarding
      onDone={handleDone}
      onSkip={handleDone}
      bottomBarHighlight={false}
      DotComponent={CustomDot}
      DoneButtonComponent={CustomDoneButton}
      NextButtonComponent={CustomNextButton}
      SkipButtonComponent={CustomSkipButton}
      showSkip={true} // Enable the skip button
      pages={[
        {
          backgroundColor: '#E3F2FD',
          image: <Image source={require('../../assets/logo/SaharaLOGO.png')} style={{ width: 250, height: 250 }} />,
          title: 'AI Counselor',
          subtitle: 'Get instant support from a smart, stigma-free AI trained in mental wellness.',
        },
        {
          backgroundColor: '#E3F2FD',
          image: <Image source={require('../../assets/logo/SaharaLOGO.png')} style={{ width: 250, height: 250 }} />,
          title: 'Real Therapists',
          subtitle: 'Talk to licensed professionals at your pace, fully private and secure.',
        },
        {
          backgroundColor: '#E3F2FD',
          image: <Image source={require('../../assets/logo/SaharaLOGO.png')} style={{ width: 250, height: 250 }} />,
          title: 'Emergency Help',
          subtitle: 'Get instant support when panic or distress hits, anytime you need it.',
        },
      ]}
    />
  );
}

// Define styles using StyleSheet
const styles = StyleSheet.create({
  dot: {
    height: 6,
    marginHorizontal: 4,
    borderRadius: 3,
  },
  activeDot: {
    backgroundColor: '#333',
    width: 30,
  },
  inactiveDot: {
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: 'transparent',
    width: 20,
  },
  button: {
    backgroundColor: '#6200EE', // Consistent purple background for all buttons
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 20, // Add margin for spacing in the bottom bar
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});