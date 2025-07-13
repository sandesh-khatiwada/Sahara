import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

// Define hourly time slots for each shift
const timeSlots = {
  morning: [
    { id: '09-10', time: '9:00 AM - 10:00 AM', hour: '9-10' },
    { id: '10-11', time: '10:00 AM - 11:00 AM', hour: '10-11' },
    { id: '11-12', time: '11:00 AM - 12:00 PM', hour: '11-12' },
  ],
  afternoon: [
    { id: '12-13', time: '12:00 PM - 1:00 PM', hour: '12-1' },
    { id: '13-14', time: '1:00 PM - 2:00 PM', hour: '1-2' },
    { id: '14-15', time: '2:00 PM - 3:00 PM', hour: '2-3' },
    { id: '15-16', time: '3:00 PM - 4:00 PM', hour: '3-4' },
    { id: '16-17', time: '4:00 PM - 5:00 PM', hour: '4-5' },
    { id: '17-18', time: '5:00 PM - 6:00 PM', hour: '5-6' },
  ],
  evening: [
    { id: '18-19', time: '6:00 PM - 7:00 PM', hour: '6-7' },
    { id: '19-20', time: '7:00 PM - 8:00 PM', hour: '7-8' },
    { id: '20-21', time: '8:00 PM - 9:00 PM', hour: '8-9' },
  ],
  night: [
    { id: '21-22', time: '9:00 PM - 10:00 PM', hour: '9-10' },
    { id: '22-23', time: '10:00 PM - 11:00 PM', hour: '10-11' },
    { id: '23-00', time: '11:00 PM - 12:00 AM', hour: '11-12' },
  ],
};

// Define 4 different shifts
const shifts = [
  {
    id: 'morning',
    name: 'Morning Shift',
    time: '9:00 AM - 12:00 PM',
    icon: 'weather-sunny',
    color: '#FF9800',
    description: 'Early morning sessions for clients who prefer morning consultations',
  },
  {
    id: 'afternoon',
    name: 'Afternoon Shift',
    time: '12:00 PM - 6:00 PM',
    icon: 'weather-partly-cloudy',
    color: '#2196F3',
    description: 'Peak hours for most client consultations and therapy sessions',
  },
  {
    id: 'evening',
    name: 'Evening Shift',
    time: '6:00 PM - 9:00 PM',
    icon: 'weather-sunset',
    color: '#FF5722',
    description: 'After-work hours for clients with busy day schedules',
  },
  {
    id: 'night',
    name: 'Night Shift',
    time: '9:00 PM - 12:00 AM',
    icon: 'weather-night',
    color: '#673AB7',
    description: 'Late night support for mental health needs',
  },
];

const weekDays = [
  { id: 'monday', name: 'Mon', fullName: 'Monday' },
  { id: 'tuesday', name: 'Tue', fullName: 'Tuesday' },
  { id: 'wednesday', name: 'Wed', fullName: 'Wednesday' },
  { id: 'thursday', name: 'Thu', fullName: 'Thursday' },
  { id: 'friday', name: 'Fri', fullName: 'Friday' },
  { id: 'saturday', name: 'Sat', fullName: 'Saturday' },
  { id: 'sunday', name: 'Sun', fullName: 'Sunday' },
];

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
                    isDaySelected && [styles.dayButtonActive, { backgroundColor: shift.color }]
                  ]}
                  onPress={() => onToggle(day.id)}
                >
                  <Text style={[
                    styles.dayText,
                    isDaySelected && styles.dayTextActive
                  ]}>
                    {day.name}
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

