import React, { useEffect } from 'react';
     import { View, Image, StyleSheet, Dimensions } from 'react-native';
     import AsyncStorage from '@react-native-async-storage/async-storage';
     import { router } from 'expo-router';

     const { width, height } = Dimensions.get('window');

     export default function SplashScreen() {
       useEffect(() => {
         const init = async () => {
           const token = await AsyncStorage.getItem('token');

           if (token) {
             const userDataString = await AsyncStorage.getItem('user');
             if (userDataString) {
               const userData = JSON.parse(userDataString);
               if (userData.role === 'Counsellor') {
                 router.replace('/counsellor/main/home');
               } else if (userData.role === 'User') {
                 if (userData.emailVerified) {
                   router.replace('/main/home');
                 } else {
                   await AsyncStorage.removeItem('token');
                   await AsyncStorage.removeItem('user');
                   router.replace('/auth/otp');
                 }
               } else {
                 await AsyncStorage.removeItem('token');
                 await AsyncStorage.removeItem('user');
                 router.replace('/auth/login');
               }
             } else {
               await AsyncStorage.removeItem('token');
               router.replace('/auth/login');
             }
           } else {
             const hasSeen = await AsyncStorage.getItem('hasSeenOnboarding');
             router.replace(hasSeen === 'true' ? '/auth/login' : '/onboarding');
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