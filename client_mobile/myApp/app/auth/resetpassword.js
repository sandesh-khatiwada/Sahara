import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height } = Dimensions.get('window');

const ResetOtp = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpInputs = useRef([]);

  const handleSubmit = () => {
    const otpCode = otp.join('');
    if (otpCode.length === 6) {
      router.push('/auth/login');
    } else {
      AsyncStorage.removeItem('user');
      router.push('/auth/changepassword');
    }
  };

  const handleOtpChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      otpInputs.current[index + 1].focus();
    } else if (!text && index > 0) {
      otpInputs.current[index - 1].focus();
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/image/Therapist_client.png')}
        style={styles.headerImage}
      />
      <View style={styles.formWrapper}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>Please enter the code we sent in your email.</Text>

        <View style={styles.otpWrapper}>
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

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/auth/resendotp')}>
          <View style={styles.resendContainer}>
            <Text style={styles.resendPrompt}>Did not Receive OTP? </Text>
            <Text style={styles.resendText}>Resend</Text>
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
  headerImage: {
    width: '100%',
    height: height * 0.3,
  },
  formWrapper: {
    flex: 1,
    backgroundColor: '#E3F2FD',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -10,
    paddingTop: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  otpWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '95%',
    marginBottom: 40,
  },
  otpInput: {
    width: 40,
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 18,
  },
  submitButton: {
    width: '95%',
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  resendPrompt: {
    color: 'black',
    fontWeight: '500',
    fontSize: 16,
  },
  resendText: {
    color: '#007AFF',
    fontSize: 16,
  },
});

export default ResetOtp;
