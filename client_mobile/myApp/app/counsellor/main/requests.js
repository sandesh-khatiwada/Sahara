import React, { useState, useEffect, useRef } from 'react';
import {
  View, ScrollView, Text, StyleSheet, Image, TouchableOpacity, Alert,
  RefreshControl, Modal, SafeAreaView, Platform, ActivityIndicator, TextInput, KeyboardAvoidingView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';
import { useNavbar } from './_layout';

// Request Card Component
const RequestCard = ({ request, onAccept, onReject, onViewDetails, loadingAcceptId }) => (

  
  <View style={styles.requestCard}>
    <View style={styles.cardGlass}>
      <View style={styles.statusIndicator} />
      <View style={styles.requestHeader}>
        <View style={styles.clientInfo}>
          <View style={styles.clientAvatar}>
            <MaterialCommunityIcons name="account" size={24} color="#007AFF" />
          </View>
          <View style={styles.clientDetails}>
            <Text style={styles.clientName}>{request.clientName}</Text>
          </View>
        </View>
        <View style={styles.priorityBadge}>
          <MaterialCommunityIcons name="star" size={14} color="#FF9800" />
        </View>
      </View>

      <View style={styles.issueSection}>
        <View style={styles.issueTitleRow}>
          <MaterialCommunityIcons name="heart-pulse" size={18} color="#E91E63" />
          <Text style={styles.issueTitle}>{request.issue}</Text>
        </View>
        <Text style={styles.issueDescription} numberOfLines={3}>
          {request.description}
        </Text>
      </View>

      <View style={styles.scheduleSection}>
        <View style={styles.scheduleCard}>
          <View style={styles.scheduleItem}>
            <MaterialCommunityIcons name="calendar" size={16} color="#4CAF50" />
            <Text style={styles.scheduleText}>{request.preferredDate}</Text>
          </View>
          <View style={styles.scheduleItem}>
            <MaterialCommunityIcons name="clock-outline" size={16} color="#2196F3" />
            <Text style={styles.scheduleText}>{request.preferredTime}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>

        <TouchableOpacity style={styles.viewDetailsButton} onPress={() => onViewDetails(request)}>
          {/* <MaterialCommunityIcons name="eye" size={16} color="#007AFF" /> */}
          {/* <Text style={styles.viewDetailsButtonText}>View Details</Text> */}
        </TouchableOpacity>


        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.rejectButton} onPress={() => onReject(request.id)}>
            <MaterialCommunityIcons name="close" size={16} color="#fff" />
            <Text style={styles.rejectButtonText}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => onAccept(request.id)}
            disabled={loadingAcceptId === request.id}
          >
            {loadingAcceptId === request.id ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <MaterialCommunityIcons name="check" size={16} color="#fff" />
                <Text style={styles.acceptButtonText}>Accept</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </View>
);

