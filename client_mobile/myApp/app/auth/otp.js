import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ImageBackground, StyleSheet, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const Otp = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const otpInputs = useRef([]);

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleContinue = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      Alert.alert('Error', 'Please enter a complete 6-digit code.');
      return;
    }

    setLoading(true);

    try {
      const user = JSON.parse(await AsyncStorage.getItem('user'));
      if (!user?.email) {
        Alert.alert('Error', 'User session expired. Please sign up again.');
        return router.push('/auth/signup');
      }

      const response = await fetch('http://192.168.18.142:5000/api/users/otp/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, otp: otpCode })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'OTP verification failed');
      }

      Alert.alert('Success', 'Email verified successfully!', [
        { text: 'OK', onPress: () => router.push('/auth/login') }
      ]);

    } catch (error) {
      Alert.alert(
        'Verification Failed',
        error.message,
        error.message.includes('expired') || error.message.includes('Invalid')
          ? [
              { text: 'Try Again' },
              { text: 'Resend OTP', onPress: handleResendOTP }
            ]
          : [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setResendLoading(true);

    try {
      const user = JSON.parse(await AsyncStorage.getItem('user'));
      if (!user?.email) {
        Alert.alert('Error', 'User session expired. Please sign up again.');
        return router.push('/auth/signup');
      }

      const response = await fetch('http://192.168.18.142:5000/api/users/otp/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend OTP');
      }

      setCountdown(60); // Reset countdown
      Alert.alert('Success', 'New OTP has been sent to your email');

    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setResendLoading(false);
    }
  };

  const handleOtpChange = (text, index) => {
    // Filter non-numeric characters
    const numericValue = text.replace(/[^0-9]/g, '');
    const newOtp = [...otp];
    newOtp[index] = numericValue.slice(0, 1);
    setOtp(newOtp);

    // Auto-focus next input or previous on backspace
    if (numericValue && index < 5) {
      otpInputs.current[index + 1].focus();
    } else if (!numericValue && index > 0) {
      otpInputs.current[index - 1].focus();
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/image/signup.png')}
        style={styles.backgroundImage}
      />
      <View style={styles.formContainer}>
        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to your email
        </Text>
        
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              style={[
                styles.otpInput,
                digit && styles.otpInputFilled,
                loading && styles.otpInputDisabled
              ]}
              value={digit}
              onChangeText={(text) => handleOtpChange(text, index)}
              keyboardType="number-pad"
              maxLength={1}
              ref={(ref) => (otpInputs.current[index] = ref)}
              editable={!loading}
              selectTextOnFocus
            />
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.continueButton, loading && styles.disabledButton]}
          onPress={handleContinue}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.continueButtonText}>Verify OTP</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleResendOTP}
          disabled={countdown > 0 || resendLoading}
        >
          <View style={styles.resendContainer}>
            <Text style={styles.resendPrompt}>Didn't receive code? </Text>
            {countdown > 0 ? (
              <Text style={styles.resendCountdown}>Resend in {countdown}s</Text>
            ) : resendLoading ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <Text style={styles.resendText}>Resend OTP</Text>
            )}
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
    marginBottom: 5,
    marginTop: -100,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginBottom: 40,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
    backgroundColor: '#fff',
  },
  otpInputFilled: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  otpInputDisabled: {
    backgroundColor: '#f5f5f5',
  },
  continueButton: {
    width: '80%',
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#99C2FF',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  resendPrompt: {
    color: '#666',
    fontSize: 16,
  },
  resendText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  resendCountdown: {
    color: '#999',
    fontSize: 16,
  },
});

export default Otp;