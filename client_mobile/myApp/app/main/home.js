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
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';
import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';
import moment from 'moment-timezone';

// Mood mapping
const moodLevels = {
  Bad: { height: 20, emoji: '😞' },
  Low: { height: 40, emoji: '🙁' },
  Neutral: { height: 60, emoji: '😐' },
  Good: { height: 80, emoji: '🙂' },
  Great: { height: 100, emoji: '😄' },
};

// Sleep quality color mapping
const sleepQualityColors = {
  Poor: '#FF6B6B',
  Fair: '#FFD93D',
  Good: '#6BCB77',
  Excellent: '#4D96FF',
};

const CustomHeader = ({ fullName, onLogout }) => (
  <View style={styles.header}>
    <View style={styles.iconContainer}>
      <View style={styles.logoContainer}>
        <Image 
          source={require('./../../assets/image/SaharaAppIcon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <TouchableOpacity onPress={onLogout}>
        <MaterialCommunityIcons name="logout" size={40} color="#003087" />
      </TouchableOpacity>
    </View>
    <View style={styles.separatorLine} />
    <View style={styles.greetingContainer}>
      <Text style={styles.greeting}>Hello {fullName || 'Aayusha'} 👋</Text>
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
  const imageUrl = `${API_BASE_URL}/Uploads/profile_photos/${doctor.profilePhoto.filename}`;

  return (
    <TouchableOpacity
      style={styles.doctorCard}
      onPress={() =>
        router.push({
          pathname: '/seeall/userside/doctordetails',
          params: {
            email: doctor.email,
            doctorName: doctor.fullName,
          },
        })
      }
    >
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
    <View style={{ alignItems: 'center', marginHorizontal: 8, height: 150, justifyContent: 'flex-end' }}>
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
  // Use moment-timezone for Nepal's timezone (+0545)
  const today = moment().tz('Asia/Kathmandu').startOf('day');
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = moment(today).subtract(i, 'days');
    return {
      date: date.format('MM/DD/YYYY'),
      day: days[date.day()],
    };
  }).reverse(); // [Sat, Sun, Mon, Tue, Wed, Thu, Fri]

  // Map mood history to the past 7 days
  const dayMoodMap = {};
  last7Days.forEach(({ day }) => (dayMoodMap[day] = null)); // Initialize with null
  history.forEach(entry => {
    if (dayMoodMap.hasOwnProperty(entry.day) && moodLevels.hasOwnProperty(entry.mood)) {
      dayMoodMap[entry.day] = entry.mood;
    }
  });

  console.log('Last 7 Days:', last7Days);
  console.log('Day Mood Map:', dayMoodMap);

  return (
    <View>
      <View style={[styles.moodChartContainer, { height: 140 }]}>
        {last7Days.map(({ day }, index) => (
          <View key={day + index} style={{ flex: 1, alignItems: 'center' }}>
            {dayMoodMap[day] ? <MoodBar mood={dayMoodMap[day]} /> : <View style={{ height: 140 }} />}
          </View>
        ))}
      </View>
      <View style={styles.daysLabelContainer}>
        {last7Days.map(({ day }) => (
          <Text key={day} style={styles.dayLabel}>
            {day}
          </Text>
        ))}
      </View>
    </View>
  );
};

const SleepBar = ({ hours, quality }) => {
  const height = hours ? hours * 10 : 0; // Scale hours to height (10px per hour)
  const backgroundColor = quality ? sleepQualityColors[quality] : '#E0E0E0';
  return (
    <View style={{ alignItems: 'center', marginHorizontal: 8, height: 140, justifyContent: 'flex-end' }}>
      {hours && (
        <Text style={styles.barLabel}>{hours}h</Text>
      )}
      <View
        style={{
          width: 30,
          height,
          backgroundColor,
          borderRadius: 8,
          marginBottom: 5,
        }}
      />
    </View>
  );
};

const SleepChart = ({ history }) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = moment().tz('Asia/Kathmandu').startOf('day');
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = moment(today).subtract(i, 'days');
    return {
      date: date.format('MM/DD/YYYY'),
      day: days[date.day()],
    };
  }).reverse(); // [Sat, Sun, Mon, Tue, Wed, Thu, Fri]

  const daySleepMap = {};
  last7Days.forEach(({ date, day }) => (daySleepMap[date] = { day, hours: null, quality: null }));
  history.forEach(entry => {
    const normalizedEntryDate = entry.date; // API date is already in MM/DD/YYYY
    if (last7Days.some(d => d.date === normalizedEntryDate)) {
      daySleepMap[normalizedEntryDate] = { 
        day: entry.day, 
        hours: entry.hoursSlept, 
        quality: entry.quality 
      };
    }
  });

  console.log('Sleep History:', history);
  console.log('Last 7 Days:', last7Days);
  console.log('Day Sleep Map:', daySleepMap);

  return (
    <View>
      <View style={[styles.sleepChartContainer, { height: 140 }]}>
        {last7Days.map(({ date, day }) => (
          <View key={date} style={{ flex: 1, alignItems: 'center' }}>
            <SleepBar hours={daySleepMap[date].hours} quality={daySleepMap[date].quality} />
          </View>
        ))}
      </View>
      <View style={styles.daysLabelContainer}>
        {last7Days.map(({ day }) => (
          <Text key={day} style={styles.dayLabel}>
            {day}
          </Text>
        ))}
      </View>
      <View style={styles.legendContainer}>
        {Object.keys(sleepQualityColors).map(quality => (
          <View key={quality} style={styles.legendItem}>
            <View style={[styles.legendColorBox, { backgroundColor: sleepQualityColors[quality] }]} />
            <Text style={styles.legendText}>{quality}</Text>
          </View>
        ))}
        <View style={styles.legendItem}>
          <View style={[styles.legendColorBox, { backgroundColor: '#E0E0E0' }]} />
          <Text style={styles.legendText}>No Data</Text>
        </View>
      </View>
    </View>
  );
};

