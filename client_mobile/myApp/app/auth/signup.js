import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router'; // ✅ Correct import

const Signup = () => {
  const handleReset = async () => {
    try {
      await AsyncStorage.removeItem('hasSeenOnboarding');
      Alert.alert('Reset', 'Onboarding has been reset. It will show on next app launch.');
      router.replace('/onboarding'); // ✅ Correct usage
    } catch (error) {
      Alert.alert('Error', 'Failed to reset onboarding flag.');
      console.error('AsyncStorage remove error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Signup</Text>
      <Button title="Reset" onPress={handleReset} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff',
  },
  text: {
    fontSize: 24, marginBottom: 20,
  },
});

export default Signup;
