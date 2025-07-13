import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import doctor1 from '../../../assets/image/doctor1.png';

const API_BASE_URL = 'http://your-api-url.com'; // Replace with actual API URL

const dummyDoctors = [
  {
    fullName: 'Bikram Kharal',
    email: 'bikramkharal997@gmail.com',
    designation: 'Clinical Psychologist',
    chargePerHour: 1000,
    profilePhoto: null,
  },
  {
    fullName: 'Binod Yadav',
    email: 'binod@gmail.com',
    designation: 'Clinical Psychologist',
    chargePerHour: 1000,
    profilePhoto: null,
  },
  {
    fullName: 'Aayusha Regmi',
    email: 'aayusharegmi2@gmail.com',
    designation: 'Counsellor Psychiatrist',
    chargePerHour: 30,
    profilePhoto: null,
  },
  {
    fullName: 'Bibek Pokhrel',
    email: 'themarikib0x0@gmail.com',
    designation: 'Clinical Psychologist',
    chargePerHour: 1500,
    profilePhoto: null,
  },
  {
    fullName: 'Niranjan Pandey',
    email: 'niranjanpandey@gmail.com',
    designation: 'Doctor',
    chargePerHour: 50,
    profilePhoto: null,
  },
  {
    fullName: 'Anisha KC',
    email: 'anisha@gmail.com',
    designation: 'Psychologist',
    chargePerHour: 499,
    profilePhoto: null,
  },
];

const DoctorCard = ({ doctor }) => {
  const imageSource = doctor?.profilePhoto?.filename
    ? {
        uri: `${API_BASE_URL}/uploads/profile_photos/${doctor.profilePhoto.filename}`,
      }
    : doctor1;

  return (
    <View style={styles.doctorCard}>
      <Image source={imageSource} style={styles.doctorImage} />
      <Text style={styles.doctorName}>{doctor.fullName}</Text>
      <Text style={styles.designation}>{doctor.designation}</Text>
      <Text style={styles.email}>{doctor.email}</Text>
      <Text style={styles.charge}>Rs {doctor.chargePerHour} /hr</Text>
      <TouchableOpacity
        style={styles.viewProfileButton}
        onPress={() => console.log('Navigate to profile of', doctor.fullName)}
      >
        <Text style={styles.viewProfileText}>View Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function AllSessions() {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    setDoctors(dummyDoctors);
    setFilteredDoctors(dummyDoctors);
  }, []);

  const handleSearch = (text) => {
    setSearchText(text);
    const lowerText = text.toLowerCase();

    const filtered = doctors.filter((doc) =>
      doc.fullName.toLowerCase().includes(lowerText) ||
      doc.designation.toLowerCase().includes(lowerText) ||
      doc.chargePerHour.toString().includes(lowerText)
    );
    setFilteredDoctors(filtered);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#003087" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Counselors</Text>
      </View>

      {/* Search Field */}
      <TextInput
        placeholder="Search by name, specialization, or price"
        placeholderTextColor="#aaa"
        value={searchText}
        onChangeText={handleSearch}
        style={styles.searchInput}
      />

      {/* List */}
      <FlatList
        data={filteredDoctors}
        keyExtractor={(item) => item.email}
        renderItem={({ item }) => <DoctorCard doctor={item} />}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 32,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003087',
    marginLeft: 10,
  },
  searchInput: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    margin: 10,
    borderRadius: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#333',
  },
  doctorCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    margin: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  doctorImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003087',
    textAlign: 'center',
    marginBottom: 5,
  },
  designation: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  email: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    marginBottom: 5,
  },
  charge: {
    fontSize: 15,
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  viewProfileButton: {
    backgroundColor: '#003087',
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  viewProfileText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
