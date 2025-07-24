import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  SafeAreaView,
  Image,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@env";

// Define hourly time slots for mapping API times
const timeSlots = {
  morning: [
    { id: "07-08", time: "7:00 AM - 8:00 AM", hour: "7-8", start: "07:00" },
    { id: "08-09", time: "8:00 AM - 9:00 AM", hour: "8-9", start: "08:00" },
    { id: "09-10", time: "9:00 AM - 10:00 AM", hour: "9-10", start: "09:00" },
    { id: "10-11", time: "10:00 AM - 11:00 AM", hour: "10-11", start: "10:00" },
    { id: "11-12", time: "11:00 AM - 12:00 PM", hour: "11-12", start: "11:00" },
  ],
  afternoon: [
    { id: "12-13", time: "12:00 PM - 1:00 PM", hour: "12-1", start: "12:00" },
    { id: "13-14", time: "1:00 PM - 2:00 PM", hour: "1-2", start: "13:00" },
    { id: "14-15", time: "2:00 PM - 3:00 PM", hour: "2-3", start: "14:00" },
  ],
  evening: [
    { id: "15-16", time: "3:00 PM - 4:00 PM", hour: "3-4", start: "15:00" },
    { id: "16-17", time: "4:00 PM - 5:00 PM", hour: "4-5", start: "16:00" },
    { id: "17-18", time: "5:00 PM - 6:00 PM", hour: "5-6", start: "17:00" },
  ],
  night: [
    { id: "18-19", time: "6:00 PM - 7:00 PM", hour: "6-7", start: "18:00" },
    { id: "19-20", time: "7:00 PM - 8:00 PM", hour: "7-8", start: "19:00" },
    { id: "20-21", time: "8:00 PM - 9:00 PM", hour: "8-9", start: "20:00" },
  ],
};

// Generate next 7 days starting from today
const getNextSevenDays = () => {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return {
      id: date.toISOString().split("T")[0], // e.g., "2025-07-22"
      name: date.toLocaleDateString("en-US", { weekday: "short" }), // e.g., "Tue"
      date: date.getDate(), // e.g., 22
      fullName: date.toLocaleDateString("en-US", { weekday: "long" }), // e.g., "Tuesday"
    };
  });
};

const weekDays = getNextSevenDays();

// Map backend times to frontend shifts
const mapTimeToShift = (time) => {
  const hour = parseInt(time.split(":")[0], 10);
  if (hour >= 7 && hour < 12) return "morning";
  if (hour >= 12 && hour < 15) return "afternoon";
  if (hour >= 15 && hour < 18) return "evening";
  if (hour >= 18 && hour <= 21) return "night";
  return null; // Invalid or out-of-range time
};

