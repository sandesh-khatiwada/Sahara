import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  Platform,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';
import { useNavbar } from './_layout';

const { width } = Dimensions.get('window');

// Default fallback image
const DEFAULT_PROFILE_IMAGE = 'https://randomuser.me/api/portraits/women/8.jpg';

const ProfileSection = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const ProfileItem = ({ icon, title, value, onPress, rightComponent }) => (
  <TouchableOpacity style={styles.profileItem} onPress={onPress} disabled={!onPress}>
    <View style={styles.profileItemLeft}>
      <MaterialCommunityIcons name={icon} size={24} color="#007AFF" />
      <View style={styles.profileItemContent}>
        <Text style={styles.profileItemTitle}>{title}</Text>
        {value && <Text style={styles.profileItemValue}>{value}</Text>}
      </View>
    </View>
    {rightComponent || (onPress && <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />)}
  </TouchableOpacity>
);

const EditModal = ({ visible, title, value, onClose, onSave, multiline = false, keyboardType = 'default' }) => {
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
            style={[styles.modalInput, multiline && styles.modalInputMultiline]}
            value={editValue}
            onChangeText={setEditValue}
            placeholder={`Enter ${title.toLowerCase()}`}
            multiline={multiline}
            keyboardType={keyboardType}
            textAlignVertical={multiline ? 'top' : 'center'}
          />
        </View>
      </View>
    </Modal>
  );
};

// New ResetPasswordModal component
const ResetPasswordModal = ({ visible, onClose, onSubmit }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'All fields are required');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New password and confirm password do not match');
      return;
    }
   
    onSubmit({ oldPassword, newPassword });
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
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
          <Text style={styles.modalTitle}>Reset Password</Text>
          <TouchableOpacity onPress={handleSubmit}>
            <Text style={styles.modalSave}>Submit</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.modalContent}>
          <TextInput
            style={styles.modalInput}
            value={oldPassword}
            onChangeText={setOldPassword}
            placeholder="Enter old password"
            secureTextEntry
          />
          <TextInput
            style={styles.modalInput}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Enter new password"
            secureTextEntry
          />
          <TextInput
            style={styles.modalInput}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm new password"
            secureTextEntry
          />
        </View>
      </View>
    </Modal>
  );
};

