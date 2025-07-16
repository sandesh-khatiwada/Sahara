import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const DoctorProfile = () => {
  const [selectedDate, setSelectedDate] = useState(new Date('2025-07-16'));
  const [selectedTimePeriod, setSelectedTimePeriod] = useState(null);
  const [expandedTimeSlots, setExpandedTimeSlots] = useState(null);

  // Dates for the next 7 days starting from today (July 16, 2025)
  const dates = Array.from({ length: 8 }, (_, i) => {
    const d = new Date('2025-07-16');
    d.setDate(d.getDate() + i);
    return d;
  });

  // Time slots for each period
  const timeSlots = {
    Morning: ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM'],
    Afternoon: ['12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM'],
    Evening: ['4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM'],
    Night: ['8:00 PM', '9:00 PM', '10:00 PM'],
  };

  const handleTimePeriodPress = (period) => {
    setSelectedTimePeriod(period);
    setExpandedTimeSlots(period === expandedTimeSlots ? null : period);
  };

  const handleDatePress = (date) => {
    setSelectedDate(date);
    setExpandedTimeSlots(null); // Collapse time slots when date changes
  };

  const sendAppointmentRequest = () => {
    alert(`Appointment requested for ${selectedDate.toDateString()} at ${selectedTimePeriod}`);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Dr. Nanathya Regmi</Text>
        <Text style={styles.time}>14:20</Text>
      </View>

      {/* Profile Image and Rating */}
      <View style={styles.profileSection}>
        <View style={styles.imagePlaceholder} />
        <Text style={styles.rating}>★ 4.6</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity style={styles.tabButton}>
          <Text style={styles.tabText}>Availability</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabButton}>
          <Text style={styles.tabText}>About</Text>
        </TouchableOpacity>
      </View>

      {/* Availability Section */}
      <View style={styles.availabilitySection}>
        <Text style={styles.sectionTitle}>Select Date</Text>
        <View style={styles.dateContainer}>
          {dates.map((date, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dateButton,
                selectedDate.toDateString() === date.toDateString() && styles.selectedDate,
              ]}
              onPress={() => handleDatePress(date)}
            >
              <Text style={styles.dateText}>
                {date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3)} {date.getDate()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Time</Text>
        <View style={styles.timePeriodContainer}>
          {Object.keys(timeSlots).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.timePeriodButton,
                selectedTimePeriod === period && styles.selectedTimePeriod,
              ]}
              onPress={() => handleTimePeriodPress(period)}
            >
              <Text style={styles.timePeriodText}>{period}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {expandedTimeSlots && (
          <View style={styles.timeSlotsContainer}>
            {timeSlots[expandedTimeSlots].map((slot, index) => (
              <TouchableOpacity key={index} style={styles.timeSlotButton}>
                <Text style={styles.timeSlotText}>{slot}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.sendButton} onPress={sendAppointmentRequest}>
          <Text style={styles.sendButtonText}>Send Appointment Request</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navText}>Journal</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navText}>AI Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navText}>Sessions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navText}>Statistics</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#e0e7f0',
  },
  backArrow: {
    fontSize: 18,
    color: '#007AFF',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  time: {
    fontSize: 16,
    color: '#666',
  },
  profileSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  imagePlaceholder: {
    width: 150,
    height: 150,
    backgroundColor: '#c0d8f0',
    borderRadius: 75,
  },
  rating: {
    fontSize: 18,
    color: '#ffd700',
    marginTop: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#d0e0f0',
    borderRadius: 20,
    marginHorizontal: 5,
  },
  tabText: {
    fontSize: 16,
    color: '#333',
  },
  availabilitySection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  dateButton: {
    padding: 10,
    backgroundColor: '#d0e0f0',
    borderRadius: 15,
    margin: 5,
  },
  selectedDate: {
    backgroundColor: '#007AFF',
  },
  dateText: {
    fontSize: 14,
    color: '#333',
  },
  timePeriodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  timePeriodButton: {
    padding: 10,
    backgroundColor: '#d0e0f0',
    borderRadius: 15,
  },
  selectedTimePeriod: {
    backgroundColor: '#007AFF',
  },
  timePeriodText: {
    fontSize: 14,
    color: '#333',
  },
  timeSlotsContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#e0e7f0',
    borderRadius: 10,
  },
  timeSlotButton: {
    padding: 8,
    marginVertical: 5,
    backgroundColor: '#ffffff',
    borderRadius: 8,
  },
  timeSlotText: {
    fontSize: 14,
    color: '#333',
  },
  sendButton: {
    marginTop: 20,
    paddingVertical: 15,
    backgroundColor: '#007AFF',
    borderRadius: 25,
    alignItems: 'center',
  },
  sendButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#e0e7f0',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 14,
    color: '#333',
  },
});

export default DoctorProfile;