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
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';

const { width } = Dimensions.get('window');

// Define hourly time slots for each shift
const timeSlots = {
  morning: [
    { id: '07-08', time: '7:00 AM - 8:00 AM', hour: '7-8', start: '07:00' },
    { id: '08-09', time: '8:00 AM - 9:00 AM', hour: '8-9', start: '08:00' },
    { id: '09-10', time: '9:00 AM - 10:00 AM', hour: '9-10', start: '09:00' },
    { id: '10-11', time: '10:00 AM - 11:00 AM', hour: '10-11', start: '10:00' },
    { id: '11-12', time: '11:00 AM - 12:00 PM', hour: '11-12', start: '11:00' },
  ],
  afternoon: [
    { id: '12-13', time: '12:00 PM - 1:00 PM', hour: '12-1', start: '12:00' },
    { id: '13-14', time: '1:00 PM - 2:00 PM', hour: '1-2', start: '13:00' },
    { id: '14-15', time: '2:00 PM - 3:00 PM', hour: '2-3', start: '14:00' },
  ],
  evening: [
    { id: '15-16', time: '3:00 PM - 4:00 PM', hour: '3-4', start: '15:00' },
    { id: '16-17', time: '4:00 PM - 5:00 PM', hour: '4-5', start: '16:00' },
    { id: '17-18', time: '5:00 PM - 6:00 PM', hour: '5-6', start: '17:00' },
  ],
  night: [
    { id: '18-19', time: '6:00 PM - 7:00 PM', hour: '6-7', start: '18:00' },
    { id: '19-20', time: '7:00 PM - 8:00 PM', hour: '7-8', start: '19:00' },
    { id: '20-21', time: '8:00 PM - 9:00 PM', hour: '8-9', start: '20:00' },
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

const weekDays = [
  { id: 'monday', name: 'Mon', fullName: 'Monday' },
  { id: 'tuesday', name: 'Tue', fullName: 'Tuesday' },
  { id: 'wednesday', name: 'Wed', fullName: 'Wednesday' },
  { id: 'thursday', name: 'Thu', fullName: 'Thursday' },
  { id: 'friday', name: 'Fri', fullName: 'Friday' },
  { id: 'saturday', name: 'Sat', fullName: 'Saturday' },
  { id: 'sunday', name: 'Sun', fullName: 'Sunday' },
];

// Map API time (e.g., "08:00") to UI slot ID (e.g., "08-09")
const mapApiTimeToSlotId = (time, period) => {
  const slot = timeSlots[period.toLowerCase()].find((s) => s.start === time);
  return slot ? slot.id : null;
};

// Map UI slot ID (e.g., "08-09") to API time (e.g., "08:00")
const mapSlotIdToApiTime = (slotId, period) => {
  const slot = timeSlots[period.toLowerCase()].find((s) => s.id === slotId);
  return slot ? slot.start : null;
};

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
                    isDaySelected && [styles.dayButtonActive, { backgroundColor: '#9747FF' }],
                  ]}
                  onPress={() => onToggle(day.id)}
                >
                  <Text style={[styles.dayText, isDaySelected && styles.dayTextActive]}>
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
                    isTimeSelected && [styles.timeSlotButtonActive, { backgroundColor: shift.color }],
                  ]}
                  onPress={() => onTimeToggle(slot.id)}
                >
                  <Text style={[styles.timeSlotText, isTimeSelected && styles.timeSlotTextActive]}>
                    {slot.hour}
                  </Text>
                  <Text style={[styles.timeSlotSubText, isTimeSelected && styles.timeSlotSubTextActive]}>
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
    afternoon: { enabled: false, days: [], times: [] },
    evening: { enabled: false, days: [], times: [] },
    night: { enabled: false, days: [], times: [] },
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('User token not found. Please log in again.');
      }

      const url = `${API_BASE_URL}/api/counsellors/availability`;
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

      if (json.success && json.data) {
        const newAvailability = {
          morning: { enabled: false, days: [], times: [] },
          afternoon: { enabled: false, days: [], times: [] },
          evening: { enabled: false, days: [], times: [] },
          night: { enabled: false, days: [], times: [] },
        };

        json.data.forEach(({ dayOfWeek, slots }) => {
          const dayId = weekDays.find((d) => d.fullName === dayOfWeek)?.id;
          if (!dayId) return;

          slots.forEach(({ period, times }) => {
            const shiftId = period.toLowerCase();
            if (!newAvailability[shiftId]) return;

            newAvailability[shiftId].enabled = true;
            if (!newAvailability[shiftId].days.includes(dayId)) {
              newAvailability[shiftId].days.push(dayId);
            }

            times.forEach((time) => {
              const slotId = mapApiTimeToSlotId(time, shiftId);
              if (slotId && !newAvailability[shiftId].times.includes(slotId)) {
                newAvailability[shiftId].times.push(slotId);
              }
            });
          });
        });

        setAvailability(newAvailability);
      } else {
        throw new Error(json.message || 'Failed to load availability');
      }
    } catch (err) {
      console.error('Fetch error:', err.message);
      setError(`Failed to fetch availability: ${err.message}`);
      Alert.alert('Error', `Failed to fetch availability: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, []);

  const toggleShift = (shiftId) => {
    setAvailability((prev) => ({
      ...prev,
      [shiftId]: {
        ...prev[shiftId],
        enabled: !prev[shiftId].enabled,
        days: !prev[shiftId].enabled ? prev[shiftId].days : [],
        times: !prev[shiftId].enabled ? prev[shiftId].times : [],
      },
    }));
    setHasChanges(true);
  };

  const toggleDay = (shiftId, dayId) => {
    setAvailability((prev) => {
      const currentDays = prev[shiftId].days;
      const newDays = currentDays.includes(dayId)
        ? currentDays.filter((d) => d !== dayId)
        : [...currentDays, dayId];

      return {
        ...prev,
        [shiftId]: {
          ...prev[shiftId],
          days: newDays,
        },
      };
    });
    setHasChanges(true);
  };

  const toggleTime = (shiftId, timeId) => {
    setAvailability((prev) => {
      const currentTimes = prev[shiftId].times;
      const newTimes = currentTimes.includes(timeId)
        ? currentTimes.filter((t) => t !== timeId)
        : [...currentTimes, timeId];

      return {
        ...prev,
        [shiftId]: {
          ...prev[shiftId],
          times: newTimes,
        },
      };
    });
    setHasChanges(true);
  };

  const saveAvailability = async () => {
    try {
      setIsSaving(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('User token not found. Please log in again.');
      }

      // Transform availability to API format
      const apiAvailability = [];
      weekDays.forEach((day) => {
        const slots = [];
        Object.entries(availability).forEach(([shiftId, config]) => {
          if (config.enabled && config.days.includes(day.id) && config.times.length > 0) {
            const times = config.times
              .map((slotId) => mapSlotIdToApiTime(slotId, shiftId))
              .filter(Boolean);
            if (times.length > 0) {
              slots.push({
                period: shiftId.charAt(0).toUpperCase() + shiftId.slice(1),
                times,
              });
            }
          }
        });
        if (slots.length > 0) {
          apiAvailability.push({
            dayOfWeek: day.fullName,
            slots,
          });
        }
      });

      const requestBody = { availability: apiAvailability };
      const url = `${API_BASE_URL}/api/counsellors/availability`;
      console.log('POSTing to:', url, 'Body:', JSON.stringify(requestBody, null, 2));
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', res.status);
      const json = await res.json();
      console.log('API Response:', JSON.stringify(json, null, 2));

      if (json.success) {
        Alert.alert('Success', 'Your availability has been updated successfully!');
        setHasChanges(false);
        await fetchAvailability(); // Refresh availability after save
      } else {
        throw new Error(json.message || 'Failed to save availability');
      }
    } catch (err) {
      console.error('Save error:', err.message);
      Alert.alert('Error', `Failed to save availability: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
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
              afternoon: { enabled: false, days: [], times: [] },
              evening: { enabled: false, days: [], times: [] },
              night: { enabled: false, days: [], times: [] },
            });
            setHasChanges(true);
          },
        },
      ]
    );
  };

  const getActiveShiftsCount = () => {
    return Object.values(availability).filter(
      (shift) => shift.enabled && shift.days.length > 0 && shift.times.length > 0
    ).length;
  };

  const getTotalAvailableHours = () => {
    let totalHours = 0;
    Object.entries(availability).forEach(([_, config]) => {
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
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading availability...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchAvailability}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Manage Availability</Text>
              <TouchableOpacity style={styles.resetButton} onPress={resetToDefault}>
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
                  {Object.values(availability).reduce(
                    (total, shift) => total + shift.days.length * shift.times.length,
                    0
                  )}
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
                  style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                  onPress={saveAvailability}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <MaterialCommunityIcons name="content-save" size={20} color="#fff" />
                      <Text style={styles.saveButtonText}>Save Availability</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </>
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
    padding: 25,
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
    borderRadius: 15,
    borderColor: 'rgba(33, 150, 243, 0.3)',
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
    color: '#061B36',
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
  saveButtonDisabled: {
    backgroundColor: '#A5D6A7', // Lighter green for disabled state
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#D32F2F',
    marginBottom: 10,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

