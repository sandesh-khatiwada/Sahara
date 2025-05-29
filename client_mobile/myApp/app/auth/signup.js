import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    ImageBackground, StyleSheet, Dimensions, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Button from '../components/button.js'; // ✅ Import custom Button

const { width, height } = Dimensions.get('window');

const Signup = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleContinue = async () => {
        if (!fullName || !email || !password || !confirmPassword) {
            AsyncStorage.removeItem('user');
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match.');
            return;
        }
        try {
            await AsyncStorage.setItem('user', JSON.stringify({ fullName, email }));
            router.replace('/onboarding');
        } catch (error) {
            Alert.alert('Error', 'Failed to save user data.');
            console.error('AsyncStorage error:', error);
        }
    };

    return (
        <View style={styles.container}>
            <ImageBackground
                source={require('../../assets/images/handsHolding.jpg')}
                style={styles.backgroundImage}
            />
            <View style={styles.formContainer}>
                <Text style={styles.title}>Register</Text>
                <Text style={styles.subtitle}>Join Sahara for support that cares.</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor="#666"
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#666"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.innerInput}
                        placeholder="Password"
                        placeholderTextColor="#666"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                        style={styles.icon}
                        onPress={() => setShowPassword(!showPassword)}
                    >
                        <MaterialCommunityIcons
                            name={showPassword ? 'eye-off' : 'eye'}
                            size={24}
                            color="#666"
                            marginHorizontal={7}
                        />
                    </TouchableOpacity>
                </View>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.innerInput}
                        placeholder="Confirm Password"
                        placeholderTextColor="#666"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                    />
                    <TouchableOpacity
                        style={styles.icon}
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                        <MaterialCommunityIcons
                            name={showConfirmPassword ? 'eye-off' : 'eye'}
                            size={24}
                            color="#666"
                            marginHorizontal={7}
                        />
                    </TouchableOpacity>
                </View>

                <Button
                    title="Continue"
                    onPress={handleContinue}
                    style={{ width: '95%', marginTop: 10 }}
                    backgroundColor="#007AFF"
                />

                <View style={styles.orContainer}>
                    <View style={styles.line} />
                    <Text style={styles.orText}>OR</Text>
                    <View style={styles.line} />
                </View>

                <TouchableOpacity onPress={() => router.push('/login')}>
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
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        marginTop: -10,
        paddingTop: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000',
        marginTop: -140,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginTop: 10,
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        width: '95%',
        height: 50,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 25,
        paddingHorizontal: 15,
        marginBottom: 15,
        backgroundColor: '#fff',
        fontSize: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '95%',
        height: 50,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 25,
        marginBottom: 15,
        backgroundColor: '#fff',
    },
    innerInput: {
        flex: 1,
        height: '100%',
        paddingHorizontal: 15,
        fontSize: 16,
    },
    icon: {
        paddingHorizontal: 10,
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
        color: '#666',
        fontSize: 16,
    },
    loginText: {
        color: '#007AFF',
        fontSize: 16,
        textDecorationLine: 'none',
    },
});

export default Signup;