const UpcomingAppointmentCard = ({ appointment }) => {
  const { counsellor, date, time } = appointment;
  const imageUrl = `${API_BASE_URL}/Uploads/profile_photos/${counsellor.profilePhoto.filename}`;

  return (
    <TouchableOpacity
      style={styles.appointmentCard}
      onPress={() => router.push('/main/sessions')}
    >
      <Image source={{ uri: imageUrl }} style={styles.appointmentImage} />
      <View style={styles.appointmentDetails}>
        <Text style={styles.appointmentDate}>{date}</Text>
        <Text style={styles.appointmentTime}>{time}</Text>
        <Text style={styles.appointmentDoctor}>{counsellor.fullName}</Text>
        <Text style={styles.appointmentSpecialty}>{counsellor.designation}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const { user } = useLocalSearchParams();
  const [userData, setUserData] = useState(null);
  const [userFullName, setUserFullName] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [moodHistory, setMoodHistory] = useState([]);
  const [sleepHistory, setSleepHistory] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [hoursSlept, setHoursSlept] = useState(8);
  const [sleepQuality, setSleepQuality] = useState('Poor');
  const [sleepLogLoading, setSleepLogLoading] = useState(false);

  useEffect(() => {
    if (user) setUserData(JSON.parse(user));
  }, [user]);

  const fetchUserProfile = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      if (json.success && json.data?.fullName) {
        setUserFullName(json.data.fullName);
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
    }
  }, []);

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

  const fetchSleepHistory = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/api/users/sleep-logs-history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setSleepHistory(json.data);
      } else {
        console.error('Sleep history fetch failed:', json.message);
      }
    } catch (err) {
      console.error('Sleep history fetch error:', err);
    }
  }, []);

  const fetchUpcomingAppointments = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return Alert.alert('Error', 'User token not found');

      const res = await fetch(`${API_BASE_URL}/api/users/sessions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      if (json.success) {
        setUpcomingAppointments(json.upcomingAppointments);
      } else {
        Alert.alert('Failed to load upcoming appointments');
      }
    } catch (err) {
      console.error('Upcoming appointments fetch error:', err);
      Alert.alert('Error', 'Failed to fetch upcoming appointments');
    }
  }, []);

  const logSleep = async () => {
    try {
      setSleepLogLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        router.replace('/auth/login');
        Alert.alert('Error', 'You need to be logged in to log sleep');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/users/sleep-log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          hoursSlept: hoursSlept.toString(),
          quality: sleepQuality,
        }),
      });

      const json = await response.json();
      if (json.success) {
        Alert.alert('Success', json.message || 'Sleep log added successfully.');
        fetchSleepHistory();
      } else {
        Alert.alert('Error', json.message || 'Failed to log sleep.');
      }
    } catch (error) {
      console.error('Sleep log error:', error);
      Alert.alert('Error', 'Failed to log sleep: ' + error.message);
    } finally {
      setSleepLogLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserProfile();
      fetchDoctors();
      fetchMoodHistory();
      fetchSleepHistory();
      fetchUpcomingAppointments();
    }, [fetchUserProfile, fetchDoctors, fetchMoodHistory, fetchSleepHistory, fetchUpcomingAppointments])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchUserProfile(),
      fetchDoctors(),
      fetchMoodHistory(),
      fetchSleepHistory(),
      fetchUpcomingAppointments(),
    ]);
    setRefreshing(false);
  }, [fetchUserProfile, fetchDoctors, fetchMoodHistory, fetchSleepHistory, fetchUpcomingAppointments]);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      router.replace('/auth/login');
    } catch (error) {
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <CustomHeader fullName={userFullName} onLogout={handleLogout} />
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

        {/* Sleep Log */}
        <View style={styles.moodBox}>
          <View style={styles.headerRow}>
            <Text style={styles.sectionTitle}>Sleep Log</Text>
          </View>
          <Text style={{ marginBottom: 10 }}>How many hours did you sleep last night?</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={12}
            step={0.5}
            value={hoursSlept}
            onValueChange={setHoursSlept}
            minimumTrackTintColor="#007AFF"
            maximumTrackTintColor="#E0E0E0"
            thumbTintColor="#007AFF"
          />
          <Text style={styles.sliderValue}>{hoursSlept} hours</Text>
          <Text style={{ marginVertical: 10 }}>How was the quality of your sleep?</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={sleepQuality}
              onValueChange={(itemValue) => setSleepQuality(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Poor" value="Poor" />
              <Picker.Item label="Fair" value="Fair" />
              <Picker.Item label="Good" value="Good" />
              <Picker.Item label="Excellent" value="Excellent" />
            </Picker>
          </View>
          <TouchableOpacity
            style={[styles.saveMoodButton, sleepLogLoading && styles.disabledButton]}
            onPress={logSleep}
            disabled={sleepLogLoading}
          >
            <Text style={styles.saveMoodText}>
              {sleepLogLoading ? 'Logging Sleep...' : 'Log Sleep'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* My Appointments */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Appointments</Text>
          <TouchableOpacity onPress={() => router.push('/main/sessions')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={upcomingAppointments}
          keyExtractor={(item) => item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 5 }}
          renderItem={({ item }) => <UpcomingAppointmentCard appointment={item} />}
        />

        {/* Book a Session */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Book a Session</Text>
          <TouchableOpacity onPress={() => router.push('/seeall/userside/all_sessions')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
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
            Your mood history from the past 7 days journal
          </Text>
          <MoodChart history={moodHistory} />
        </View>

        {/* Sleep History */}
        <View style={[styles.moodBox, { marginTop: 20 }]}>
          <Text style={styles.sectionTitle}>Sleep History</Text>
          <Text style={{ color: '#666', marginBottom: 10 }}>
            Your sleep over the last week.
          </Text>
          <SleepChart history={sleepHistory} />
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
    marginHorizontal: 5,
    width: 170,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
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
    fontWeight: 'bold',
    fontSize: 14,
  },
  appointmentTime: {
    fontSize: 12,
    color: '#555',
  },
  appointmentDoctor: {
    fontWeight: '600',
    fontSize: 14,
    marginTop: 5,
  },
  appointmentSpecialty: {
    fontSize: 12,
    color: '#777',
  },
  doctorCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginHorizontal: 5,
    width: 130,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
    alignItems: 'center',
  },
  doctorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  doctorName: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 14,
  },
  moodChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  sleepChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  daysLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  dayLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginVertical: 5,
  },
  legendColorBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#333',
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  slider: {
    width: '100%',
    height: 70,
    marginVertical: 10,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  sliderValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#003087',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginVertical: 10,
    backgroundColor: '#fff',
    height: 50,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#333',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
});