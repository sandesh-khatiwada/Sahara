import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, StyleSheet, Dimensions, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import InputWithIcon from '../components/inputwithicons.js';

// Ensure you have set this in your .env file

const { width, height } = Dimensions.get('window');

const Signup = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Validation functions
  const validateFullName = (name) => {
    return name.length >= 3 && name.includes(' ');
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/;
    return passwordRegex.test(password);
  };

  const handleContinue = async () => {
    // Client-side validation
    if (!validateFullName(fullName)) {
      Alert.alert('Error', 'Full name must be at least 3 characters and include both first and last name (space-separated).');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert('Error', 'Password must be at least 6 characters and contain at least one number and one special character (!@#$%^&*).');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://192.168.1.88:5000/api/users', { // Replace with your machine's IP or ngrok URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.status === 201) {
        await AsyncStorage.setItem('user', JSON.stringify({
          fullName,
          email,
          userId: data.data._id,
        }));

        Alert.alert('Success', data.message);
        router.push('/auth/otp');
      } else {
        Alert.alert('Error', data.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', `Failed to connect to the server: ${error.message}`);
      // console.error('API error details:', {
      //   message: error.message,
      //   name: error.name,
      //   stack: error.stack,
      // });
      console.log('API error details:', error);
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/image/signup.png')}
        style={styles.backgroundImage}
      />
      <View style={styles.formContainer}>
        <Text style={styles.title}>Register</Text>
        <Text style={styles.subtitle}>Join Sahara for support that cares.</Text>
        <InputWithIcon
          label="Full Name"
          iconName="account-outline"
          placeholder="Full Name"
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
          editable={!loading}
        />
        <InputWithIcon
          label="Email"
          iconName="email-outline"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />
        <InputWithIcon
          label="Password"
          iconName="lock-outline"
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
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
          secureTextEntry={!showConfirmPassword}
          showPassword={showConfirmPassword}
          togglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
          editable={!loading}
        />
        <TouchableOpacity
          style={[styles.continueButton, loading && styles.disabledButton]}
          onPress={handleContinue}
          disabled={loading}
        >
          <Text style={styles.continueButtonText}>
            {loading ? 'Registering...' : 'Continue'}
          </Text>
        </TouchableOpacity>
        <View style={styles.orContainer}>
          <View style={styles.line} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.line} />
        </View>
        <TouchableOpacity onPress={() => router.push('/auth/login')}>
          <View style={styles.loginContainer}>
            <Text style={styles.loginPrompt}>Already have an account? </Text>
            <Text style={styles.loginText}>Login</Text>
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
    marginTop: -80,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    marginBottom: 20,
    textAlign: 'center',
  },
  continueButton: {
    width: '95%',
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#99C2FF',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },
  orText: {
    marginHorizontal: 10,
    color: '#666',
    fontSize: 16,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginPrompt: {
    color: 'black',
    fontWeight: '500',
    fontSize: 16,
  },
  loginText: {
    color: '#007AFF',
    fontSize: 16,
    textDecorationLine: 'none',
  },
});

export default Signup;