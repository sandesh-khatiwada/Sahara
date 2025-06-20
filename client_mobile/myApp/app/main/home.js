import React from 'react';
import { View, ScrollView, Text, StyleSheet, Image, TouchableOpacity, FlatList } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Dummy doctor data
const doctors = [
  {
    id: '1',
    name: 'Dr. Smith',
    rating: 4.5,
    image: 'https://randomuser.me/api/portraits/men/1.jpg',
  },
  {
    id: '2',
    name: 'Dr. Jane',
    rating: 4.8,
    image: 'https://randomuser.me/api/portraits/women/2.jpg',
  },
  {
    id: '3',
    name: 'Dr. Adams',
    rating: 1.2,
    image: 'https://randomuser.me/api/portraits/men/3.jpg',
  },
  {
    id: '4',
    name: 'Dr. Maria',
    rating: 4.9,
    image: 'https://randomuser.me/api/portraits/women/4.jpg',
  },
];

// Custom Header component
const CustomHeader = () => {
  return (
    <View style={styles.header}>
      <View style={styles.iconContainer}>
        <View style={styles.logoContainer}>
          <Image source={require('./../../assets/image/SaharaAppIcon.png')} style={styles.logo} />
        </View>
        <MaterialCommunityIcons name="magnify" size={40} color="#003087" />
        <MaterialCommunityIcons name="bell-outline" size={40} color="#003087" />
        <MaterialCommunityIcons name="account-circle" size={40} color="#003087" />
        {/* <Image source={require('../../assets/image/Therapist_client.png')} style={styles.logo} /> */}
      </View>
      <View style={styles.separatorLine} />
      <View style={styles.greetingContainer}>
        <Text style={styles.greeting}>Hello Aayusha 👋</Text>
        <Text style={styles.message}>
          "We're glad you're here 💙 You are doing your best, and that's more than enough. Keep going—you're not alone."
        </Text>
      </View>
    </View>
  );
};

// Star Rating
const StarRating = ({ rating }) => {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <View style={{ flexDirection: 'row' }}>
      {[...Array(full)].map((_, i) => (
        <MaterialCommunityIcons key={'f' + i} name="star" size={16} color="#FFD700" />
      ))}
      {half && <MaterialCommunityIcons name="star-half-full" size={16} color="#FFD700" />}
      {[...Array(empty)].map((_, i) => (
        <MaterialCommunityIcons key={'e' + i} name="star-outline" size={16} color="#FFD700" />
      ))}
    </View>
  );
};

// Doctor Card
const DoctorCard = ({ doctor }) => (
  <TouchableOpacity style={styles.doctorCard}>
    <Image source={{ uri: doctor.image }} style={styles.doctorImage} />
    <Text style={styles.doctorName}>{doctor.name}</Text>
    <StarRating rating={doctor.rating} />
  </TouchableOpacity>
);

// Home Screen
export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <CustomHeader />
      <View style={styles.content}>
        {/* Mood Tracker Box */}
        <View style={styles.moodBox}>
          <Text style={styles.sectionTitle}>Mood Tracker</Text>
          <Text>How are you feeling right now?</Text>
          <View style={styles.moodTracker}>
            <View style={styles.moodOption}>
              <Text>😞</Text>
              <Text>Bad</Text>
            </View>
            <View style={styles.moodOption}>
              <Text>🙁</Text>
              <Text>Low</Text>
            </View>
            <View style={styles.moodOption}>
              <Text>😐</Text>
              <Text>Neutral</Text>
            </View>
            <View style={styles.moodOption}>
              <Text>🙂</Text>
              <Text>Good</Text>
            </View>
            <View style={styles.moodOption}>
              <Text>😄</Text>
              <Text>Great</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.saveMoodButton}>
            <Text style={styles.saveMoodText}>Save Today's Mood</Text>
          </TouchableOpacity>
        </View>

        {/* Book a Session */}
        <Text style={styles.sectionTitle}>Book a Session</Text>
        <FlatList
          data={doctors}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 5 }}
          renderItem={({ item }) => <DoctorCard doctor={item} />}
        />

        {/* Appointments */}
        <Text style={styles.sectionTitle}>My Appointments </Text>
        {Array(40)
          .fill()
          .map((_, i) => (
            <Text key={i}>Scrollable content item {i + 1}</Text>
          ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 35,
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
    resizeMode: 'contain',
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
  doctorCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginRight: 15,
    marginVertical: 10,
    alignItems: 'center',
    width: 150,
    height: 190,
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
    marginBottom: 4,
    textAlign: 'center',
  },
});
