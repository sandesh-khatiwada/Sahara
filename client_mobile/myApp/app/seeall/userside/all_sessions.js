import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  Button,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';

const SessionCard = ({ session }) => {
  const imageUrl = session.profilePhoto?.filename 
    ? `${API_BASE_URL}/Uploads/profile_photos/${session.profilePhoto.filename}`
    : 'https://via.placeholder.com/100';

  return (
    <View style={styles.sessionCard}>
      <Image source={{ uri: imageUrl }} style={styles.sessionImage} />
      <View style={styles.sessionInfo}>
        <Text style={styles.sessionName}>{session.fullName}</Text>
        <Text style={styles.sessionDescription}>{session.designation}</Text>
        <Text style={styles.charge}>Rs {session.chargePerHour} /hr</Text>
        <TouchableOpacity
          style={styles.viewDetailsButton}
          onPress={() => router.push({ 
            pathname: './doctordetails', 
            params: { 
              email: session.email, 
              doctorName: session.fullName 
            } 
          })}
        >
          <Text style={styles.viewDetailsText}>Book Appointment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function SelectSessionType() {
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await AsyncStorage.getItem('token');
      console.log('Token:', token ? 'Found' : 'Not found');

      if (!token) {
        Alert.alert('Error', 'User token not found. Please log in again.');
        setLoading(false);
        return;
      }

      let allCounsellors = [];
      let page = 1;
      let totalPages = 1;
      const limit = 100;

      while (page <= totalPages) {
        const url = `${API_BASE_URL}/api/users/counsellors/all?page=${page}&limit=${limit}`;
        console.log('Fetching from:', url);
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('Response status:', res.status);
        const json = await res.json();
        console.log('API Response:', JSON.stringify(json, null, 2));

        if (json.success) {
          allCounsellors = [...allCounsellors, ...json.data];
          totalPages = json.totalPages || 1;
          page += 1;
        } else {
          setError(json.message || 'Failed to load doctors');
          Alert.alert('Error', json.message || 'Failed to load doctors');
          setLoading(false);
          return;
        }
      }

      setSessions(allCounsellors);
      setFilteredSessions(allCounsellors);
    } catch (err) {
      console.error('Fetch error:', err.message);
      setError(`Failed to fetch doctors: ${err.message}`);
      Alert.alert('Error', `Failed to fetch doctors: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleSearch = (text) => {
    setSearchText(text);
    const lowerText = text.toLowerCase();
    const filtered = sessions.filter((session) =>
      (session.fullName?.toLowerCase().includes(lowerText) ||
       session.designation?.toLowerCase().includes(lowerText) ||
       session.chargePerHour?.toString().includes(lowerText)) ?? false
    );
    setFilteredSessions(filtered);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#003087" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select a Doctor</Text>
      </View>

      <TextInput
        placeholder="Search by name, designation, or price"
        placeholderTextColor="#aaa"
        value={searchText}
        onChangeText={handleSearch}
        style={styles.searchInput}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading doctors...</Text>
        </View>
      ) : error ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Retry" onPress={fetchDoctors} color="#003087" />
        </View>
      ) : filteredSessions.length === 0 ? (
        <View style={styles.loadingContainer}>
          <Text>No doctors found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredSessions}
          keyExtractor={(item) => item._id || item.id}
          renderItem={({ item }) => <SessionCard session={item} />}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
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
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#D32F2F',
    marginBottom: 10,
    textAlign: 'center',
  },
});