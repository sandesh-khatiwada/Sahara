import React from 'react';
import Onboarding from 'react-native-onboarding-swiper';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import LottieView from 'lottie-react-native';
import Button from '../components/button'; // ✅ Import your reusable Button

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const handleDone = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    router.replace('/auth/signup');
  };

  const CustomDot = ({ selected }) => (
    <View
      style={[
        styles.dot,
        selected ? styles.activeDot : styles.inactiveDot,
      ]}
    />
  );

  const CustomButton = ({ onPress, label }) => (
    <Button
      title={label}
      onPress={onPress}
      backgroundColor="#6200EE"
      textColor="#fff"
      style={[styles.onboardingButton, { height: 40 }]} 
      textStyle={styles.onboardingButtonText}
    />
  );

  return (
    <Onboarding
      onDone={handleDone}
      onSkip={handleDone}
      bottomBarHighlight={false}
      DotComponent={CustomDot}
      DoneButtonComponent={(props) => <CustomButton {...props} label="Done" />}
      NextButtonComponent={(props) => <CustomButton {...props} label="Next" />}
      SkipButtonComponent={(props) => <CustomButton {...props} label="Skip" />}
      showSkip={true}
      pages={[
        {
          backgroundColor: '#E3F2FD',
          image: (
            <View style={styles.imageContainer}>
              <LottieView
                source={require('../../assets/animation/robot.json')}
                autoPlay
                loop
                style={styles.lottie}
              />
            </View>
          ),
          title: (
            <Text style={styles.title}>
              AI{'\n'}Counselor
            </Text>
          ),
          subtitle: (
            <Text style={styles.subtitle}>
              Get instant support from a smart, stigma-free AI trained in mental wellness.
            </Text>
          ),
        },
        {
          backgroundColor: '#E3F2FD',
          image: (
            <View style={styles.imageContainer}>
              <LottieView
                source={require('../../assets/animation/Therapist.json')}
                autoPlay
                loop
                style={styles.lottie}
              />
            </View>
          ),
          title: (
            <Text style={styles.title}>
              Real{'\n'}Therapists
            </Text>
          ),
          subtitle: (
            <Text style={styles.subtitle}>
              Talk to licensed professionals at your pace, fully private and secure.
            </Text>
          ),
        },
        {
          backgroundColor: '#E3F2FD',
          image: (
            <View style={styles.imageContainer}>
              <LottieView
                source={require('../../assets/animation/Emmergency.json')}
                autoPlay
                loop
                style={styles.lottie}
              />
            </View>
          ),
          title: (
            <Text style={styles.title}>
              Emergency{'\n'}Help
            </Text>
          ),
          subtitle: (
            <Text style={styles.subtitle}>
              Get instant support when panic or distress hits, anytime you need it.
            </Text>
          ),
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: width * 0.7,
    height: width * 0.7,
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
  dot: {
    height: 6,
    marginHorizontal: 4,
    borderRadius: 3,
  },
  activeDot: {
    backgroundColor: '#333',
    width: 35,
  },
  inactiveDot: {
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: 'transparent',
    width: 20,
  },
  onboardingButton: {
    marginHorizontal: 13,
    paddingHorizontal: 18,
    paddingVertical: 5,
    borderRadius: 15,
  },
  onboardingButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#000',
    textAlign: 'left',
    alignSelf: 'flex-start',
    paddingHorizontal: 30,
    marginBottom: 10,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    textAlign: 'left',
    alignSelf: 'flex-start',
    paddingHorizontal: 30,
    lineHeight: 22,
    maxWidth: width - 60,
  },
});