// DayCard component to display available days
const DayCard = ({
  day,
  isSelected,
  onToggle,
  availableTimes,
  selectedSlot,
  onTimeToggle,
}) => (
  <TouchableOpacity
    style={[styles.dayCard, isSelected && styles.dayCardActive]}
    onPress={() => onToggle(day.id)}
  >
    <View style={styles.dayHeader}>
      <Text style={styles.dayName}>{day.name}</Text>
      <Text style={styles.dayDate}>{day.date}</Text>
      <View
        style={[styles.toggleButton, isSelected && styles.toggleButtonActive]}
      >
        <MaterialCommunityIcons
          name={isSelected ? "chevron-up" : "chevron-down"}
          size={20}
          color={isSelected ? "#fff" : "#666"}
        />
      </View>
    </View>
    {isSelected && availableTimes && (
      <View style={styles.timeSlotsContainer}>
        {["morning", "afternoon", "evening", "night"].map((period) => {
          const periodTimes = availableTimes.filter(
            (slot) => slot.period === period
          );
          if (periodTimes.length === 0) return null;
          return (
            <View key={period} style={styles.periodSection}>
              <Text style={styles.periodTitle}>
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
              <View style={styles.timeSlotsGrid}>
                {periodTimes.map((slot) => (
                  <TouchableOpacity
                    key={slot.id}
                    style={[
                      styles.timeSlotButton,
                      selectedSlot?.slotId === slot.id &&
                        selectedSlot?.dayId === day.id && [
                          styles.timeSlotButtonActive,
                          { backgroundColor: "#007AFF" },
                        ],
                    ]}
                    onPress={() => onTimeToggle(day.id, slot.id)}
                  >
                    <Text
                      style={[
                        styles.timeSlotText,
                        selectedSlot?.slotId === slot.id &&
                          selectedSlot?.dayId === day.id &&
                          styles.timeSlotTextActive,
                      ]}
                    >
                      {slot.hour}
                    </Text>
                    <Text
                      style={[
                        styles.timeSlotSubText,
                        selectedSlot?.slotId === slot.id &&
                          selectedSlot?.dayId === day.id &&
                          styles.timeSlotSubTextActive,
                      ]}
                    >
                      {slot.time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        })}
      </View>
    )}
  </TouchableOpacity>
);

const DoctorProfile = () => {
  const { email, doctorName } = useLocalSearchParams();
  const [counsellor, setCounsellor] = useState(null);
  const [availability, setAvailability] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null); // { dayId, slotId }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteDescription, setNoteDescription] = useState("");

  const fetchCounsellor = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await AsyncStorage.getItem("token");
      console.log("Token:", token ? "Found" : "Not found");

      if (!token) {
        Alert.alert("Error", "User token not found. Please log in again.");
        setLoading(false);
        return;
      }

      const url = `${API_BASE_URL}/api/users/counsellor?email=${encodeURIComponent(
        email
      )}`;
      console.log("Fetching from:", url);
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Response status:", res.status);
      const json = await res.json();
      console.log("API Response:", JSON.stringify(json, null, 2));

      if (json.success) {
        setCounsellor(json.data);
        // Initialize availability from API response
        const backendAvailability = json.data.availability || [];
        const newAvailability = {};

        backendAvailability.forEach(({ dayOfWeek, slots }) => {
          const dayId = weekDays.find((day) => day.fullName === dayOfWeek)?.id;
          if (!dayId) {
            console.log(`No matching dayId for dayOfWeek: ${dayOfWeek}`);
            return;
          }

          newAvailability[dayId] = {
            enabled: true,
            slots: [],
          };

          slots.forEach(({ period, times }) => {
            times.forEach((time) => {
              const shiftId = mapTimeToShift(time);
              if (shiftId) {
                const slot = timeSlots[shiftId].find((s) => s.start === time);
                if (slot) {
                  newAvailability[dayId].slots.push({
                    id: slot.id,
                    time: slot.time,
                    hour: slot.hour,
                    period: shiftId,
                    start: slot.start, // Ensure start is included
                  });
                } else {
                  console.log(
                    `No matching slot for time: ${time} in shift: ${shiftId}`
                  );
                }
              } else {
                console.log(`Invalid shift for time: ${time}`);
              }
            });
          });
        });

        console.log(
          "Initialized availability:",
          JSON.stringify(newAvailability, null, 2)
        );
        setAvailability(newAvailability);
      } else {
        setError(json.message || "Failed to load counsellor");
        Alert.alert("Error", json.message || "Failed to load counsellor");
      }
    } catch (err) {
      console.error("Fetch error:", err.message);
      setError(`Failed to fetch counsellor: ${err.message}`);
      Alert.alert("Error", `Failed to fetch counsellor: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (email) {
      fetchCounsellor();
    } else {
      setError("No email provided");
      setLoading(false);
    }
  }, [email]);

  const toggleDay = (dayId) => {
    setSelectedDay(selectedDay === dayId ? null : dayId);
  };

  const toggleTime = (dayId, slotId) => {
    setSelectedSlot((prev) =>
      prev?.dayId === dayId && prev?.slotId === slotId
        ? null
        : { dayId, slotId }
    );
  };

  const bookAppointment = () => {
    if (!selectedSlot) {
      Alert.alert("Error", "Please select a time slot.");
      return;
    }
    setIsModalVisible(true);
  };

  const requestBooking = async () => {
    if (!noteTitle.trim() || !noteDescription.trim()) {
      Alert.alert("Error", "Please provide both a note title and description.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "User token not found. Please log in again.");
        return;
      }

      const selectedDayConfig = availability[selectedSlot.dayId];
      const selectedSlotConfig = selectedDayConfig?.slots.find(
        (slot) => slot.id === selectedSlot.slotId
      );
      const dayFullName = weekDays.find(
        (day) => day.id === selectedSlot.dayId
      )?.fullName;
      const time = selectedSlotConfig?.start;

      // Validate all required fields
      if (!counsellor?.email || !dayFullName || !time || !selectedSlotConfig) {
        Alert.alert("Error", "Missing or invalid booking information.");
        console.log("Missing/invalid data:", {
          counsellorEmail: counsellor?.email,
          day: dayFullName,
          time,
          selectedSlotId: selectedSlot?.slotId,
          selectedDayId: selectedSlot?.dayId,
          noteTitle,
          noteDescription,
          selectedSlotConfig,
        });
        return;
      }

      const requestBody = {
        counsellorEmail: counsellor.email,
        day: dayFullName,
        time,
        noteTitle,
        noteDescription,
      };

      const url = `${API_BASE_URL}/api/users/counsellor-booking`;
      console.log(
        "POSTing to:",
        url,
        "Body:",
        JSON.stringify(requestBody, null, 2)
      );
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("Response status:", res.status);
      const json = await res.json();
      console.log("API Response:", JSON.stringify(json, null, 2));

      if (json.success) {
        Alert.alert(
          "Success",
          "Counsellor has been notified about your appointment request"
        );
        setIsModalVisible(false);
        setNoteTitle("");
        setNoteDescription("");
        setSelectedSlot(null);
        setSelectedDay(null);
      } else {
        Alert.alert(
          "Error",
          json.message || "Failed to create booking request"
        );
      }
    } catch (err) {
      console.error("Booking error:", err.message);
      Alert.alert("Error", `Failed to create booking request: ${err.message}`);
    }
  };

  const resetToDefault = () => {
    alert(`Resetting to default selection for ${doctorName}.`);
    setSelectedSlot(null);
    setSelectedDay(null);
    setIsModalVisible(false);
    setNoteTitle("");
    setNoteDescription("");
  };

  const getActiveDaysCount = () => {
    return Object.values(availability).filter((day) => day.enabled).length;
  };

  const getTotalSelectedSlots = () => {
    return selectedSlot ? 1 : 0;
  };

  const dummyCounsellor = {
    fullName: "Bishnu Yadav",
    email: "binod@gmail.com",
    designation: "Professional Counsellor",
    chargePerHour: 1000,
    bio: "Experienced counsellor specializing in mental health support.",
    profilePhoto: { filename: "doctor1.png" },
    averageRating: 4.6, // Added for fallback display
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color="#007AFF"
            />
          </TouchableOpacity>
          <Text style={styles.title}>
            {counsellor?.fullName || doctorName || "Doctor"}
          </Text>
          <TouchableOpacity style={styles.resetButton} onPress={resetToDefault}>
            <MaterialCommunityIcons name="refresh" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Loading/Error States */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text>Loading counsellor...</Text>
          </View>
        ) : error ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchCounsellor}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
            <Text style={styles.fallbackText}>
              Showing sample data due to server error
            </Text>
            <View style={styles.profileSection}>
              <Image
                source={{
                  uri: `${API_BASE_URL}/Uploads/profile_photos/${dummyCounsellor.profilePhoto.filename}`,
                }}
                style={styles.imagePlaceholder}
              />
            </View>
            <View style={styles.detailsSection}>
              <View style={styles.detailCard}>
                <MaterialCommunityIcons
                  name="email"
                  size={20}
                  color="#007AFF"
                  style={styles.detailIcon}
                />
                <View>
                  <Text style={styles.detailLabel}>Email</Text>
                  <Text style={styles.detailText}>{dummyCounsellor.email}</Text>
                </View>
              </View>
              <View style={styles.detailCard}>
                <MaterialCommunityIcons
                  name="badge-account"
                  size={20}
                  color="#007AFF"
                  style={styles.detailIcon}
                />
                <View>
                  <Text style={styles.detailLabel}>Designation</Text>
                  <Text style={styles.detailText}>
                    {dummyCounsellor.designation}
                  </Text>
                </View>
              </View>
              <View style={styles.detailCard}>
                <MaterialCommunityIcons
                  name="currency-usd"
                  size={20}
                  color="#007AFF"
                  style={styles.detailIcon}
                />
                <View>
                  <Text style={styles.detailLabel}>Charge per Hour</Text>
                  <Text style={styles.detailText}>
                    Rs {dummyCounsellor.chargePerHour}
                  </Text>
                </View>
              </View>
              <View style={styles.detailCard}>
                <MaterialCommunityIcons
                  name="star"
                  size={20}
                  color="#FFD700"
                  style={styles.detailIcon}
                />
                <View>
                  <Text style={styles.detailLabel}>Average Rating</Text>
                  <Text style={styles.detailText}>
                    ★ {dummyCounsellor.averageRating}
                  </Text>
                </View>
              </View>
              {dummyCounsellor.bio && (
                <View style={styles.detailCard}>
                  <MaterialCommunityIcons
                    name="information"
                    size={20}
                    color="#007AFF"
                    style={styles.detailIcon}
                  />
                  <View>
                    <Text style={styles.detailLabel}>Bio</Text>
                    <Text style={styles.detailText}>{dummyCounsellor.bio}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        ) : counsellor ? (
          <>
            {/* Profile Image */}
            <View style={styles.profileSection}>
              <Image
                source={{
                  uri: counsellor.profilePhoto?.filename
                    ? `${API_BASE_URL}/Uploads/profile_photos/${counsellor.profilePhoto.filename}`
                    : "https://via.placeholder.com/120",
                }}
                style={styles.imagePlaceholder}
              />
            </View>

            {/* Counsellor Details */}
            <View style={styles.detailsSection}>
              <View style={styles.detailCard}>
                <MaterialCommunityIcons
                  name="email"
                  size={20}
                  color="#007AFF"
                  style={styles.detailIcon}
                />
                <View>
                  <Text style={styles.detailLabel}>Email</Text>
                  <Text style={styles.detailText}>{counsellor.email}</Text>
                </View>
              </View>
              <View style={styles.detailCard}>
                <MaterialCommunityIcons
                  name="badge-account"
                  size={20}
                  color="#007AFF"
                  style={styles.detailIcon}
                />
                <View>
                  <Text style={styles.detailLabel}>Designation</Text>
                  <Text style={styles.detailText}>
                    {counsellor.designation}
                  </Text>
                </View>
              </View>
               <View style={styles.detailCard}>
                <MaterialCommunityIcons
                  name="school"
                  size={20}
                  color="#007AFF"
                  style={styles.detailIcon}
                />
                <View>
                  <Text style={styles.detailLabel}>Qualification</Text>
                  <Text style={styles.detailText}>
                    {counsellor.qualification || "Not provided"}
                  </Text>
                </View>
              </View>
              <View style={styles.detailCard}>
                <MaterialCommunityIcons
                  name="currency-usd"
                  size={20}
                  color="#007AFF"
                  style={styles.detailIcon}
                />
                <View>
                  <Text style={styles.detailLabel}>Charge per Hour</Text>
                  <Text style={styles.detailText}>
                    Rs {counsellor.chargePerHour}
                  </Text>
                </View>
              </View>
              <View style={styles.detailCard}>
                <MaterialCommunityIcons
                  name="star"
                  size={20}
                  color="#FFD700"
                  style={styles.detailIcon}
                />
                <View>
                  <Text style={styles.detailLabel}>Average Rating</Text>
                  <Text style={styles.detailText}>
                    ★ {counsellor.averageRating || 0}
                  </Text>
                </View>
              </View>
              <View style={styles.detailCard}>
                <MaterialCommunityIcons
                  name="card-account-details"
                  size={20}
                  color="#007AFF"
                  style={styles.detailIcon}
                />
                <View>
                  <Text style={styles.detailLabel}>NMC No</Text>
                  <Text style={styles.detailText}>
                    {counsellor.nmcNo || "Not provided"}
                  </Text>
                </View>
              </View>
             
              {counsellor.bio && (
                <View style={styles.detailCard}>
                  <MaterialCommunityIcons
                    name="information"
                    size={20}
                    color="#007AFF"
                    style={styles.detailIcon}
                  />
                  <View>
                    <Text style={styles.detailLabel}>Bio</Text>
                    <Text style={styles.detailText}>{counsellor.bio}</Text>
                  </View>
                </View>
              )}
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
                  <MaterialCommunityIcons
                    name="calendar"
                    size={20}
                    color="#007AFF"
                  />
                  <Text style={styles.statNumber}>{getActiveDaysCount()}</Text>
                  <Text style={styles.statLabel}>Available Days</Text>
                </View>
                <View style={styles.statCard}>
                  <MaterialCommunityIcons
                    name="timer"
                    size={20}
                    color="#007AFF"
                  />
                  <Text style={styles.statNumber}>
                    {getTotalSelectedSlots()}
                  </Text>
                  <Text style={styles.statLabel}>Selected Hours</Text>
                </View>
                <View style={styles.statCard}>
                  <MaterialCommunityIcons
                    name="calendar-check"
                    size={20}
                    color="#007AFF"
                  />
                  <Text style={styles.statNumber}>
                    {getTotalSelectedSlots()}
                  </Text>
                  <Text style={styles.statLabel}>Selected Slots</Text>
                </View>
              </View>

              {/* Days List */}
              <View style={styles.daysContainer}>
                <Text style={styles.daysTitle}>Available Days:</Text>
                <View style={styles.daysGrid}>
                  {weekDays
                    .filter((day) => availability[day.id]?.enabled)
                    .map((day) => (
                      <DayCard
                        key={day.id}
                        day={day}
                        isSelected={selectedDay === day.id}
                        onToggle={toggleDay}
                        availableTimes={availability[day.id]?.slots}
                        selectedSlot={selectedSlot}
                        onTimeToggle={toggleTime}
                      />
                    ))}
                </View>
              </View>

              {/* Info Card */}
              <View style={styles.infoCard}>
                <View style={styles.infoIcon}>
                  <MaterialCommunityIcons
                    name="information"
                    size={20}
                    color="#007AFF"
                  />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>Booking Guidelines</Text>
                  <Text style={styles.infoText}>
                    • Select a day to view available time slots{"\n"}• Choose
                    one time slot for your appointment{"\n"}• Each time slot is
                    1 hour long{"\n"}• Provide notes and confirm to book the
                    appointment
                  </Text>
                </View>
              </View>

              {/* Book Button */}
              {selectedSlot && (
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.sendButton}
                    onPress={bookAppointment}
                  >
                    <MaterialCommunityIcons
                      name="calendar-plus"
                      size={20}
                      color="#fff"
                    />
                    <Text style={styles.sendButtonText}>Book Appointment</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Booking Form Modal */}
              <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setIsModalVisible(false)}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Appointment Notes</Text>
                    <TextInput
                      style={styles.noteTitleInput}
                      placeholder="Note Title (e.g., Session Topic)"
                      placeholderTextColor="#aaa"
                      value={noteTitle}
                      onChangeText={setNoteTitle}
                      maxLength={50}
                    />
                    <TextInput
                      style={styles.noteDescriptionInput}
                      placeholder="Note Description (e.g., Details about your needs)"
                      placeholderTextColor="#aaa"
                      value={noteDescription}
                      onChangeText={setNoteDescription}
                      multiline
                      numberOfLines={5}
                    />
                    <View style={styles.modalButtonContainer}>
                      <TouchableOpacity
                        style={[styles.modalButton, styles.cancelButton]}
                        onPress={() => {
                          setIsModalVisible(false);
                          setNoteTitle("");
                          setNoteDescription("");
                        }}
                      >
                        <Text style={styles.modalButtonText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.modalButton, styles.requestButton]}
                        onPress={requestBooking}
                      >
                        <Text style={styles.modalButtonText}>
                          Request Booking
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>
            </View>
          </>
        ) : (
          <View style={styles.loadingContainer}>
            <Text>No counsellor found</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f8",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    paddingTop: Platform.OS === "android" ? 35 : 10,
    backgroundColor: "#e0e7f0",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    flex: 1,
  },
  resetButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  profileSection: {
    alignItems: "center",
    marginVertical: 20,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#c0d8f0",
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  detailsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  detailCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(0, 122, 255, 0.1)",
  },
  detailIcon: {
    marginRight: 15,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  detailText: {
    fontSize: 16,
    color: "#555",
    fontWeight: "400",
  },
  availabilitySection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: "#666",
    fontWeight: "500",
    marginTop: 2,
  },
  daysContainer: {
    marginBottom: 16,
  },
  daysTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  dayCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    width: "100%",
  },
  dayCardActive: {
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dayName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  dayDate: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  toggleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  toggleButtonActive: {
    backgroundColor: "#007AFF",
  },
  timeSlotsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
  },
  periodSection: {
    marginBottom: 16,
  },
  periodTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  timeSlotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  timeSlotButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#d0e0f0",
    borderWidth: 1,
    borderColor: "transparent",
    minWidth: 80,
    alignItems: "center",
  },
  timeSlotButtonActive: {
    borderColor: "rgba(255, 255, 255, 0.3)",
    backgroundColor: "#007AFF",
  },
  timeSlotText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#333",
    marginBottom: 2,
  },
  timeSlotSubText: {
    fontSize: 9,
    color: "#666",
    fontWeight: "500",
  },
  timeSlotTextActive: {
    color: "#fff",
  },
  timeSlotSubTextActive: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "rgba(0, 122, 255, 0.05)",
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "rgba(0, 122, 255, 0.1)",
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    color: "#666",
    lineHeight: 18,
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  sendButton: {
    backgroundColor: "#003087",
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#003087",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 10,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  fallbackText: {
    color: "#666",
    fontSize: 12,
    marginBottom: 10,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  noteTitleInput: {
    backgroundColor: "#f0f4f8",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: "#333",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  noteDescriptionInput: {
    backgroundColor: "#f0f4f8",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: "#333",
    marginBottom: 20,
    height: 100,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#D32F2F",
  },
  requestButton: {
    backgroundColor: "#003087",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default DoctorProfile;
