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
  Switch,
  Platform,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { API_BASE_URL } from '@env';
import { useNavbar } from './_layout';

const { width } = Dimensions.get('window');

// Default fallback image
const DEFAULT_PROFILE_IMAGE = 'https://randomuser.me/api/portraits/women/8.jpg';

// Time slots configuration from availability.js
const ProfileSection = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const ProfileItem = ({ icon, title, value, onPress, rightComponent }) => (
  <TouchableOpacity style={styles.profileItem} onPress={onPress}>
    <View style={styles.profileItemLeft}>
      <MaterialCommunityIcons name={icon} size={24} color="#007AFF" />
      <View style={styles.profileItemContent}>
        <Text style={styles.profileItemTitle}>{title}</Text>
        {value && <Text style={styles.profileItemValue}>{value}</Text>}
      </View>
    </View>
    {rightComponent || <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />}
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



export default function CounsellorProfile() {
  const [counsellorData, setCounsellorData] = useState({
    fullName: '',
    email: '',
    phone: '',
    designation: '',
    chargePerHour: 0,
    bio: '', // Not in backend model - optional
    qualifications: '', // Not in backend model - optional
    experience: '', // Not in backend model - optional
    specializations: [], // Not in backend model - optional
    languages: [], // Not in backend model - optional
    availability: [], // Backend uses array structure
    notifications: {
      sessionReminders: true,
      newRequests: true,
      clientMessages: true,
      marketing: false,
    },
    profilePhoto: null, // Backend uses object structure
    esewaAccountId: '', // Backend field
    documents: [], // Backend field
    isVerified: false, // Backend field
    isActive: true, // Backend field
  });

  const [editModal, setEditModal] = useState({
    visible: false,
    title: '',
    value: '',
    field: '',
    multiline: false,
    keyboardType: 'default',
  });

  const [notificationsModalVisible, setNotificationsModalVisible] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const { hideNavbar, showNavbar } = useNavbar();
  const scrollY = useRef(0);
  const scrollDirection = useRef(null);

  const getProfileImageUri = () => {
    if (imageError) return DEFAULT_PROFILE_IMAGE;
    
    if (counsellorData?.profilePhoto) {
      if (typeof counsellorData.profilePhoto === 'string') {
        return counsellorData.profilePhoto;
      }
      if (typeof counsellorData.profilePhoto === 'object' && counsellorData.profilePhoto.path) {
        // Backend returns profilePhoto as an object with path property
        return counsellorData.profilePhoto.path.startsWith('http') 
          ? counsellorData.profilePhoto.path 
          : `${API_BASE_URL}${counsellorData.profilePhoto.path}`;
      }
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

  // Logout handler: clears all tokens and navigates to login
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
                await AsyncStorage.removeItem('counsellorToken');
                await AsyncStorage.removeItem('counsellorData');
                await AsyncStorage.removeItem('user');
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

  useEffect(() => {
    loadCounsellorData();
  }, []);

  const loadCounsellorData = async () => {
    try {
      // First, try to get counsellor data from AsyncStorage
      let data = await AsyncStorage.getItem('counsellorData');
      if (!data) {
        // Fallback to check user data for counsellor role
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const parsedUserData = JSON.parse(userData);
          if (parsedUserData.role === 'Counsellor') {
            // Extract counsellor data from login response structure
            data = JSON.stringify(parsedUserData.Counsellor || parsedUserData);
          }
        }
      }

      if (data) {
        const parsedData = JSON.parse(data);
        
        // Process profile photo from backend structure
        let processedData = { 
          ...parsedData,
          // Ensure notifications object exists
          notifications: parsedData.notifications || {
            sessionReminders: true,
            newRequests: true,
            clientMessages: true,
            marketing: false,
          }
        };
        if (parsedData.profilePhoto && typeof parsedData.profilePhoto === 'object' && parsedData.profilePhoto.path) {
          // Backend returns profilePhoto as an object with path property
          processedData.profilePhoto = parsedData.profilePhoto.path.startsWith('http') 
            ? parsedData.profilePhoto.path 
            : `${API_BASE_URL}${parsedData.profilePhoto.path}`;
        }
        
        setCounsellorData(processedData);
      }
    } catch (error) {
      console.error('Error loading counsellor data:', error);
      Alert.alert('Error', 'Failed to load profile data');
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
    const updatedData = { ...counsellorData, [editModal.field]: value };
    setCounsellorData(updatedData);
    
    try {
      // Update both storage locations for compatibility
      await AsyncStorage.setItem('counsellorData', JSON.stringify(updatedData));
      
      // Also update the user data if it exists and is a counsellor
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUserData = JSON.parse(userData);
        if (parsedUserData.role === 'Counsellor') {
          const updatedUserData = { ...parsedUserData, ...updatedData };
          await AsyncStorage.setItem('user', JSON.stringify(updatedUserData));
        }
      }
      
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleChangeProfilePhoto = async () => {
    Alert.alert(
      'Change Profile Photo',
      'Choose an option',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Camera', onPress: () => openImagePicker('camera') },
        { text: 'Gallery', onPress: () => openImagePicker('gallery') },
      ]
    );
  };

  const openImagePicker = async (source) => {
    try {
      let result;
      if (source === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Permission required', 'Camera permission is needed');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Permission required', 'Gallery permission is needed');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled) {
        // Upload image to server and update profile
        const updatedData = { ...counsellorData, profilePhoto: result.assets[0].uri };
        setCounsellorData(updatedData);
        Alert.alert('Success', 'Profile photo updated successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile photo');
    }
  };



  return (
    <View style={styles.container}>
      {/* Gradient Background for non-web platforms */}
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
      {/* Header */}
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

      {/* Profile Photo & Basic Info */}
      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={handleChangeProfilePhoto} style={styles.profilePhotoContainer}>
          <Image
            source={{ uri: getProfileImageUri() }}
            style={styles.profilePhoto}
            onError={() => setImageError(true)}
            defaultSource={{ uri: DEFAULT_PROFILE_IMAGE }}
          />
          <View style={styles.cameraIcon}>
            <MaterialCommunityIcons name="camera" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.profileName}>{counsellorData.fullName || 'Full Name'}</Text>
        <Text style={styles.profileDesignation}>{counsellorData.designation || 'Designation'}</Text>
        <Text style={styles.profileExperience}>{counsellorData.experience || 'Experience'} experience</Text>
      </View>

      {/* Personal Information */}
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
          onPress={() => handleEditField('email', 'Email', false, 'email-address')}
        />
        <ProfileItem
          icon="phone"
          title="Phone"
          value={counsellorData.phone || 'Add your phone number'}
          onPress={() => handleEditField('phone', 'Phone', false, 'phone-pad')}
        />
        <ProfileItem
          icon="text"
          title="Bio"
          value={counsellorData.bio && counsellorData.bio.length > 50 ? counsellorData.bio.substring(0, 50) + '...' : counsellorData.bio || 'Add your bio'}
          onPress={() => handleEditField('bio', 'Bio', true)}
        />
      </ProfileSection>

      {/* Professional Information */}
      <ProfileSection title="Professional Information">
        <ProfileItem
          icon="school"
          title="Designation"
          value={counsellorData.designation || 'Add your designation'}
          onPress={() => handleEditField('designation', 'Designation')}
        />
        <ProfileItem
          icon="calendar"
          title="Experience"
          value={counsellorData.experience || 'Add your experience'}
          onPress={() => handleEditField('experience', 'Experience')}
        />
        <ProfileItem
          icon="currency-usd"
          title="Charge per Hour"
          value={`$${counsellorData.chargePerHour || '0'}`}
          onPress={() => handleEditField('chargePerHour', 'Charge per Hour', false, 'numeric')}
        />
        <ProfileItem
          icon="certificate"
          title="Qualifications"
          value={counsellorData.qualifications && counsellorData.qualifications.length > 50 ? counsellorData.qualifications.substring(0, 50) + '...' : counsellorData.qualifications || 'Add your qualifications'}
          onPress={() => handleEditField('qualifications', 'Qualifications', true)}
        />
      </ProfileSection>

      {/* Settings */}
      <ProfileSection title="Settings">
        <ProfileItem
          icon="calendar-clock"
          title="Manage Availability"
          value="Set your working hours and shifts"
          onPress={() => router.push('/counsellor/settings/availability')}
        />
        <ProfileItem
          icon="bell"
          title="Notifications"
          value="Manage notification settings"
          onPress={() => setNotificationsModalVisible(true)}
        />
      </ProfileSection>

      {/* Account */}
      <ProfileSection title="Account">
    <ProfileItem
      icon="logout"
      title="Logout"
      onPress={handleLogout}
    />
      </ProfileSection>

      {/* Edit Field Modal */}
      <EditModal
        visible={editModal.visible}
        title={editModal.title}
        value={editModal.value}
        multiline={editModal.multiline}
        keyboardType={editModal.keyboardType}
        onClose={() => setEditModal({ ...editModal, visible: false })}
        onSave={handleSaveField}
      />



      {/* Notifications Modal */}
      <Modal
        visible={notificationsModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setNotificationsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setNotificationsModalVisible(false)}>
              <Text style={styles.modalCancel}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Notifications</Text>
            <TouchableOpacity onPress={() => setNotificationsModalVisible(false)}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            {counsellorData.notifications && Object.entries(counsellorData.notifications).map(([key, value]) => (
              <View key={key} style={styles.notificationItem}>
                <Text style={styles.notificationTitle}>
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </Text>
                <Switch
                  value={value}
                  onValueChange={(newValue) => {
                    setCounsellorData({
                      ...counsellorData,
                      notifications: {
                        ...(counsellorData.notifications || {}),
                        [key]: newValue
                      }
                    });
                  }}
                />
              </View>
            ))}
            <View style={{ height: 30 }} />
          </ScrollView>
        </View>
      </Modal>
      
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
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
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
  profileExperience: {
    fontSize: 14,
    color: '#666',
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

  // Modal Styles
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
  },
  modalInputMultiline: {
    height: 120,
    textAlignVertical: 'top',
  },

  // Availability Styles
  availabilityItem: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 15,
  },
  availabilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  availabilityDay: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },

  // Notification Styles
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  notificationTitle: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
});
