import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { API_BASE_URL } from '@env';

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
    fullName: 'Dr. Sarah Wilson',
    email: 'sarah.wilson@sahara.com',
    phone: '+1 234 567 8900',
    designation: 'Clinical Psychologist',
    experience: '8 years',
    chargePerHour: '150',
    bio: 'Experienced clinical psychologist specializing in anxiety, depression, and trauma therapy. I use evidence-based approaches including CBT and mindfulness techniques.',
    qualifications: 'PhD in Clinical Psychology, Licensed Clinical Psychologist',
    specializations: ['Anxiety Disorders', 'Depression', 'Trauma Therapy', 'CBT'],
    languages: ['English', 'Spanish'],
    availability: {
      monday: { enabled: true, start: '09:00', end: '17:00' },
      tuesday: { enabled: true, start: '09:00', end: '17:00' },
      wednesday: { enabled: true, start: '09:00', end: '17:00' },
      thursday: { enabled: true, start: '09:00', end: '17:00' },
      friday: { enabled: true, start: '09:00', end: '17:00' },
      saturday: { enabled: false, start: '09:00', end: '17:00' },
      sunday: { enabled: false, start: '09:00', end: '17:00' },
    },
    notifications: {
      sessionReminders: true,
      newRequests: true,
      clientMessages: true,
      marketing: false,
    },
    profilePhoto: 'https://randomuser.me/api/portraits/women/8.jpg',
  });

  const [editModal, setEditModal] = useState({
    visible: false,
    title: '',
    value: '',
    field: '',
    multiline: false,
    keyboardType: 'default',
  });

  const [availabilityModalVisible, setAvailabilityModalVisible] = useState(false);
  const [notificationsModalVisible, setNotificationsModalVisible] = useState(false);

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
      // Try to get counsellor data from either storage location
      let data = await AsyncStorage.getItem('counsellorData');
      if (!data) {
        // Fallback to check user data for counsellor role
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const parsedUserData = JSON.parse(userData);
          if (parsedUserData.role === 'Counsellor') {
            data = JSON.stringify(parsedUserData);
          }
        }
      }
      
      if (data) {
        const parsedData = JSON.parse(data);
        setCounsellorData(prev => ({ ...prev, ...parsedData }));
      }
    } catch (error) {
      console.error('Error loading counsellor data:', error);
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

  // Only keep the setTimeout version below

  return (
    <View style={styles.container}>
      {/* Gradient Background for non-web platforms */}
      {Platform.OS !== 'web' && (
        <View style={styles.gradientBackground}>
          <View style={styles.gradientTop} />
          <View style={styles.gradientBottom} />
        </View>
      )}
      <ScrollView style={styles.scrollView}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Profile</Text>
          </View>
          <View style={styles.headerRight}>
             <Image
                  source={
                            counsellorData?.profilePhoto && typeof counsellorData.profilePhoto === 'string'
                              ? { uri: counsellorData.profilePhoto }
                              : { uri: 'https://randomuser.me/api/portraits/women/8.jpg' }
                          }
              style={styles.counsellorAvatar} 
            />
          </View>
        </View>
      </View>

      {/* Profile Photo & Basic Info */}
      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={handleChangeProfilePhoto} style={styles.profilePhotoContainer}>
          <Image
            source={
              counsellorData?.profilePhoto && typeof counsellorData.profilePhoto === 'string'
                ? { uri: counsellorData.profilePhoto }
                : { uri: 'https://randomuser.me/api/portraits/women/8.jpg' }
            }
            style={styles.profilePhoto}
          />
          <View style={styles.cameraIcon}>
            <MaterialCommunityIcons name="camera" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.profileName}>{counsellorData.fullName}</Text>
        <Text style={styles.profileDesignation}>{counsellorData.designation}</Text>
        <Text style={styles.profileExperience}>{counsellorData.experience} experience</Text>
      </View>

      {/* Personal Information */}
      <ProfileSection title="Personal Information">
        <ProfileItem
          icon="account"
          title="Full Name"
          value={counsellorData.fullName}
          onPress={() => handleEditField('fullName', 'Full Name')}
        />
        <ProfileItem
          icon="email"
          title="Email"
          value={counsellorData.email}
          onPress={() => handleEditField('email', 'Email', false, 'email-address')}
        />
        <ProfileItem
          icon="phone"
          title="Phone"
          value={counsellorData.phone}
          onPress={() => handleEditField('phone', 'Phone', false, 'phone-pad')}
        />
        <ProfileItem
          icon="text"
          title="Bio"
          value={counsellorData.bio.length > 50 ? counsellorData.bio.substring(0, 50) + '...' : counsellorData.bio}
          onPress={() => handleEditField('bio', 'Bio', true)}
        />
      </ProfileSection>

      {/* Professional Information */}
      <ProfileSection title="Professional Information">
        <ProfileItem
          icon="school"
          title="Designation"
          value={counsellorData.designation}
          onPress={() => handleEditField('designation', 'Designation')}
        />
        <ProfileItem
          icon="calendar"
          title="Experience"
          value={counsellorData.experience}
          onPress={() => handleEditField('experience', 'Experience')}
        />
        <ProfileItem
          icon="currency-usd"
          title="Charge per Hour"
          value={`$${counsellorData.chargePerHour}`}
          onPress={() => handleEditField('chargePerHour', 'Charge per Hour', false, 'numeric')}
        />
        <ProfileItem
          icon="certificate"
          title="Qualifications"
          value={counsellorData.qualifications.length > 50 ? counsellorData.qualifications.substring(0, 50) + '...' : counsellorData.qualifications}
          onPress={() => handleEditField('qualifications', 'Qualifications', true)}
        />
      </ProfileSection>

      {/* Settings */}
      <ProfileSection title="Settings">
        <ProfileItem
          icon="calendar-clock"
          title="Availability"
          value="Manage your schedule"
          onPress={() => setAvailabilityModalVisible(true)}
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

      {/* Availability Modal */}
      <Modal
        visible={availabilityModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setAvailabilityModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setAvailabilityModalVisible(false)}>
              <Text style={styles.modalCancel}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Availability</Text>
            <TouchableOpacity onPress={() => setAvailabilityModalVisible(false)}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            {Object.entries(counsellorData.availability).map(([day, settings]) => (
              <View key={day} style={styles.availabilityItem}>
                <View style={styles.availabilityHeader}>
                  <Text style={styles.availabilityDay}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
                  <Switch
                    value={settings.enabled}
                    onValueChange={(value) => {
                      setCounsellorData({
                        ...counsellorData,
                        availability: {
                          ...counsellorData.availability,
                          [day]: { ...settings, enabled: value }
                        }
                      });
                    }}
                  />
                </View>
                {settings.enabled && (
                  <View style={styles.timeSlots}>
                    <Text style={styles.timeSlot}>{settings.start} - {settings.end}</Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>

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
            {Object.entries(counsellorData.notifications).map(([key, value]) => (
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
                        ...counsellorData.notifications,
                        [key]: newValue
                      }
                    });
                  }}
                />
              </View>
            ))}
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
    backgroundColor: '#f8f9fa',
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
  timeSlots: {
    marginTop: 10,
  },
  timeSlot: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#F8F9FA',
    padding: 8,
    borderRadius: 4,
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