// Decline Reason Modal
const DeclineModal = ({ visible, onClose, onSubmit, loading }) => {
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    if (!reason.trim()) {
      Alert.alert('Validation', 'Please provide a reason.');
      return;
    }
    onSubmit(reason.trim());
    setReason('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.declineModalContainer}>
          <Text style={styles.modalTitle}>Reason for Declining</Text>
          <TextInput
            style={styles.declineTextInput}
            multiline
            placeholder="Enter reason for declining this booking request"
            value={reason}
            onChangeText={setReason}
          />
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.modalRejectButton}
              onPress={() => {
                setReason('');
                onClose();
              }}
            >
              <Text style={styles.modalRejectButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalAcceptButton,
                { backgroundColor: reason.trim() ? '#4CAF50' : '#9E9E9E' },
              ]}
              disabled={!reason.trim() || loading}
              onPress={handleSubmit}
            >
              <Text style={styles.modalAcceptButtonText}>
                {loading ? 'Submitting...' : 'Submit'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default function BookingRequests() {
  const [requests, setRequests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [declineModalVisible, setDeclineModalVisible] = useState(false);
  const [declineLoading, setDeclineLoading] = useState(false);
  const [requestIdToDecline, setRequestIdToDecline] = useState(null);
  const [loadingAcceptId, setLoadingAcceptId] = useState(null);

  const { hideNavbar, showNavbar } = useNavbar();
  const scrollY = useRef(0);
  const scrollDirection = useRef(null);

  const handleScroll = (event) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const direction = currentScrollY > scrollY.current ? 'down' : 'up';
    if (direction !== scrollDirection.current) {
      scrollDirection.current = direction;
      if (direction === 'down' && currentScrollY > 50) hideNavbar();
      else if (direction === 'up' || currentScrollY < 50) showNavbar();
    }
    scrollY.current = currentScrollY;
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/counsellors/bookings-requests`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch booking requests');
      const data = await response.json();
      const formattedRequests = (data?.data || []).map((item) => ({
        id: item._id,
        clientName: item.user?.fullName || 'Unknown',
        issue: item.noteTitle || 'General Session',
        description: item.noteDescription || 'No description provided',
        preferredDate: item.date || 'N/A',
        preferredTime: item.time || 'N/A',
      }));
      setRequests(formattedRequests);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRequests();
  };

const handleAcceptRequest = async (requestId) => {
  try {
    setLoadingAcceptId(requestId);
    const token = await AsyncStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/counsellors/accept-booking`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: requestId }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data?.message || 'Failed to accept request.';
      Alert.alert('Error', errorMessage);
      return;
    }

    Alert.alert('Accepted', 'Client has been notified.');
    fetchRequests();
  } catch {
    Alert.alert('Error', 'Failed to accept request.');
  } finally {
    setLoadingAcceptId(null);
  }
};


  const handleDeclineRequest = async (reason) => {
    try {
      setDeclineLoading(true);
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/counsellors/decline-booking`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: requestIdToDecline, declineReason: reason }),
      });
      if (!response.ok) throw new Error('Failed to decline request');
      Alert.alert('Declined', 'Client has been notified.');
      setDeclineModalVisible(false);
      fetchRequests();
    } catch {
      Alert.alert('Error', 'Failed to decline request.');
    } finally {
      setDeclineLoading(false);
    }
  };

  const openDeclineModal = (requestId) => {
    setRequestIdToDecline(requestId);
    setDeclineModalVisible(true);
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setModalVisible(true);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <ScrollView
            style={styles.requestsList}
            contentContainerStyle={{ paddingBottom: 20 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {requests.length === 0 && (
              <Text style={styles.noRequestsText}>No booking requests at the moment.</Text>
            )}
            {requests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onAccept={handleAcceptRequest}
                onReject={openDeclineModal}
                onViewDetails={handleViewDetails}
                loadingAcceptId={loadingAcceptId}
              />
            ))}
          </ScrollView>
        </View>
        <DeclineModal
          visible={declineModalVisible}
          onClose={() => setDeclineModalVisible(false)}
          onSubmit={handleDeclineRequest}
          loading={declineLoading}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8ff',
    marginTop: 35,
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  gradientTop: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  gradientBottom: {
    flex: 1,
    backgroundColor: '#e3f2fd',
    opacity: 0.6,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerGlass: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTextContainer: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#003087',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
    fontWeight: '500',
  },
  headerRight: {
    marginLeft: 15,
  },
  counsellorAvatarContainer: {
    position: 'relative',
  },
  counsellorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
  },
  requestsList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  requestCard: {
    marginBottom: 16,
  },
  cardGlass: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  statusIndicator: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clientAvatar: {
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    padding: 8,
    marginRight: 12,
  },
  clientDetails: {},
  clientName: {
    fontWeight: '600',
    fontSize: 18,
    color: '#003087',
  },
  requestTime: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
    marginTop: 2,
  },
  priorityBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  issueSection: {
    marginTop: 12,
  },
  issueTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  issueTitle: {
    marginLeft: 8,
    fontWeight: '700',
    fontSize: 16,
    color: '#E91E63',
  },
  issueDescription: {
    marginTop: 6,
    fontSize: 14,
    color: '#444',
  },
  scheduleSection: {
    marginTop: 12,
  },
  scheduleCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 10,
    borderRadius: 12,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  scheduleIcon: {
    marginRight: 6,
  },
  scheduleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#004d40',
  },
  actions: {
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDetailsButtonText: {
    marginLeft: 6,
    color: '#007AFF',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginLeft: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '600',
  },
  rejectButton: {
    backgroundColor: '#E91E63',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',

  },
  rejectButtonText: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  emptyStateTitle: {
    fontSize: 24,
    color: '#999',
    marginTop: 12,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#aaa',
    marginTop: 6,
    maxWidth: 300,
    textAlign: 'center',
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#003087',
  },
  modalContent: {
    paddingHorizontal: 20,
  },
  modalSection: {
    marginTop: 20,
  },
  clientInfoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalClientName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#004d40',
  },
  modalRequestTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2196F3',
  },
  modalIssueTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 6,
    color: '#E91E63',
  },
  modalIssueDescription: {
    fontSize: 14,
    marginTop: 4,
    color: '#444',
  },
  modalSchedule: {
    marginTop: 10,
  },
  modalScheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  modalScheduleText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#004d40',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  modalAcceptButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 12,
  },
  modalAcceptButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  modalRejectButton: {
    backgroundColor: '#E91E63',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 12,
  },
  modalRejectButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: '700',
    color: '#F44336',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#F44336',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

  // Decline reason modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  declineModalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  declineTextInput: {
    height: 100,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginTop: 15,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#333',
  },
});

