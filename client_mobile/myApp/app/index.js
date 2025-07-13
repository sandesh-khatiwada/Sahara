// app/index.js
import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  useEffect(() => {
    const init = async () => {
      const hasSeen = await AsyncStorage.getItem('hasSeenOnboarding');
      const userDataString = await AsyncStorage.getItem('user');

      if (userDataString) {
        const userData = JSON.parse(userDataString);

        // Route based on role
        if (userData.role === 'Counsellor') {
          router.replace('/counsellor/main/home');
        } else if (userData.role === 'User') {
          router.replace('/main/home');
        } else {
          // Unknown role fallback
          await AsyncStorage.removeItem('user');
          router.replace('/auth/signup');
        }
      } else {
        // No user found, show onboarding or signup
        if (hasSeen === 'true') {
          router.replace('/auth/signup');
        } else {
          router.replace('/onboarding');
        }
      }
    };

    const timer = setTimeout(init, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/logo/SaharaLOGO.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
  },
  logo: {
    width: width,
    height: height,
  },
});
