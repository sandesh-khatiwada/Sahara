import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  Platform,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { API_BASE_URL } from '@env';

const { width } = Dimensions.get('window');

const formatDate = (isoDate) => {
  if (!isoDate) return 'N/A';
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const ProfileSection = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const ProfileItem = ({ icon, title, value, onPress, rightComponent, valueStyle }) => (
  <TouchableOpacity style={styles.profileItem} onPress={onPress} disabled={!onPress}>
    <View style={styles.profileItemLeft}>
      <MaterialCommunityIcons name={icon} size={24} color="#007AFF" />
      <View style={styles.profileItemContent}>
        <Text style={styles.profileItemTitle}>{title}</Text>
        {value && <Text style={[styles.profileItemValue, valueStyle]}>{value}</Text>}
      </View>
    </View>
    {rightComponent || (onPress && <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />)}
  </TouchableOpacity>
);

const EditModal = ({ visible, title, value, onClose, onSave }) => {
  const [editValue, setEditValue] = useState(value);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = () => {
    onSave(editValue);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalCancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Edit {title}</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.modalSave}>Save</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.modalContent}>
          <TextInput
            style={styles.modalInput}
            value={editValue}
            onChangeText={setEditValue}
            placeholder={`Enter ${title.toLowerCase()}`}
          />
        </View>
      </View>
    </Modal>
  );
};

export default function UserProfile() {
  const [userData, setUserData] = useState({
    fullName: '',
    email: '',
    createdAt: '',
    emailVerified: false,
  });
  const [editModal, setEditModal] = useState({
    visible: false,
    title: '',
    value: '',
    field: '',
  });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const scrollY = useRef(0);
  const scrollDirection = useRef(null);

  const handleScroll = (event) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const direction = currentScrollY > scrollY.current ? 'down' : 'up';
    
    if (direction !== scrollDirection.current) {
      scrollDirection.current = direction;
      // Navbar handling can be added here if needed
    }
    scrollY.current = currentScrollY;
  };

  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (result.success && result.data) {
        setUserData({
          fullName: result.data.fullName || '',
          email: result.data.email || '',
          createdAt: result.data.createdAt || '',
          emailVerified: result.data.emailVerified || false,
        });
      } else {
        throw new Error(result.message || 'Failed to fetch profile details');
      }
    } catch (error) {
      console.error('Fetch profile error:', error.message);
      Alert.alert('Error', `Failed to fetch profile: ${error.message}`);
      if (error.message.includes('Unauthorized') || error.message.includes('Invalid token') || error.message.includes('No token found')) {
        Alert.alert(
          'Authentication Error',
          'Your session is invalid. Please login again.',
          [{ text: 'OK', onPress: () => router.replace('/auth/login') }]
        );
      }
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleEditField = (field, title) => {
    setEditModal({
      visible: true,
      title,
      value: userData[field]?.toString() || '',
      field,
    });
  };

  const handleSaveField = async (value) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      const response = await fetch(`${API_BASE_URL}/api/users/profile?fullName=${encodeURIComponent(value)}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (result.success) {
        setUserData(prev => ({ ...prev, fullName: result.data.fullName }));
        Alert.alert('Success', 'Full name updated successfully');
      } else {
        throw new Error(result.message || 'Failed to update full name');
      }
    } catch (error) {
      console.error('Update profile error:', error.message);
      Alert.alert('Error', `Failed to update full name: ${error.message}`);
      if (error.message.includes('Unauthorized') || error.message.includes('Invalid token') || error.message.includes('No token found')) {
        Alert.alert(
          'Authentication Error',
          'Your session is invalid. Please login again.',
          [{ text: 'OK', onPress: () => router.replace('/auth/login') }]
        );
      }
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
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('token');
              router.replace('/auth/login');
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loadingProfile) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons name="loading" size={48} color="#007AFF" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {Platform.OS !== 'web' && (
        <View style={styles.gradientBackground}>
          <View style={styles.gradientTop} />
          <View style={styles.gradientBottom} />
        </View>
      )}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 20 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#007AFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Profile</Text>
            <View style={styles.headerSpacer} />
          </View>
        </View>

        <View style={styles.profileHeader}>
          <Text style={styles.profileName}>{userData.fullName || 'Full Name'}</Text>
          <Text style={styles.profileDesignation}>{userData.email || 'Email'}</Text>
        </View>

        <ProfileSection title="Personal Information">
          <ProfileItem
            icon="account"
            title="Full Name"
            value={userData.fullName || 'Add your full name'}
            onPress={() => handleEditField('fullName', 'Full Name')}
          />
          <ProfileItem
            icon="email"
            title="Email"
            value={userData.email || 'Add your email'}
          />
          <ProfileItem
            icon="calendar"
            title="Joined At"
            value={formatDate(userData.createdAt)}
          />
          <ProfileItem
            icon={userData.emailVerified ? "check-circle" : "close-circle"}
            title="Email Verified"
            value={userData.emailVerified ? 'Yes ✅' : 'No ❌'}
            valueStyle={{ color: userData.emailVerified ? '#2e7d32' : '#c62828' }}
          />
        </ProfileSection>

        <ProfileSection title="Account">
          <ProfileItem
            icon="logout"
            title="Logout"
            onPress={handleLogout}
          />
        </ProfileSection>

        <EditModal
          visible={editModal.visible}
          title={editModal.title}
          value={editModal.value}
          onClose={() => setEditModal({ ...editModal, visible: false })}
          onSave={handleSaveField}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8ff',
    position: 'relative',
    marginTop:35,
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 1,
  },
  gradientTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '50%',
    backgroundColor: '#ffffff',
  },
  gradientBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
    backgroundColor: '#e3f2fd',
    opacity: 0.6,
  },
  scrollView: {
    flex: 1,
    zIndex: 2,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#003087',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 24,
  },
  profileHeader: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginTop:10,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  profileDesignation: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 3,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 10,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#F8F9FA',
    marginTop:15,
  },
  profileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  profileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileItemContent: {
    marginLeft: 15,
    flex: 1,
  },
  profileItemTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  profileItemValue: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginTop: Platform.OS === 'ios' ? 20 : 0,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCancel: {
    fontSize: 16,
    color: '#666',
  },
  modalSave: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});