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

const { height } = Dimensions.get('window');

const ChangePassword = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async () => {
        try {
            await AsyncStorage.setItem('user', JSON.stringify({}));
            router.replace('/auth/resetpassword');
        } catch (error) {
            Alert.alert('Error', 'Failed to save password.');
            console.error('AsyncStorage error:', error);
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
                <Text style={styles.subtitle}>The otp is sent to your email.</Text>
                <InputWithIcon
                    label="Email"
                    iconName="email"
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <InputWithIcon
                    label="New Password"
                    iconName="lock-outline"
                    placeholder="New Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    showPassword={showPassword}
                    togglePassword={() => setShowPassword(!showPassword)}
                />
                <InputWithIcon
                    label="Confirm Password"
                    iconName="lock-outline"
                    placeholder="Confirm Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    showPassword={showPassword}
                    togglePassword={() => setShowPassword(!showPassword)}
                />

                <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
                    <Text style={styles.saveButtonText}>Save Changes</Text>
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
});

export default ChangePassword;