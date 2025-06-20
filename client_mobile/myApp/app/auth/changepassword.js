import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import InputWithIcon from '../components/inputwithicons.js';
import { API_BASE_URL } from '@env';

const { height } = Dimensions.get('window');

const ChangePassword = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/;
    return passwordRegex.test(password);
  };

  const handleSave = async () => {
    if (!validatePassword(newPassword)) {
      Alert.alert(
        'Invalid Password',
        'Password must be at least 6 characters long and contain at least one number and one special character (!@#$%^&*).'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/password/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await AsyncStorage.setItem('user', JSON.stringify({ email }));
        Alert.alert('Success', 'OTP has been sent to your email.', [
          { text: 'OK', onPress: () => router.replace('/auth/resetpassword') },
        ]);
      } else {
        let errorMessage = data.message || 'Failed to initiate password reset.';
        if (response.status === 400) {
          errorMessage = 'Invalid input. Please check your email and password.';
        } else if (response.status === 404) {
          errorMessage = 'User not found.';
        }
        Alert.alert('Error', errorMessage);
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while processing your request.');
      console.error('API error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/image/Therapist_client.png')}
        style={styles.headerImage}
      />
      <View style={styles.formWrapper}>
        <Text style={styles.title}>Change Password</Text>
        <Text style={styles.subtitle}>The OTP will be sent to your email.</Text>

        <InputWithIcon
          label="Email"
          iconName="email"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />
        <InputWithIcon
          label="New Password"
          iconName="lock-outline"
          placeholder="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry={!showPassword}
          showPassword={showPassword}
          togglePassword={() => setShowPassword(!showPassword)}
          editable={!loading}
        />
        <InputWithIcon
          label="Confirm Password"
          iconName="lock-outline"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showPassword}
          showPassword={showPassword}
          togglePassword={() => setShowPassword(!showPassword)}
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.disabledButton]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Text>
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
    paddingHorizontal: 20,
    paddingTop: 40,
    marginTop: -10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
    marginTop: -200,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  saveButton: {
    width: '95%',
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#99C2FF',
  },
});

export default ChangePassword;
