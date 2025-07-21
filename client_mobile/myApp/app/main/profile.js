import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  Alert,
  ScrollView, // Added back for modal content
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Default fallback image
const DEFAULT_PROFILE_IMAGE = 'https://randomuser.me/api/portraits/men/5.jpg';

const FAQModal = ({ visible, onClose }) => (
  <Modal
    visible={visible}
    animationType="fade"
    transparent={true}
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>FAQ</Text>
          <TouchableOpacity onPress={onClose}>
            <MaterialCommunityIcons name="close" size={20} color="#666" />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.modalContent}>
          <View style={styles.faqContainer}>
            <Text style={styles.faqQuestion}>What is this app about?</Text>
            <Text style={styles.faqAnswer}>This app helps you manage your appointments and connect with counselors.</Text>
          </View>
          <View style={styles.faqContainer}>
            <Text style={styles.faqQuestion}>How do I book an appointment?</Text>
            <Text style={styles.faqAnswer}>Go to My Appointment section and select a available time slot.</Text>
          </View>
          <View style={styles.faqContainer}>
            <Text style={styles.faqQuestion}>Can I change my profile?</Text>
            <Text style={styles.faqAnswer}>Yes, use the Edit Profile button to update your details.</Text>
          </View>
        </ScrollView>
      </View>
    </View>
  </Modal>
);

const HelpModal = ({ visible, onClose }) => (
  <Modal
    visible={visible}
    animationType="fade"
    transparent={true}
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Help Center</Text>
          <TouchableOpacity onPress={onClose}>
            <MaterialCommunityIcons name="close" size={20} color="#666" />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.modalContent}>
          <Text style={styles.helpText}>Contact us at support@example.com for assistance.</Text>
          <Text style={styles.helpText}>Phone: +1-800-555-1234 (Available 9 AM - 5 PM)</Text>
          <Text style={styles.helpText}>Visit our website for more resources: www.examplehelp.com</Text>
        </ScrollView>
      </View>
    </View>
  </Modal>
);

export default function UserProfile() {
  const [userData, setUserData] = useState({
    fullName: 'User Name',
    profilePhoto: null,
  });
  const [faqModalVisible, setFaqModalVisible] = useState(false);
  const [helpModalVisible, setHelpModalVisible] = useState(false);

  const getProfileImageUri = () => {
    if (userData?.profilePhoto) {
      return typeof userData.profilePhoto === 'string' ? userData.profilePhoto : DEFAULT_PROFILE_IMAGE;
    }
    return DEFAULT_PROFILE_IMAGE;
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await AsyncStorage.getItem('userData');
      if (data) {
        setUserData(JSON.parse(data));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load profile data');
    }
  };

  const handleButtonPress = (route) => {
    if (route === '/appointments') {
      router.push('/dummy-appointments');
    } else if (route === '/statistics') {
      router.push('/dummy-statistics');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            setTimeout(async () => {
              try {
                await AsyncStorage.removeItem('userData');
                await AsyncStorage.removeItem('token');
                router.replace('/auth/login');
              } catch (error) {
                Alert.alert('Error', 'Failed to logout');
              }
            }, 100);
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Profile Photo & Name */}
      <View style={styles.profileHeader}>
        <Image
          source={{ uri: getProfileImageUri() }}
          style={styles.profilePhoto}
          defaultSource={{ uri: DEFAULT_PROFILE_IMAGE }}
        />
        <Text style={styles.profileName}>{userData.fullName}</Text>
      </View>

      {/* Button Containers */}
      <View style={styles.buttonSection}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={() => setFaqModalVisible(true)}>
            <MaterialCommunityIcons name="frequently-asked-questions" size={24} color="#007AFF" />
            <Text style={styles.actionButtonText}>FAQ</Text>
          </TouchableOpacity>
          <View style={styles.spacer} />
          <TouchableOpacity style={[styles.actionButton, styles.actionButtonRow]} onPress={() => handleButtonPress('/appointments')}>
            <MaterialCommunityIcons name="calendar-check" size={24} color="#007AFF" />
            <Text style={styles.actionButtonText}>My Appointment</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleButtonPress('/statistics')}>
            <MaterialCommunityIcons name="chart-bar" size={24} color="#007AFF" />
            <Text style={styles.actionButtonText}>My Statistics</Text>
          </TouchableOpacity>
          <View style={styles.spacer} />
          <TouchableOpacity style={[styles.actionButton, styles.actionButtonRow]} onPress={() => setHelpModalVisible(true)}>
            <MaterialCommunityIcons name="help-circle" size={24} color="#007AFF" />
            <Text style={styles.actionButtonText}>Help Center</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Logout Container */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={24} color="#fff" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* FAQ Modal */}
      <FAQModal visible={faqModalVisible} onClose={() => setFaqModalVisible(false)} />

      {/* Help Modal */}
      <HelpModal visible={helpModalVisible} onClose={() => setHelpModalVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8ff',
  },
  profileHeader: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginTop: 35,
  },
  profilePhoto: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 20,
  },
  buttonSection: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 10,
    paddingBottom: 40, // Adjusted height of button container
  },
  buttonContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  spacer: {
    height: 10, // Adds vertical space between buttons in the same container
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    backgroundColor: '#fff',
    width: '100%', // Ensures full width for each button
  },
  actionButtonRow: {
    marginTop: 15, // Adds space between rows within the same container
  },
  actionButtonText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
    fontWeight: '500',
  },
  logoutContainer: {
    padding: 10,
    backgroundColor: '#fff',
    marginTop: 10, // Added gap to button container
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff4444',
    paddingVertical: 10,
    paddingHorizontal: 130,
    borderRadius: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 30, // Slightly smaller from top
  },
  modalContainer: {
    width: '95%', // Increased to 95% width
    height: '90%', // Increased to 90% height
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    padding: 20,
    flex: 1,
  },
  faqContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 10,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  faqAnswer: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
});