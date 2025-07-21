import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, SafeAreaView, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

// Define hourly time slots for each shift
const timeSlots = {
  morning: [
    { id: '07-08', time: '7:00 AM - 8:00 AM', hour: '7-8' },
    { id: '08-09', time: '8:00 AM - 9:00 AM', hour: '8-9' },
    { id: '09-10', time: '9:00 AM - 10:00 AM', hour: '9-10' },
    { id: '10-11', time: '10:00 AM - 11:00 AM', hour: '10-11' },
    { id: '11-12', time: '11:00 AM - 12:00 PM', hour: '11-12' },
  ],
  afternoon: [
    { id: '12-13', time: '12:00 PM - 1:00 PM', hour: '12-1' },
    { id: '13-14', time: '1:00 PM - 2:00 PM', hour: '1-2' },
    { id: '14-15', time: '2:00 PM - 3:00 PM', hour: '2-3' },
  ],
  evening: [
    { id: '15-16', time: '3:00 PM - 4:00 PM', hour: '3-4' },
    { id: '16-17', time: '4:00 PM - 5:00 PM', hour: '4-5' },
    { id: '17-18', time: '5:00 PM - 6:00 PM', hour: '5-6' },
  ],
  night: [
    { id: '18-19', time: '6:00 PM - 7:00 PM', hour: '6-7' },
    { id: '19-20', time: '7:00 PM - 8:00 PM', hour: '7-8' },
    { id: '20-21', time: '8:00 PM - 9:00 PM', hour: '8-9' },
  ],
};

// Define shifts
const shifts = [
  {
    id: 'morning',
    name: 'Morning Shift',
    time: '7:00 AM - 12:00 PM',
    icon: 'weather-sunny',
    color: '#FF9800',
    description: 'Early morning sessions for clients who prefer morning consultations',
  },
  {
    id: 'afternoon',
    name: 'Afternoon Shift',
    time: '12:00 PM - 3:00 PM',
    icon: 'weather-partly-cloudy',
    color: '#2196F3',
    description: 'Peak hours for most client consultations and therapy sessions',
  },
  {
    id: 'evening',
    name: 'Evening Shift',
    time: '3:00 PM - 6:00 PM',
    icon: 'weather-sunset',
    color: '#FF5722',
    description: 'After-work hours for clients with busy day schedules',
  },
  {
    id: 'night',
    name: 'Night Shift',
    time: '6:00 PM - 9:00 PM',
    icon: 'weather-night',
    color: '#673AB7',
    description: 'Late night support for mental health needs',
  },
];

// Generate next 7 days starting from today (July 21, 2025)
const getNextSevenDays = () => {
  const today = new Date('2025-07-21');
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return {
      id: date.toISOString().split('T')[0], // e.g., "2025-07-21"
      name: date.toLocaleDateString('en-US', { weekday: 'short' }), // e.g., "Mon"
      date: date.getDate(), // e.g., 21
      fullName: date.toLocaleDateString('en-US', { weekday: 'long' }), // e.g., "Monday"
    };
  });
};

const weekDays = getNextSevenDays();

