// app/screens/Login.js
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

const { width, height } = Dimensions.get('window');

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    // if (!email || !password) {
    //   Alert.alert('Error', 'Please fill all fields.');
    //   return;
    // }

    try {
      await AsyncStorage.setItem('user', JSON.stringify({ email, role }));
      router.replace('/auth/otp');
    } catch (error) {
      Alert.alert('Error', 'Failed to login.');
      console.error('AsyncStorage error:', error);
    }
  };

  const roleOptions = [
    { label: 'User', value: 'user' },
    { label: 'Counselor', value: 'counselor' },
  ];

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/image/Therapist_client.png')}
        style={styles.backgroundImage}
      />
      <View style={styles.formContainer}>
        <Text style={styles.title}>Welcome Back </Text>
        <Text style={styles.subtitle}>Sign in to start your mental wellness journey.</Text>

        <InputWithIcon
          label={"Email"}
          iconName="email-outline"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <InputWithIcon
          label={"Password"}
          iconName="lock-outline"
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          showPassword={showPassword}
          togglePassword={() => setShowPassword(!showPassword)}
        />

        <InputWithIcon
          label={"Role"}
          iconName="account-switch-outline"
          placeholder="Role"
          isDropdown={true}
          items={roleOptions}
          selectedValue={role}
          onValueChange={(value) => setRole(value)}
        />

        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Login</Text>
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
    marginBottom: 10,
    marginTop: -150,
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
