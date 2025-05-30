import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ImageBackground, StyleSheet, Dimensions, Alert } from 'react-native';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

const Otp = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // Array for 6 OTP digits
  const otpInputs = useRef([]);

  const handleContinue = () => {
    const otpCode = otp.join('');
    if (otpCode.length === 6) {
      // Add OTP validation logic here (e.g., API call)
      router.push('/auth/login');
    } else {
      Alert.alert('Error', 'Please enter a 6-digit OTP.');
    }
  };

  const handleOtpChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-focus to next input if a digit is entered
    if (text && index < 5) {
      otpInputs.current[index + 1].focus();
    }
    // Move to previous input if backspace is pressed and field is empty
    else if (!text && index > 0) {
      otpInputs.current[index - 1].focus();
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/images/handsHolding.jpg')}
        style={styles.backgroundImage}
      />
      <View style={styles.formContainer}>
        <Text style={styles.title}>Enter your OTP</Text>
        <Text style={styles.subtitle}>Please enter the code we sent in your email.</Text>
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              style={styles.otpInput}
              value={digit}
              onChangeText={(text) => handleOtpChange(text, index)}
              keyboardType="numeric"
              maxLength={1}
              ref={(ref) => (otpInputs.current[index] = ref)}
            />
          ))}
        </View>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Submit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/auth/login')}>
          <View style={styles.loginContainer}>
            <Text style={styles.loginPrompt}>Did not Receive OTP? </Text>
            <Text style={styles.loginText}>Reset</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3F2FD',
  },
  backgroundImage: {
    width: '100%',
    height: height * 0.3,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#E3F2FD',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -10,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginTop: -350,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    marginBottom: 20,
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '95%',
    marginBottom: 80,
    marginTop: 30,
  },
  otpInput: {
    width: 40,
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    textAlign: 'center',
    fontSize: 18,
  },
  continueButton: {
    width: '95%',
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',

  },
  loginPrompt: {
    color: 'black',
    fontWeight: '500',
    fontSize: 16,
    marginTop: 30,
  },
  loginText: {
    color: '#007AFF',
    fontSize: 16,
    textDecorationLine: 'none',
    marginTop: 30,
  },
});

export default Otp;