const ShiftCard = ({ shift, isSelected, onToggle, selectedDays, selectedTimes, onTimeToggle }) => (
  <TouchableOpacity 
    style={[styles.shiftCard, isSelected && styles.shiftCardActive]}
    onPress={() => onToggle()}
  >
    <View style={styles.shiftHeader}>
      <View style={[styles.shiftIcon, { backgroundColor: shift.color + '15' }]}>
        <MaterialCommunityIcons name={shift.icon} size={24} color={shift.color} />
      </View>
      <View style={styles.shiftInfo}>
        <Text style={styles.shiftName}>{shift.name}</Text>
        <Text style={styles.shiftTime}>{shift.time}</Text>
        <Text style={styles.shiftDescription}>{shift.description}</Text>
      </View>
      <View style={[styles.toggleButton, isSelected && styles.toggleButtonActive]}>
        <MaterialCommunityIcons 
          name={isSelected ? 'check' : 'plus'} 
          size={20} 
          color={isSelected ? '#fff' : '#666'} 
        />
      </View>
    </View>
    
    {isSelected && (
      <View style={styles.configContainer}>
        {/* Days Selection */}
        <View style={styles.daysContainer}>
          <Text style={styles.daysTitle}>Available Days:</Text>
          <View style={styles.daysGrid}>
            {weekDays.map((day) => {
              const isDaySelected = selectedDays.includes(day.id);
              return (
                <TouchableOpacity
                  key={day.id}
                  style={[
                    styles.dayButton,
                    isDaySelected && [styles.dayButtonActive, { backgroundColor: '#007AFF' }]
                  ]}
                  onPress={() => onToggle(day.id)}
                >
                  <Text style={[
                    styles.dayText,
                    isDaySelected && styles.dayTextActive
                  ]}>
                    {day.name}
                  </Text>
                  <Text style={[
                    styles.dayDateText,
                    isDaySelected && styles.dayTextActive
                  ]}>
                    {day.date}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Time Slots Selection */}
        <View style={styles.timeSlotsContainer}>
          <Text style={styles.daysTitle}>Available Time Slots:</Text>
          <View style={styles.timeSlotsGrid}>
            {timeSlots[shift.id].map((slot) => {
              const isTimeSelected = selectedTimes.includes(slot.id);
              return (
                <TouchableOpacity
                  key={slot.id}
                  style={[
                    styles.timeSlotButton,
                    isTimeSelected && [styles.timeSlotButtonActive, { backgroundColor: shift.color }]
                  ]}
                  onPress={() => onTimeToggle(slot.id)}
                >
                  <Text style={[
                    styles.timeSlotText,
                    isTimeSelected && styles.timeSlotTextActive
                  ]}>
                    {slot.hour}
                  </Text>
                  <Text style={[
                    styles.timeSlotSubText,
                    isTimeSelected && styles.timeSlotSubTextActive
                  ]}>
                    {slot.time}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    )}
  </TouchableOpacity>
);

const DoctorProfile = () => {
  const [availability, setAvailability] = useState({
    morning: { enabled: false, days: [], times: [] },
    afternoon: { enabled: false, days: [], times: [] },
    evening: { enabled: false, days: [], times: [] },
    night: { enabled: false, days: [], times: [] },
  });
  const [hasChanges, setHasChanges] = useState(false);
  const { doctorName } = useLocalSearchParams();

  const toggleShift = (shiftId) => {
    setAvailability(prev => ({
      ...prev,
      [shiftId]: {
        ...prev[shiftId],
        enabled: !prev[shiftId].enabled,
        days: !prev[shiftId].enabled ? [] : prev[shiftId].days,
        times: !prev[shiftId].enabled ? [] : prev[shiftId].times,
      }
    }));
    setHasChanges(true);
  };

  const toggleDay = (shiftId, dayId) => {
    setAvailability(prev => {
      const currentDays = prev[shiftId].days;
      const newDays = currentDays.includes(dayId)
        ? currentDays.filter(d => d !== dayId)
        : [...currentDays, dayId];
      
      return {
        ...prev,
        [shiftId]: {
          ...prev[shiftId],
          days: newDays,
        }
      };
    });
    setHasChanges(true);
  };

  const toggleTime = (shiftId, timeId) => {
    setAvailability(prev => {
      const currentTimes = prev[shiftId].times;
      const newTimes = currentTimes.includes(timeId)
        ? currentTimes.filter(t => t !== timeId)
        : [...currentTimes, timeId];
      
      return {
        ...prev,
        [shiftId]: {
          ...prev[shiftId],
          times: newTimes,
        }
      };
    });
    setHasChanges(true);
  };

  const bookAppointment = () => {
    // Collect selected date and time for booking
    const selectedSlots = [];
    Object.entries(availability).forEach(([shiftId, config]) => {
      if (config.enabled && config.days.length > 0 && config.times.length > 0) {
        config.days.forEach(day => {
          config.times.forEach(time => {
            selectedSlots.push({ date: day, time: timeSlots[shiftId].find(slot => slot.id === time).time });
          });
        });
      }
    });
    alert(`Appointment booked successfully for ${doctorName}! Selected slots: ${JSON.stringify(selectedSlots)}`);
    setHasChanges(false);
  };

  const resetToDefault = () => {
    alert(`Resetting to default selection for ${doctorName}.`);
    setAvailability({
      morning: { enabled: false, days: [], times: [] },
      afternoon: { enabled: false, days: [], times: [] },
      evening: { enabled: false, days: [], times: [] },
      night: { enabled: false, days: [], times: [] },
    });
    setHasChanges(false);
  };

  const getActiveShiftsCount = () => {
    return Object.values(availability).filter(shift => shift.enabled && shift.days.length > 0 && shift.times.length > 0).length;
  };

  const getTotalAvailableHours = () => {
    let totalHours = 0;
    Object.entries(availability).forEach(([shiftId, config]) => {
      if (config.enabled && config.days.length > 0 && config.times.length > 0) {
        totalHours += config.days.length * config.times.length;
      }
    });
    return totalHours;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.title}>{doctorName || 'Doctor'}</Text>
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={resetToDefault}
          >
            <MaterialCommunityIcons name="refresh" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Profile Image and Rating */}
        <View style={styles.profileSection}>
          <Image source={require('../../../assets/image/doctor1.png')} style={styles.imagePlaceholder} />
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
          <Text style={styles.sectionTitle}>Book Appointment</Text>
          <Text style={styles.sectionSubtitle}>
            Select a date and time slot to book an appointment
          </Text>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="clock-check" size={20} color="#007AFF" />
              <Text style={styles.statNumber}>{getActiveShiftsCount()}</Text>
              <Text style={styles.statLabel}>Active Shifts</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="timer" size={20} color="#007AFF" />
              <Text style={styles.statNumber}>{getTotalAvailableHours()}h</Text>
              <Text style={styles.statLabel}>Selected Hours</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="calendar-check" size={20} color="#007AFF" />
              <Text style={styles.statNumber}>
                {Object.values(availability).reduce((total, shift) => total + (shift.days.length * shift.times.length), 0)}
              </Text>
              <Text style={styles.statLabel}>Time Slots</Text>
            </View>
          </View>

          {/* Shifts List */}
          {shifts.map((shift) => (
            <ShiftCard
              key={shift.id}
              shift={shift}
              isSelected={availability[shift.id].enabled}
              selectedDays={availability[shift.id].days}
              selectedTimes={availability[shift.id].times}
              onToggle={(dayId) => {
                if (dayId) {
                  toggleDay(shift.id, dayId);
                } else {
                  toggleShift(shift.id);
                }
              }}
              onTimeToggle={(timeId) => toggleTime(shift.id, timeId)}
            />
          ))}

          {/* Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <MaterialCommunityIcons name="information" size={20} color="#007AFF" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Booking Guidelines</Text>
              <Text style={styles.infoText}>
                • Select a shift to view available dates and times{'\n'}
                • Choose a date and time slot for your appointment{'\n'}
                • Each time slot is 1 hour long{'\n'}
                • Confirm your selection to book the appointment
              </Text>
            </View>
          </View>

          {/* Book Button */}
          {hasChanges && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.sendButton} onPress={bookAppointment}>
                <MaterialCommunityIcons name="calendar-plus" size={20} color="#fff" />
                <Text style={styles.sendButtonText}>Book Appointment</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    paddingTop: Platform.OS === 'android' ? 35 : 10,
    backgroundColor: '#e0e7f0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    flex: 1,
  },
  resetButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    alignItems: 'center',
    marginVertical: 20,
    position: 'relative',
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#c0d8f0', // Placeholder color
  },
  rating: {
    fontSize: 18,
    color: '#ffd700',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -9 }], // Center the rating text
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#003087', // Darker background to match a prominent style
    borderRadius: 20,
    marginHorizontal: 5,
  },
  tabText: {
    fontSize: 16,
    color: '#fff', // White text for contrast
    fontWeight: '600', // Bold text for emphasis
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
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
    marginTop: 2,
  },
  shiftCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  shiftCardActive: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  shiftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shiftIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  shiftInfo: {
    flex: 1,
  },
  shiftName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  shiftTime: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  shiftDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  toggleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#007AFF',
  },
  configContainer: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  daysContainer: {
    marginBottom: 16,
  },
  daysTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#d0e0f0',
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  dayButtonActive: {
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  dayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  dayDateText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#666',
    marginTop: 2,
  },
  dayTextActive: {
    color: '#fff',
  },
  timeSlotsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlotButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#d0e0f0',
    borderWidth: 1,
    borderColor: 'transparent',
    minWidth: 80,
    alignItems: 'center',
  },
  timeSlotButtonActive: {
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  timeSlotText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  timeSlotSubText: {
    fontSize: 9,
    color: '#666',
    fontWeight: '500',
  },
  timeSlotSubTextActive: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.1)',
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  sendButton: {
    backgroundColor: '#003087',
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default DoctorProfile;