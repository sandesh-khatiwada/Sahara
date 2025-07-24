import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator, // Make sure to import ActivityIndicator if you use loading state
  ScrollView, // Import ScrollView
  KeyboardAvoidingView, // Import KeyboardAvoidingView
  Platform, // Import Platform to check OS
  StatusBar // Import StatusBar to manage status bar height
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import InputWithIcon from '../components/inputwithicons.js';
import { API_BASE_URL } from '@env';

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
      const response = await fetch(`${API_BASE_URL}/api/users`, {
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
      console.log('API error details:', error);
    } finally {
      setLoading(false);
    }
  };

  // Adjust keyboardVerticalOffset carefully.
  // For iOS, a small positive offset might be needed if the top of the content is cut off.
  // For Android, 0 is often sufficient with 'height' behavior, but experiment if needed.
  const keyboardVerticalOffset = Platform.OS === 'ios' ? 0 : 0; // Start with 0

  return (
    <KeyboardAvoidingView
      style={styles.avoidingView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled" // Keep the keyboard open when tapping outside an input
        showsVerticalScrollIndicator={false} // Hide the scroll indicator
      >
        <View style={styles.container}>
          <ImageBackground
            source={require('../../assets/image/signup.png')}
            style={styles.backgroundImage}
          />

          {/* This is the form container that now also holds the title/subtitle */}
          <View style={styles.formContainer}>
            {/* The title and subtitle are now inside this container */}
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  avoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1, // Allows content to expand to fill available space
  },
  container: {
    flex: 1, // Container fills the scroll view
    backgroundColor: '#E3F2FD',
  },
  backgroundImage: {
    width: '100%',
    height: height * 0.3, // Fixed height for the image
  },
  formContainer: {
    flex: 1, // Allows the form container to take remaining space and expand
    alignItems: 'center',
    paddingHorizontal: 10,
    backgroundColor: '#E3F2FD',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    // Key adjustment: Negative margin to pull it up over the image
    marginTop: -80, // Adjust this value to control the overlap
    paddingTop: 40, // Padding at the top of the form fields
    paddingBottom: 20, // Padding at the bottom for scrollability
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000', // Set a color that contrasts well on your background
    // No marginTop here; its position is handled by formContainer's marginTop
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
    marginVertical: 10,
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