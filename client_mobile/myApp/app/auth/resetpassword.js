import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height } = Dimensions.get('window');

const ResetOtp = () => {
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

  const handleSubmit = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      Alert.alert('Error', 'Please enter a complete 6-digit code.');
      return;
    }

    setLoading(true);
    try {
      // Simulate OTP verification (no API call)
      Alert.alert('Success', 'OTP verified successfully!', [
        { text: 'OK', onPress: () => router.push('/auth/login') },
      ]);
    } catch (error) {
      Alert.alert(
        'Verification Failed',
        error.message || 'An error occurred during verification',
        [
          { text: 'Try Again' },
          { text: 'Resend OTP', onPress: handleResendOTP },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setResendLoading(true);
    try {
      // Simulate resend OTP (no API call)
      setTimeout(() => {
        setCountdown(60); // Reset countdown
        setResendLoading(false);
        Alert.alert('Success', 'New OTP has been sent to your email');
      }, 1000); // Simulate a 1-second delay
    } catch (error) {
      setResendLoading(false);
      Alert.alert('Error', error.message || 'Failed to resend OTP');
    }
  };

  const handleOtpChange = (text, index) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    const newOtp = [...otp];
    newOtp[index] = numericValue.slice(0, 1);
    setOtp(newOtp);

    if (numericValue && index < 5) {
      otpInputs.current[index + 1].focus();
    } else if (!numericValue && index > 0) {
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
              style={[
                styles.otpInput,
                digit && styles.otpInputFilled,
                loading && styles.otpInputDisabled,
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
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleResendOTP}
          disabled={countdown > 0 || resendLoading}
        >
          <View style={styles.resendContainer}>
            <Text style={styles.resendPrompt}>Did not receive code? </Text>
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
  headerImage: {
    width: '100%',
    height: height * 0.3,
  },
  formWrapper: {
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
    marginBottom: 10,
    marginTop: -230,
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
  submitButton: {
    width: '95%',
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#99C2FF',
  },
  submitButtonText: {
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

export default ResetOtp;