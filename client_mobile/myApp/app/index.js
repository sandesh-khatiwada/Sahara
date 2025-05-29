// app/index.js
import React, { useEffect } from 'react';
import { View, Image, StyleSheet,Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';


const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(async () => {
      const hasSeen = await AsyncStorage.getItem('hasSeenOnboarding');
      if (hasSeen === 'true') {
        router.replace('/auth/signup');
      } else {
        router.replace('/onboarding');
      }
    }, 5000); 

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo/SaharaLOGO.png')} style={styles.logo} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center', 
    backgroundColor: '#E3F2FD'
  },
  logo: {
    width: width*0.9,
    height: height*0.3, 
    resizeMode: 'contain'
  }
});