export default function CounsellorProfile() {
  const [counsellorData, setCounsellorData] = useState({
    fullName: '',
    email: '',
    phone: '',
    bio: '',
    designation: '',
    chargePerHour: 0,
    profilePhoto: null,
    nmcNo: '',
    qualification: '',
  });
  const [editModal, setEditModal] = useState({
    visible: false,
    title: '',
    value: '',
    field: '',
    multiline: false,
    keyboardType: 'default',
  });
  const [resetPasswordModal, setResetPasswordModal] = useState(false); // New state for reset password modal
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const { hideNavbar, showNavbar } = useNavbar();
  const scrollY = useRef(0);
  const scrollDirection = useRef(null);

  const getProfileImageUri = () => {
    if (imageError) return DEFAULT_PROFILE_IMAGE;
    if (counsellorData?.profilePhoto?.filename) {
      return `${API_BASE_URL}/uploads/profile_photos/${counsellorData.profilePhoto.filename}`;
    }
    return DEFAULT_PROFILE_IMAGE;
  };

  const handleScroll = (event) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const direction = currentScrollY > scrollY.current ? 'down' : 'up';
    
    if (direction !== scrollDirection.current) {
      scrollDirection.current = direction;
      if (direction === 'down' && currentScrollY > 50) {
        hideNavbar();
      } else if (direction === 'up' || currentScrollY < 50) {
        showNavbar();
      }
    }
    scrollY.current = currentScrollY;
  };

  const fetchProfileInfo = async () => {
    try {
      setLoadingProfile(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      const res = await fetch(`${API_BASE_URL}/api/counsellors/profile-info`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const json = await res.json();
      if (json.success && json.data) {
        setCounsellorData({
          fullName: json.data.fullName || '',
          email: json.data.email || '',
          phone: json.data.phone || '',
          bio: json.data.bio || '',
          designation: json.data.designation || '',
          chargePerHour: json.data.chargePerHour || 0,
          profilePhoto: json.data.profilePhoto || null,
          nmcNo: json.data.nmcNo || '',
          qualification: json.data.qualification || '',
        });
      } else {
        throw new Error(json.message || 'Failed to load profile information');
      }
    } catch (err) {
      console.error('Fetch profile info error:', err.message);
      Alert.alert('Error', `Failed to load profile: ${err.message}`);
      if (err.message.includes('Unauthorized') || err.message.includes('Invalid token') || err.message.includes('No token found')) {
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

  const handleEditField = (field, title, multiline = false, keyboardType = 'default') => {
    setEditModal({
      visible: true,
      title,
      value: counsellorData[field]?.toString() || '',
      field,
      multiline,
      keyboardType,
    });
  };

  const handleSaveField = async (value) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      const updatedData = { [editModal.field]: value };
      const res = await fetch(`${API_BASE_URL}/api/counsellors/profile-info`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setCounsellorData({
          fullName: json.data.fullName || '',
          email: json.data.email || '',
          phone: json.data.phone || '',
          bio: json.data.bio || '',
          designation: json.data.designation || '',
          chargePerHour: json.data.chargePerHour || 0,
          profilePhoto: json.data.profilePhoto || null,
          nmcNo: json.data.nmcNo || '',
          qualification: json.data.qualification || '',
        });
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        throw new Error(json.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Update profile error:', err.message);
      Alert.alert('Error', `Failed to update profile: ${err.message}`);
      if (err.message.includes('Unauthorized') || err.message.includes('Invalid token') || err.message.includes('No token found')) {
        Alert.alert(
          'Authentication Error',
          'Your session is invalid. Please login again.',
          [{ text: 'OK', onPress: () => router.replace('/auth/login') }]
        );
      }
    }
  };

  // New function to handle password reset
  const handleResetPassword = async ({ oldPassword, newPassword }) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      const res = await fetch(`${API_BASE_URL}/api/counsellors/reset-password`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const json = await res.json();
      if (json.success) {
        Alert.alert('Success', 'Password updated successfully');
        setResetPasswordModal(false);
      } else {
        throw new Error(json.message || 'Failed to reset password');
      }
    } catch (err) {
      console.error('Reset password error:', err.message);
      Alert.alert('Error', err.message || 'Failed to reset password');
      if (err.message.includes('Unauthorized') || err.message.includes('Invalid token') || err.message.includes('No token found')) {
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
              await AsyncStorage.removeItem('counsellorToken');
              await AsyncStorage.removeItem('counsellorData');
              await AsyncStorage.removeItem('user');
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
    fetchProfileInfo();
  }, []);

  if (loadingProfile) {
    return (
      <View style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
          <MaterialCommunityIcons name="loading" size={48} color="#007AFF" />
          <Text style={{ marginTop: 16, fontSize: 16, color: '#666', fontWeight: '500' }}>
            Loading profile...
          </Text>
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
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>Profile</Text>
            </View>
            <View style={styles.headerRight}>
              <Image
                source={{ uri: getProfileImageUri() }}
                style={styles.counsellorAvatar}
                onError={() => setImageError(true)}
                defaultSource={{ uri: DEFAULT_PROFILE_IMAGE }}
              />
            </View>
          </View>
        </View>

        <View style={styles.profileHeader}>
          <View style={styles.profilePhotoContainer}>
            <Image
              source={{ uri: getProfileImageUri() }}
              style={styles.profilePhoto}
              onError={() => setImageError(true)}
              defaultSource={{ uri: DEFAULT_PROFILE_IMAGE }}
            />
          </View>
          <Text style={styles.profileName}>{counsellorData.fullName || 'Full Name'}</Text>
          <Text style={styles.profileDesignation}>{counsellorData.designation || 'Designation'}</Text>
        </View>

        <ProfileSection title="Personal Information">
          <ProfileItem
            icon="account"
            title="Full Name"
            value={counsellorData.fullName || 'Add your full name'}
            onPress={() => handleEditField('fullName', 'Full Name')}
          />
          <ProfileItem
            icon="email"
            title="Email"
            value={counsellorData.email || 'Add your email'}
          />
          <ProfileItem
            icon="phone"
            title="Phone"
            value={counsellorData.phone || 'Add your phone number'}
          />
          <ProfileItem
            icon="text"
            title="Bio"
            value={counsellorData.bio && counsellorData.bio.length > 50 ? counsellorData.bio.substring(0, 50) + '...' : counsellorData.bio || 'Add your bio'}
            onPress={() => handleEditField('bio', 'Bio', true)}
          />
        </ProfileSection>

        <ProfileSection title="Professional Information">
          <ProfileItem
            icon="school"
            title="Designation"
            value={counsellorData.designation || 'Add your designation'}
            onPress={() => handleEditField('designation', 'Designation')}
          />
          <ProfileItem
            icon="currency-usd"
            title="Charge per Hour"
            value={`Rs.${counsellorData.chargePerHour || '0'}`}
            onPress={() => handleEditField('chargePerHour', 'Charge per Hour', false, 'numeric')}
          />
          <ProfileItem
            icon="card-text"
            title="NMC No"
            value={counsellorData.nmcNo || 'N/A'}
          />
          <ProfileItem
            icon="school"
            title="Qualification"
            value={counsellorData.qualification || 'N/A'}
          />
        </ProfileSection>

        <ProfileSection title="Settings">
          <ProfileItem
            icon="calendar-clock"
            title="Manage Availability"
            value="Set your working hours and shifts"
            onPress={() => router.push('/counsellor/settings/availability')}
          />
          <ProfileItem
            icon="lock-reset"
            title="Reset Password"
            value="Change your account password"
            onPress={() => setResetPasswordModal(true)}
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
          multiline={editModal.multiline}
          keyboardType={editModal.keyboardType}
          onClose={() => setEditModal({ ...editModal, visible: false })}
          onSave={handleSaveField}
        />
        <ResetPasswordModal
          visible={resetPasswordModal}
          onClose={() => setResetPasswordModal(false)}
          onSubmit={handleResetPassword}
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
    marginTop: 35,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    marginLeft: 15,
  },
  counsellorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#003087',
  },
  profileHeader: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  profilePhotoContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
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
    paddingVertical: 10,
    backgroundColor: '#F8F9FA',
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
    marginTop: 20,
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
    marginBottom: 15, // Added margin for spacing between inputs
  },
  modalInputMultiline: {
    height: 120,
    textAlignVertical: 'top',
  },
});