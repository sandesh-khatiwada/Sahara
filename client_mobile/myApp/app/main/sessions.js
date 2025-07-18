import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Modal, TextInput, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';

const Session = () => {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState('Upcoming');

  const [appointments, setAppointments] = useState({ upcoming: [], pending: [], past: [] });

  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');

  useEffect(() => {
    const dummyData = {
      upcoming: [
        { id: 1, doctorName: 'Nannathya Regmi', date: new Date('2025-08-12T14:00:00+0545'), status: 'happeningNow' },
        { id: 2, doctorName: 'Nannathya Regmi', date: new Date('2025-08-26T14:00:00+0545'), status: 'confirmed', paymentPending: true },
      ],
      pending: [
        { id: 3, doctorName: 'Swikriti Timilsena', date: new Date('2025-08-29T20:00:00+0545'), status: 'pending' },
      ],
      past: [
        { id: 4, doctorName: 'Nannathya Regmi', date: new Date('2025-07-10T14:00:00+0545'), status: 'completed', feedback: null },
        { id: 5, doctorName: 'John Doe', date: new Date('2025-07-05T10:00:00+0545'), status: 'completed', feedback: 'Great session!' },
      ],
    };
    setAppointments(dummyData);
  }, []);

  const openFeedbackModal = (appointment) => {
    setSelectedAppointment(appointment);
    setFeedbackText('');
    setFeedbackModalVisible(true);
  };

  const submitFeedback = () => {
    if (feedbackText.trim() === '') return Alert.alert('Please enter feedback');
    setAppointments((prev) => ({
      ...prev,
      past: prev.past.map((appt) =>
        appt.id === selectedAppointment.id ? { ...appt, feedback: feedbackText } : appt
      ),
    }));
    setFeedbackModalVisible(false);
    setSelectedAppointment(null);
  };

  const renderFeedback = (appointment) => {
    if (!appointment.feedback) {
      return (
        <TouchableOpacity style={styles.feedbackButton} onPress={() => openFeedbackModal(appointment)}>
          <Text style={styles.buttonText}>Leave Feedback</Text>
        </TouchableOpacity>
      );
    }
    return <Text style={styles.feedbackText}>Feedback: {appointment.feedback}</Text>;
  };

  const renderUpcomingAppointment = (app) => (
    <View key={app.id} style={styles.appointmentCard}>
      <View style={styles.appointmentHeader}>
        <View style={styles.rowLeft}>
          <Image source={require('../../assets/image/doctor1.png')} style={styles.avatar} />
          <Text style={styles.doctorName}>Dr. {app.doctorName}</Text>
        </View>
        <Text style={app.status === 'happeningNow' ? styles.statusHappening : styles.statusConfirmed}>
          {app.status === 'happeningNow' ? 'Happening Now' : 'Confirmed'}
        </Text>
      </View>
      <Text style={styles.dateText}>{app.date.toLocaleString()}</Text>
      {app.status === 'happeningNow' && (
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.buttonText}>Join Call</Text>
        </TouchableOpacity>
      )}
      {app.status === 'confirmed' && app.paymentPending && (
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.buttonText}>Make Payment</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderPendingAppointment = (app) => (
    <View key={app.id} style={styles.appointmentCard}>
      <View style={styles.appointmentHeader}>
        <View style={styles.rowLeft}>
          <Image source={require('../../assets/image/doctor1.png')} style={styles.avatar} />
          <Text style={styles.doctorName}>Dr. {app.doctorName}</Text>
        </View>
        <Text style={styles.statusPending}>Pending</Text>
      </View>
      <Text style={styles.dateText}>{app.date.toLocaleString()}</Text>
      <Text style={styles.awaitingText}>Awaiting Confirmation</Text>
    </View>
  );

  const renderPastAppointment = (app) => (
    <View key={app.id} style={styles.appointmentCard}>
      <View style={styles.appointmentHeader}>
        <View style={styles.rowLeft}>
          <Image source={require('../../assets/image/doctor1.png')} style={styles.avatar} />
          <Text style={styles.doctorName}>Dr. {app.doctorName}</Text>
        </View>
      </View>
      <Text style={styles.dateText}>{app.date.toLocaleString()}</Text>
      {renderFeedback(app)}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Feedback Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={feedbackModalVisible}
        onRequestClose={() => setFeedbackModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Leave Feedback</Text>
            <TextInput
              multiline
              placeholder="Write your feedback..."
              value={feedbackText}
              onChangeText={setFeedbackText}
              style={styles.feedbackInput}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#757575' }]} onPress={() => setFeedbackModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={submitFeedback}>
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sessions</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('Upcoming')}
        >
          <Text style={styles.tabText}>Upcoming</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Past' && styles.activeTab]}
          onPress={() => setActiveTab('Past')}
        >
          <Text style={styles.tabText}>Past</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.contentContainer}>
        {activeTab === 'Upcoming' ? (
          <>
            <Text style={styles.sectionTitle}>Upcoming</Text>
            {appointments.upcoming.map(renderUpcomingAppointment)}
            <Text style={styles.sectionTitle}>Pending Appointments</Text>
            {appointments.pending.map(renderPendingAppointment)}
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Past</Text>
            {appointments.past.map(renderPastAppointment)}
          </>
        )}
      </View>
    </View>
  );
};

export default Session;

// ===========================
// ✅ StyleSheet
// ===========================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3F2FD',
  },
  contentContainer: {
    padding: 10,
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
  feedbackText: {
    fontSize: 14,
    color: '#28a745',
  },
  // Modal styles
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
});
