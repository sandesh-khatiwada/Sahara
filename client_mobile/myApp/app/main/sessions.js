import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ScrollView,
  RefreshControl,
  Linking,
  Modal
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Camera } from 'expo-camera';
import { Audio } from 'expo-av';
import { API_BASE_URL } from '@env';
import { WebView } from 'react-native-webview';

// Star component for rating UI
const Star = ({ filled, onPress }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
    <Text style={{ fontSize: 32, color: filled ? '#FFD700' : '#ccc', marginHorizontal: 4 }}>
      ★
    </Text>
  </TouchableOpacity>
);

const Session = () => {
  const [activeTab, setActiveTab] = useState('Upcoming');
  const [appointments, setAppointments] = useState({ upcoming: [], pending: [], past: [] });
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [videoCallModalVisible, setVideoCallModalVisible] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [paymentLoadingMap, setPaymentLoadingMap] = useState({}); // Track loading per appointmentId

  // Handle deep links
  useEffect(() => {
    const handleDeepLink = async ({ url }) => {
      console.log('Deep link received:', url, 'at:', new Date().toISOString());
      try {
        if (url.includes('sahara://payment/success')) {
          console.log('Payment success deep link triggered');
          Alert.alert('Success', 'Payment completed successfully!');
          setPaymentLoadingMap({});
          fetchSessions();
        } else if (url.includes('sahara://payment/failure')) {
          console.log('Payment failure deep link triggered');
          Alert.alert(
            'Error',
            'Payment failed or was cancelled.',
            [
              { text: 'OK', onPress: () => setPaymentLoadingMap({}) },
              { text: 'Retry', onPress: () => initiatePayment(paymentLoadingMap.lastAppointmentId) },
            ]
          );
        } else {
          console.warn('Unhandled deep link:', url);
        }
      } catch (error) {
        console.error('Deep link handling error:', error);
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('Initial URL:', url);
        handleDeepLink({ url });
      }
    });

    return () => subscription.remove();
  }, []);

  const initiatePayment = async (appointmentId) => {
    try {
      setPaymentLoadingMap((prev) => ({ ...prev, [appointmentId]: true, lastAppointmentId: appointmentId }));
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        router.replace('/login');
        Alert.alert('Error', 'You need to be logged in to make a payment');
        return;
      }

      // Find the appointment to get chargePerHour
      const appointment = appointments.upcoming.find((appt) => appt.id === appointmentId);
      if (!appointment || !appointment.chargePerHour) {
        console.error('Appointment or chargePerHour not found:', appointmentId);
        Alert.alert('Error', 'Unable to fetch payment amount');
        return;
      }

      const startTime = new Date().toISOString();
      console.log('Initiating payment for appointment:', appointmentId, 'at', startTime);
      const response = await fetch(`${API_BASE_URL}/api/payments/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          appointmentId,
        }),
      });

      const json = await response.json();
      if (json.success) {
        console.log('Payment form URL received:', json.formUrl);
        await Linking.openURL(json.formUrl);
      } else {
        console.error('Payment initiation failed:', json.message);
        Alert.alert('Error', json.message || 'Failed to initiate payment');
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      Alert.alert('Error', 'Failed to initiate payment: ' + error.message);
    } finally {
      setPaymentLoadingMap((prev) => ({ ...prev, [appointmentId]: false }));
    }
  };

  // Request camera and microphone permissions
  useEffect(() => {
    const requestPermissions = async () => {
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      const { status: audioStatus } = await Audio.requestPermissionsAsync();
      if (cameraStatus !== 'granted' || audioStatus !== 'granted') {
        Alert.alert(
          'Permissions Required',
          'Camera and microphone permissions are needed for video calls.',
          [{ text: 'OK', onPress: () => {} }]
        );
      }
    };
    requestPermissions();
  }, []);

  const fetchSessions = async () => {
    try {
      if (!refreshing) setLoading(true);
      setError(null);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        router.replace('/login');
        throw new Error('User token not found. Please log in again.');
      }

      const sessionsRes = await fetch(`${API_BASE_URL}/api/users/sessions`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const sessionsJson = await sessionsRes.json();

      const pendingRes = await fetch(`${API_BASE_URL}/api/users/pending-appointments`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const pendingJson = await pendingRes.json();

      if (!sessionsJson.success) throw new Error(sessionsJson.message || 'Failed to load sessions');
      if (!pendingJson.success) throw new Error(pendingJson.message || 'Failed to load pending');

      const mappedAppointments = {
        upcoming: [],
        pending: [],
        past: sessionsJson.pastAppointments.map((appt) => ({
          id: appt._id,
          doctorName: appt.counsellor.fullName,
          date: appt.date,
          time: appt.time,
          status: 'completed',
          feedback: appt.feedback || null,
          rating: appt.rating || null,
          profilePhoto: appt.counsellor.profilePhoto?.filename || 'default.jpg',
        })),
      };

      sessionsJson.upcomingAppointments.forEach((appt) => {
        const appointment = {
          id: appt._id,
          doctorName: appt.counsellor.fullName,
          date: appt.date,
          time: appt.time,
          status: appt.status === 'accepted' ? 'confirmed' : appt.status,
          paymentPending: appt.paymentStatus === 'pending',
          chargePerHour: appt.counsellor.chargePerHour,
          profilePhoto: appt.counsellor.profilePhoto?.filename || 'default.jpg',
        };
        const now = new Date();
        const timeDiff = Math.abs(new Date(appt.dateTime) - now) / 1000 / 60;
        if (timeDiff <= 3000000000 && appt.status === 'accepted' && appt.paymentStatus === 'completed') {
          appointment.status = 'happeningNow';
        }

        mappedAppointments.upcoming.push(appointment);
      });

      mappedAppointments.pending = pendingJson.data.map((appt) => ({
        id: appt._id,
        doctorName: appt.counsellor.fullName,
        date: appt.date,
        time: appt.time,
        status: 'pending',
        profilePhoto: appt.counsellor.profilePhoto?.filename || 'default.jpg',
      }));

      mappedAppointments.upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
      mappedAppointments.pending.sort((a, b) => new Date(a.date) - new Date(b.date));
      mappedAppointments.past.sort((a, b) => new Date(b.date) - new Date(b.date));
      setAppointments(mappedAppointments);
    } catch (err) {
      setError(`Failed to fetch sessions: ${err.message}`);
      Alert.alert('Error', `Failed to fetch sessions: ${err.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSessions();
  };

  const openFeedbackModal = (appointment) => {
    setSelectedAppointment(appointment);
    setFeedbackText(appointment.feedback || '');
    setRating(appointment.rating || 0);
    setFeedbackModalVisible(true);
  };

  const submitFeedback = async () => {
    if (feedbackText.trim() === '') return Alert.alert('Validation', 'Please enter your feedback.');
    if (rating === 0) return Alert.alert('Validation', 'Please provide a rating.');

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        router.replace('/login');
        throw new Error('User not authenticated');
      }

      const res = await fetch(`${API_BASE_URL}/api/users/session-feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionId: selectedAppointment.id,
          feedback: feedbackText,
          rating,
        }),
      });

      const json = await res.json();

      if (json.success) {
        Alert.alert('Success', 'Feedback submitted successfully!');
        setAppointments((prev) => ({
          ...prev,
          past: prev.past.map((appt) =>
            appt.id === selectedAppointment.id
              ? { ...appt, feedback: feedbackText, rating }
              : appt
          ),
        }));
        setFeedbackModalVisible(false);
        setSelectedAppointment(null);
        setFeedbackText('');
        setRating(0);
      } else {
        Alert.alert('Error', json.message || 'Failed to submit feedback.');
      }
    } catch (error) {
      console.error('Feedback submission error:', error);
      Alert.alert('Error', 'An error occurred while submitting feedback.');
    }
  };

  const openVideoCallModal = async (sessionId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        router.replace('/login');
        Alert.alert('Error', 'You need to be logged in to join the call');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/users/user-joined`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionId: sessionId,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to join session');
      }

      setSelectedSessionId(sessionId);
      setVideoCallModalVisible(true);
    } catch (error) {
      console.error('Error joining session:', error);
      Alert.alert('Error', error.message || 'Failed to join the session');
    }
  };

  const renderUpcomingAppointment = (app) => (
    <View key={app.id} style={styles.appointmentCard}>
      <View style={styles.appointmentHeader}>
        <View style={styles.rowLeft}>
          <Image
            source={{
              uri: `${API_BASE_URL}/Uploads/profile_photos/${app.profilePhoto}`,
            }}
            style={styles.avatar}
          />
          <Text style={styles.doctorName}>Dr. {app.doctorName}</Text>
        </View>
        <Text
          style={
            app.status === 'happeningNow' ? styles.statusHappening : styles.statusConfirmed
          }
        >
          {app.status === 'happeningNow' ? 'Happening Now' : 'Confirmed'}
        </Text>
      </View>
      <Text style={styles.dateText}>
        {app.date} {app.time}
      </Text>
       
      {app.status === 'happeningNow' && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openVideoCallModal(app.id)}
        >
          <Text style={styles.buttonText}>Join Call</Text>
        </TouchableOpacity>
      )}
      {app.status === 'confirmed' && app.paymentPending && (
        <TouchableOpacity
          style={[styles.actionButton, paymentLoadingMap[app.id] && styles.disabledButton]}
          onPress={() => initiatePayment(app.id)}
          disabled={paymentLoadingMap[app.id]}
        >
          <Text style={styles.buttonText}>
            {paymentLoadingMap[app.id] ? 'Initiating Payment...' : 'Make Payment'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderPendingAppointment = (app) => (
    <View key={app.id} style={styles.appointmentCard}>
      <View style={styles.appointmentHeader}>
        <View style={styles.rowLeft}>
          <Image
            source={{
              uri: `${API_BASE_URL}/Uploads/profile_photos/${app.profilePhoto}`,
            }}
            style={styles.avatar}
          />
          <Text style={styles.doctorName}>Dr. {app.doctorName}</Text>
        </View>
        <Text style={styles.statusPending}>Pending</Text>
      </View>
      <Text style={styles.dateText}>
        {app.date} {app.time}
      </Text>
      <Text style={styles.awaitingText}>Awaiting Confirmation</Text>
    </View>
  );

  const renderPastAppointment = (app) => (
    <View key={app.id} style={styles.appointmentCard}>
      <View style={styles.appointmentHeader}>
        <View style={styles.rowLeft}>
          <Image
            source={{
              uri: `${API_BASE_URL}/Uploads/profile_photos/${app.profilePhoto}`,
            }}
            style={styles.avatar}
          />
          <Text style={styles.doctorName}>Dr. {app.doctorName}</Text>
        </View>
      </View>
      <Text style={styles.dateText}>
        {app.date} {app.time}
      </Text>
      {!app.feedback ? (
        <TouchableOpacity
          style={styles.feedbackButton}
          onPress={() => openFeedbackModal(app)}
        >
          <Text style={styles.buttonText}>Leave Feedback</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackText}>Feedback: {app.feedback}</Text>
          {app.rating !== null && (
            <Text style={styles.ratingText}>
              Rating: {Array.from({ length: 5 }).map((_, i) => (
                <Text key={i} style={{ color: i < Math.round(app.rating) ? '#FFD700' : '#ccc' }}>
                  ★
                </Text>
              ))} ({app.rating})
            </Text>
          )}
        </View>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#E3F2FD' }}>
      {/* Feedback Modal */}
      <Modal
        transparent
        visible={feedbackModalVisible}
        onRequestClose={() => setFeedbackModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Leave Feedback</Text>
            <Text style={{ fontWeight: 'bold', marginBottom: 8, color: '#003087' }}>
              Rating
            </Text>
            <View style={styles.starContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  filled={star <= rating}
                  onPress={() => setRating(star)}
                />
              ))}
            </View>
            <TextInput
              multiline
              placeholder="Write your feedback..."
              value={feedbackText}
              onChangeText={setFeedbackText}
              style={styles.feedbackInput}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#757575' }]}
                onPress={() => setFeedbackModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={submitFeedback}>
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Video Call Modal */}
      <Modal
        transparent={false}
        visible={videoCallModalVisible}
        onRequestClose={() => setVideoCallModalVisible(false)}
        animationType="slide"
      >
        <View style={styles.videoCallModalContainer}>
          <View style={styles.videoCallHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setVideoCallModalVisible(false)}
            >
              <MaterialCommunityIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.videoCallTitle}>Video Call</Text>
          </View>
          {selectedSessionId ? (
            <WebView
              source={{ uri: `https://meet.systemli.org/${selectedSessionId}#config.requireDisplayName=false&config.startWithVideoMuted=true` }}
              style={styles.webview}
              javaScriptEnabled={true}
              allowsInlineMediaPlayback={true}
              mediaPlaybackRequiresUserAction={false}
              onError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                console.error('Video call WebView error:', nativeEvent);
                Alert.alert('Error', 'Failed to load video call. Please try again.');
              }}
            />
          ) : (
            <View style={styles.loading}>
              <Text style={styles.loadingText}>Loading video call...</Text>
            </View>
          )}
        </View>
      </Modal>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sessions</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('Upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'Upcoming' && styles.activeTabText]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Past' && styles.activeTab]}
          onPress={() => setActiveTab('Past')}
        >
          <Text style={[styles.tabText, activeTab === 'Past' && styles.activeTabText]}>
            Past
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading sessions...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchSessions}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {activeTab === 'Upcoming' ? (
              <ScrollView
                contentContainerStyle={styles.scrollContainer}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              >
                <Text style={styles.sectionTitle}>Upcoming</Text>
                {appointments.upcoming.length > 0 ? (
                  appointments.upcoming.map(renderUpcomingAppointment)
                ) : (
                  <Text style={styles.noDataText}>You don't have any upcoming sessions</Text>
                )}

                <Text style={styles.sectionTitle}>Pending Appointments</Text>
                {appointments.pending.length > 0 ? (
                  appointments.pending.map(renderPendingAppointment)
                ) : (
                  <Text style={styles.noDataText}>No pending appointments</Text>
                )}
              </ScrollView>
            ) : (
              <ScrollView
                contentContainerStyle={styles.scrollContainer}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              >
                <Text style={styles.sectionTitle}>Past</Text>
                {appointments.past.length > 0 ? (
                  appointments.past.map(renderPastAppointment)
                ) : (
                  <Text style={styles.noDataText}>You don't have any past sessions</Text>
                )}
              </ScrollView>
            )}
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3F2FD',
  },
  contentContainer: {
    padding: 10,
    height: 90,
    margin: 20,
  },
  header: {
    marginTop: 37,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#003087',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#fff',
    elevation: 1,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    color: '#000',
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#003087',
  },
  appointmentCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    gap: 10,
  },
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#003087',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  statusHappening: {
    padding: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: '#e6f3fa',
    color: '#1a73e8',
    textAlign: 'center',
  },
  statusConfirmed: {
    padding: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: '#d4edda',
    color: '#155724',
    textAlign: 'center',
  },
  statusPending: {
    padding: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: '#fff3cd',
    color: '#856404',
    textAlign: 'center',
  },
  awaitingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#fff3cd',
    textAlign: 'center',
    alignSelf: 'center',
    minWidth: 280,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'center',
    minWidth: 280,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  feedbackButton: {
    backgroundColor: '#757575',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'center',
    minWidth: 280,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  feedbackContainer: {
    gap: 5,
  },
  feedbackText: {
    fontSize: 14,
    color: '#28a745',
  },
  ratingText: {
    fontSize: 14,
    color: '#FFD700',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#003087',
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
    backgroundColor: '#003087',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  noDataText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginVertical: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#003087',
  },
  modalText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  feedbackInput: {
    height: 100,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    borderRadius: 10,
  },
  scrollContainer: {
    padding: 10,
    paddingBottom: 100,
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  videoCallModalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoCallHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#007AFF',
  },
  videoCallTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  closeButton: {
    padding: 5,
  },
  webview: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
});

export default Session;