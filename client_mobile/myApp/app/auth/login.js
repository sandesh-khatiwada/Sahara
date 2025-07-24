import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar // Import StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import InputWithIcon from '../components/inputwithicons.js';
import { API_BASE_URL } from '@env';
const { width, height } = Dimensions.get('window');

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('User');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (role === 'Counsellor') {
        const counsellorData = {
          _id: data.data.Counsellor._id,
          fullName: data.data.Counsellor.fullName,
          email: data.data.Counsellor.email,
          designation: data.data.Counsellor.designation,
          phone: data.data.Counsellor.phone,
          chargePerHour: data.data.Counsellor.chargePerHour,
          profilePhoto: data.data.Counsellor.profilePhoto,
          role: 'Counsellor',
          token: data.data.token,
          createdAt: data.data.Counsellor.createdAt,
          updatedAt: data.data.Counsellor.updatedAt,
        };

        await AsyncStorage.setItem('user', JSON.stringify(counsellorData));
        await AsyncStorage.setItem('token', data.data.token);

        router.replace('/counsellor/main/home');
      } else {
        const userData = {
          _id: data.data.User._id,
          fullName: data.data.User.fullName,
          email: data.data.User.email,
          emailVerified: data.data.User.emailVerified,
          role: 'User',
          token: data.data.token,
          createdAt: data.data.User.createdAt,
          updatedAt: data.data.User.updatedAt,
        };
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        await AsyncStorage.setItem('token', data.data.token);

        if (!data.data.User.emailVerified) {
          router.replace('/auth/otp');
          Alert.alert('Verification Needed', 'Please verify your email before logging in');
          return;
        }

        router.replace({
          pathname: '/main/home',
          params: {
            user: JSON.stringify(userData),
          },
        });
      }

    } catch (error) {
      console.error('Login error:', error);

      if (error.message.includes('verify your email')) {
        router.replace('/auth/otp');
      } else if (error.message.includes('Invalid credentials')) {
        Alert.alert('Login Failed', 'Invalid credentials');
      } else {
        Alert.alert('Login Failed', error.message || 'An error occurred during login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push('/auth/changepassword');
  };

  const roleOptions = [
    { label: 'User', value: 'User' },
    { label: 'Counselor', value: 'Counsellor' },
  ];

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
            source={require('../../assets/image/Therapist_client.png')}
            style={styles.backgroundImage}
          />

          {/* This is the form container that now also holds the title/subtitle */}
          <View style={styles.formContainer}>
            {/* The title and subtitle are now inside this container */}
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to start your mental wellness journey.</Text>

            <InputWithIcon
              label="Email"
              iconName="email-outline"
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
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
            />

            <InputWithIcon
              label="Role"
              iconName="account-switch-outline"
              placeholder="Role"
              isDropdown={true}
              items={roleOptions}
              selectedValue={role}
              onValueChange={(value) => setRole(value)}
            />

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={handleForgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.disabledButton]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </TouchableOpacity>

            <View style={styles.orContainer}>
              <View style={styles.line} />
              <Text style={styles.orText}>OR</Text>
              <View style={styles.line} />
            </View>

            <View style={styles.signupContainer}>
              <Text style={styles.signupPrompt}>Do not have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/auth/signup')}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
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
    // No justifyContent: 'flex-start' here, as formContainer's marginTop handles positioning
  },
  container: {
    flex: 1, // Container fills the scroll view
    backgroundColor: '#E3F2FD',
  },
  backgroundImage: {
    width: '100%',
    height: height * 0.3, // Fixed height for the image
    // No absolute positioning here
  },
  formContainer: {
    flex: 1, // Allows the form container to take remaining space and expand
    alignItems: 'center',
    paddingHorizontal: 20,
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
    marginBottom: 10,
    // No marginTop here; its position is handled by formContainer's marginTop
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  forgotPasswordText: {
    color: '#007AFF',
    fontSize: 16,
    textDecorationLine: 'none',
    marginRight: 12,
  },
  loginButton: {
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
  loginButtonText: {
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
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupPrompt: {
    color: 'black',
    fontWeight: '500',
    fontSize: 16,
  },
  signupLink: {
    color: '#007AFF',
    fontSize: 16,
  },
});

export default Login;