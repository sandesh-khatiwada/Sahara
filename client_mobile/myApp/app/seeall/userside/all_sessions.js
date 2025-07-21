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
import sessionIcon from '../../../assets/image/doctor1.png'; // Placeholder icon, replace with actual asset

const dummySessions = [
  {
    id: 'individual',
    name: 'Individual Counseling',
    specialty: 'Clinical Psychology',
    chargePerHour: 800,
    icon: sessionIcon,
    doctorName: 'Bikram Kharal',
  },
  {
    id: 'indiddvidual',
    name: 'Individuaddl Counseling',
    specialty: 'Counseling Psychology',
    chargePerHour: 500,
    icon: sessionIcon,
    doctorName: 'Binod Yadav',
  },
  {
    id: 'group',
    name: 'Group Therapy',
    specialty: 'Group Therapy',
    chargePerHour: 400,
    icon: sessionIcon,
    doctorName: 'Aayusha Regmi',
  },
  {
    id: 'grodup',
    name: 'Therapy',
    specialty: 'Behavioral Therapy',
    chargePerHour: 800,
    icon: sessionIcon,
    doctorName: 'Bibek Pokhrel',
  },
  {
    id: 'online',
    name: 'Online Session',
    specialty: 'Telepsychiatry',
    chargePerHour: 600,
    icon: sessionIcon,
    doctorName: 'Niranjan Pandey',
  },
];

const SessionCard = ({ session }) => (
  <View style={styles.sessionCard}>
    <Image source={session.icon} style={styles.sessionImage} />
    <View style={styles.sessionInfo}>
      <Text style={styles.sessionName}>{session.doctorName}</Text>
      <Text style={styles.sessionDescription}>{session.specialty}</Text>
      <Text style={styles.charge}>Rs {session.chargePerHour} /hr</Text>
      <TouchableOpacity
        style={styles.viewDetailsButton}
        onPress={() => router.push({ pathname: './doctordetails', params: { doctorName: session.doctorName } })}
      >
        <Text style={styles.viewDetailsText}>Book Appointment</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default function SelectSessionType() {
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    setSessions(dummySessions);
    setFilteredSessions(dummySessions);
  }, []);

  const handleSearch = (text) => {
    setSearchText(text);
    const lowerText = text.toLowerCase();
    const filtered = dummySessions.filter((session) =>
      session.name.toLowerCase().includes(lowerText) ||
      session.specialty.toLowerCase().includes(lowerText) ||
      session.chargePerHour.toString().includes(lowerText) ||
      session.doctorName.toLowerCase().includes(lowerText)
    );
    setFilteredSessions(filtered);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#003087" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select a Doctor</Text>
      </View>

      {/* Search Field */}
      <TextInput
        placeholder="Search by session type, specialty, price, or doctor"
        placeholderTextColor="#aaa"
        value={searchText}
        onChangeText={handleSearch}
        style={styles.searchInput}
      />

      {/* List */}
      <FlatList
        data={filteredSessions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <SessionCard session={item} />}
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
    marginLeft: 90,
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
  sessionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    margin: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sessionImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 15,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003087',
    marginBottom: 5,
  },
  sessionDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  charge: {
    fontSize: 15,
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  viewDetailsButton: {
    backgroundColor: '#003087',
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  viewDetailsText: {
    
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign:'center',
  },
});