export default function CounsellorAvailability() {
  const [availability, setAvailability] = useState({
    morning: { enabled: false, days: [], times: [] },
    afternoon: { enabled: true, days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], times: ['12-13', '13-14', '14-15'] },
    evening: { enabled: false, days: [], times: [] },
    night: { enabled: false, days: [], times: [] },
  });
  const [hasChanges, setHasChanges] = useState(false);

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

  const saveAvailability = () => {
    // Here you would save to your backend/AsyncStorage
    Alert.alert(
      'Success',
      'Your availability has been updated successfully!',
      [{ text: 'OK' }]
    );
    setHasChanges(false);
  };

  const resetToDefault = () => {
    Alert.alert(
      'Reset Availability',
      'This will reset your availability to default settings. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            setAvailability({
              morning: { enabled: false, days: [], times: [] },
              afternoon: { enabled: true, days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], times: ['12-13', '13-14', '14-15'] },
              evening: { enabled: false, days: [], times: [] },
              night: { enabled: false, days: [], times: [] },
            });
            setHasChanges(true);
          }
        }
      ]
    );
  };

  const getActiveShiftsCount = () => {
    return Object.values(availability).filter(shift => shift.enabled && shift.days.length > 0 && shift.times.length > 0).length;
  };

  const getTotalAvailableHours = () => {
    let totalHours = 0;
    Object.entries(availability).forEach(([shiftId, config]) => {
      if (config.enabled && config.days.length > 0 && config.times.length > 0) {
        totalHours += config.days.length * config.times.length; // Each time slot is 1 hour
      }
    });
    return totalHours;
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar backgroundColor="transparent" barStyle="dark-content" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Manage Availability</Text>
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={resetToDefault}
          >
            <MaterialCommunityIcons name="refresh" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="clock-check" size={20} color="#4CAF50" />
            <Text style={styles.statNumber}>{getActiveShiftsCount()}</Text>
            <Text style={styles.statLabel}>Active Shifts</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="timer" size={20} color="#2196F3" />
            <Text style={styles.statNumber}>{getTotalAvailableHours()}h</Text>
            <Text style={styles.statLabel}>Weekly Hours</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="calendar-check" size={20} color="#FF9800" />
            <Text style={styles.statNumber}>
              {Object.values(availability).reduce((total, shift) => total + (shift.days.length * shift.times.length), 0)}
            </Text>
            <Text style={styles.statLabel}>Time Slots</Text>
          </View>
        </View>

        {/* Shifts List */}
        <ScrollView 
          style={styles.shiftsList}
          contentContainerStyle={styles.shiftsContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Choose Your Working Shifts</Text>
          <Text style={styles.sectionSubtitle}>
            Select the shifts you want to be available for client consultations
          </Text>

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

          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <MaterialCommunityIcons name="information" size={20} color="#2196F3" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Availability Guidelines</Text>
              <Text style={styles.infoText}>
                • Select shifts to activate them, then choose specific days and time slots{'\n'}
                • Each time slot is 1 hour long for focused consultations{'\n'}
                • Clients will only see your available time slots{'\n'}
                • You can update your availability anytime
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Save Button */}
        {hasChanges && (
          <View style={styles.saveContainer}>
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={saveAvailability}
            >
              <MaterialCommunityIcons name="content-save" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Save Availability</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
    marginTop: Platform.OS === 'android' ? 35 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(224, 224, 224, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -0.3,
  },
  resetButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
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
    color: '#1a1a1a',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
    marginTop: 2,
  },
  shiftsList: {
    flex: 1,
  },
  shiftsContent: {
    padding: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  shiftCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 16,
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
    borderColor: 'rgba(33, 150, 243, 0.3)',
    backgroundColor: 'rgba(33, 150, 243, 0.02)',
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
    color: '#1a1a1a',
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
    backgroundColor: '#4CAF50',
  },
  configContainer: {
    marginTop: 16,
  },
  daysContainer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
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
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dayButtonActive: {
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  dayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
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
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
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
  timeSlotTextActive: {
    color: '#fff',
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
    backgroundColor: 'rgba(33, 150, 243, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(33, 150, 243, 0.1)',
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
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
  saveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(224, 224, 224, 0.3)',
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});
