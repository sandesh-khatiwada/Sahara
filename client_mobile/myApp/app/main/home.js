import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';

// Mood mapping
const moodLevels = {
  Bad: { height: 20, emoji: '😞' },
  Low: { height: 40, emoji: '🙁' },
  Neutral: { height: 60, emoji: '😐' },
  Good: { height: 80, emoji: '🙂' },
  Great: { height: 100, emoji: '😄' },
};

// Dummy appointment data
const appointments = [
  {
    id: '1',
    doctorName: 'Dr. Nanathya Regmi',
    date: 'August 12 2025',
    time: '10:00am',
    image: 'https://randomuser.me/api/portraits/women/5.jpg',
    specialty: 'Counseling Psychologist | 12yrs Exp',
  },
  {
    id: '2',
    doctorName: 'Dr. John Doe',
    date: 'August 13 2025',
    time: '2:00pm',
    image: 'https://randomuser.me/api/portraits/men/6.jpg',
    specialty: 'Therapist | 8yrs Exp',
  },
];

const CustomHeader = ({ userData, onLogout }) => (
  <View style={styles.header}>
    <View style={styles.iconContainer}>
      <View style={styles.logoContainer}>
        <Image 
          source={require('./../../assets/image/SaharaAppIcon.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <MaterialCommunityIcons name="magnify" size={40} color="#003087" />
      <MaterialCommunityIcons name="bell-outline" size={40} color="#003087" />
      <TouchableOpacity onPress={onLogout}>
        <MaterialCommunityIcons name="logout" size={40} color="#003087" />
      </TouchableOpacity>
    </View>
    <View style={styles.separatorLine} />
    <View style={styles.greetingContainer}>
      <Text style={styles.greeting}>Hello {userData?.fullName || 'Aayusha'} 👋</Text>
      <Text style={styles.message}>
        "We're glad you're here 💙 You are doing your best, and that's more than enough. Keep going—you're not alone."
      </Text>
    </View>
  </View>
);

const AppointmentCard = ({ appointment }) => (
  <View style={styles.appointmentCard}>
    <Image source={{ uri: appointment.image }} style={styles.appointmentImage} />
    <View style={styles.appointmentDetails}>
      <Text style={styles.appointmentDate}>{appointment.date}</Text>
      <Text style={styles.appointmentTime}>{appointment.time}</Text>
      <Text style={styles.appointmentDoctor}>{appointment.doctorName}</Text>
      <Text style={styles.appointmentSpecialty}>{appointment.specialty}</Text>
    </View>
  </View>
);

const DoctorCard = ({ doctor }) => {
  const imageUrl = `${API_BASE_URL}/uploads/profile_photos/${doctor.profilePhoto.filename}`;
  return (
    <TouchableOpacity style={styles.doctorCard}>
      <Image source={{ uri: imageUrl }} style={styles.doctorImage} />
      <Text style={styles.doctorName}>{doctor.fullName}</Text>
      <Text style={styles.appointmentSpecialty}>{doctor.designation}</Text>
      <Text style={styles.appointmentTime}>Rs {doctor.chargePerHour} /hr</Text>
    </TouchableOpacity>
  );
};

const MoodBar = ({ mood }) => {
  const level = moodLevels[mood];
  return (
    <View style={{ alignItems: 'center', marginHorizontal: 8, height: 140, justifyContent: 'flex-end' }}>
      <View
        style={{
          width: 30,
          height: level.height,
          backgroundColor: '#AB47BC',
          borderRadius: 8,
          marginBottom: 5,
        }}
      />
      <Text style={{ fontSize: 18 }}>{level.emoji}</Text>
    </View>
  );
};

const MoodChart = ({ history }) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayMoodMap = {};
  days.forEach(day => (dayMoodMap[day] = []));
  history.forEach(entry => {
    if (dayMoodMap[entry.day]) {
      dayMoodMap[entry.day].push(entry.mood);
    }
  });

  // Calculate average mood for each day
  const moodsForDays = days.map(day => {
    const moods = dayMoodMap[day];
    const avgMood =
      moods.length > 0
        ? moods.reduce((acc, mood) => acc + Object.keys(moodLevels).indexOf(mood), 0) / moods.length
        : null;
    return avgMood != null ? Object.keys(moodLevels)[Math.round(avgMood)] : null;
  });

  return (
    <View>
      {/* Bars + emojis row */}
      <View style={[styles.moodChartContainer, { height: 140 }]}>
        {moodsForDays.map((mood, index) => (
          <View key={days[index]} style={{ flex: 1, alignItems: 'center' }}>
            {mood ? <MoodBar mood={mood} /> : <View style={{ height: 140 }} />}
          </View>
        ))}
      </View>

      {/* Days label row */}
      <View style={styles.daysLabelContainer}>
        {days.map(day => (
          <Text key={day} style={styles.dayLabel}>
            {day}
          </Text>
        ))}
      </View>
    </View>
  );
};

export default function HomeScreen() {
  const { user } = useLocalSearchParams();
  const [userData, setUserData] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [moodHistory, setMoodHistory] = useState([]);

  useEffect(() => {
    if (user) setUserData(JSON.parse(user));
  }, [user]);

  // Fetch functions
  const fetchDoctors = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return Alert.alert('Error', 'User token not found');

      const res = await fetch(`${API_BASE_URL}/api/users/counsellors`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      if (json.success) setDoctors(json.data.counsellors);
      else Alert.alert('Failed to load doctors');
    } catch (err) {
      console.error('Doctor fetch error:', err);
      Alert.alert('Error', 'Failed to fetch doctors');
    }
  }, []);

  const fetchMoodHistory = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/api/users/mood/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) setMoodHistory(json.data.history);
    } catch (err) {
      console.error('Mood fetch error:', err);
    }
  }, []);

  // Use focus effect to fetch data every time screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchDoctors();
      fetchMoodHistory();
    }, [fetchDoctors, fetchMoodHistory])
  );

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      router.replace('/auth/login');
    } catch (error) {
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <CustomHeader userData={userData} onLogout={handleLogout} />
      <View style={styles.content}>
        {/* Mood Tracker */}
        <View style={styles.moodBox}>
          <View style={styles.headerRow}>
            <Text style={styles.sectionTitle}>Mood Tracker</Text>
            <TouchableOpacity style={styles.addJournalButton} onPress={() => router.push('/main/journals')}>
              <Text style={styles.addJournalText}>Add Journal</Text>
            </TouchableOpacity>
          </View>
          <Text>How are you feeling right now?</Text>
          <View style={styles.moodTracker}>
            {["😞", "🙁", "😐", "🙂", "😄"].map((emoji, i) => (
              <View key={i} style={styles.moodOption}>
                <Text>{emoji}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.saveMoodButton} onPress={() => router.push('/main/journals')}>
            <Text style={styles.saveMoodText}>Save Today's Mood</Text>
          </TouchableOpacity>
        </View>

        {/* My Appointments */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Appointments</Text>
          <TouchableOpacity><Text style={styles.seeAllText}>See All</Text></TouchableOpacity>
        </View>
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 5 }}
          renderItem={({ item }) => <AppointmentCard appointment={item} />}
        />

        {/* Book a Session */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Book a Session</Text>
          <TouchableOpacity><Text style={styles.seeAllText}>See All</Text></TouchableOpacity>
        </View>
        <FlatList
          data={doctors}
          keyExtractor={(item) => item.email}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 5 }}
          renderItem={({ item }) => <DoctorCard doctor={item} />}
        />

        {/* Mood History */}
        <View style={[styles.moodBox, { marginTop: 20 }]}>
          <Text style={styles.sectionTitle}>Mood History</Text>
          <Text style={{ color: '#666', marginBottom: 10 }}>
            You felt better {moodHistory.length} times this week.
          </Text>
          <MoodChart history={moodHistory} />
          <TouchableOpacity style={styles.saveMoodButton}>
            <Text style={styles.saveMoodText}>View Detailed Analysis</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 35,
    marginBottom: 70,
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 1,
  },
  logoContainer: {
    position: 'absolute',
    top: -10,
    left: 10,
  },
  logo: {
    width: 60,
    height: 60,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
    marginTop: 0,
    gap: 10,
  },
  greetingContainer: {
    padding: 20,
    backgroundColor: '#D1C4E9',
    borderRadius: 10,
    marginTop: 10,
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003087',
  },
  message: {
    fontSize: 14,
    color: '#333',
  },
  separatorLine: {
    height: 1,
    backgroundColor: '#ddd',
    marginTop: 10,
  },
  content: {
    padding: 10,
    backgroundColor: '#F5F5F5',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#003087',
  },
  moodBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  moodTracker: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  moodOption: {
    alignItems: 'center',
  },
  saveMoodButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 10,
    marginVertical: 10,
    alignSelf: 'center',
    width: '90%',
  },
  saveMoodText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  addJournalButton: {
    backgroundColor: '#AB47BC',
    padding: 8,
    borderRadius: 10,
    alignSelf: 'flex-end',
  },
  addJournalText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
  },
  seeAllText: {
    color: '#AB47BC',
    fontSize: 14,
    fontWeight: 'bold',
  },
  appointmentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginRight: 15,
    marginVertical: 10,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  appointmentImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10,
  },
  appointmentDetails: {
    flex: 1,
  },
  appointmentDate: {
    fontSize: 14,
    color: '#666',
  },
  appointmentTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  appointmentDoctor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#003087',
  },
  appointmentSpecialty: {
    fontSize: 12,
    color: '#666',
  },
  doctorCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginRight: 15,
    marginVertical: 10,
    alignItems: 'center',
    width: 150,
    height: 200,
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
    marginBottom: 8,
  },
  doctorName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#003087',
    textAlign: 'center',
  },
  moodChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: 140,
  },
  daysLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 4,
  },
  dayLabel: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#333',
  },
});
