import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';
import { useNavbar } from './_layout';

// Sample data - replace with API calls
const sampleRequests = [
  {
    id: '1',
    clientName: 'Aayusha Karki',
    clientAge: 24,
    issue: 'Anxiety and Stress Management',
    description: 'I have been experiencing severe anxiety and stress due to work pressure. I would like to discuss coping strategies and get professional help.',
    preferredDate: '2024-01-15',
    preferredTime: '10:00 AM',
    requestedAt: '2 hours ago',
    status: 'pending'
  },
  {
    id: '2',
    clientName: 'John Doe',
    clientAge: 28,
    issue: 'Depression Support',
    description: 'I have been feeling low and unmotivated for the past few weeks. I think I need professional help to understand what I am going through.',
    preferredDate: '2024-01-16',
    preferredTime: '2:00 PM',
    requestedAt: '4 hours ago',
    status: 'pending'
  },
  {
    id: '3',
    clientName: 'Sarah Miller',
    clientAge: 22,
    issue: 'Relationship Issues',
    description: 'I am having trouble with my relationships and would like to work on communication skills and understanding boundaries.',
    preferredDate: '2024-01-17',
    preferredTime: '11:30 AM',
    requestedAt: '1 day ago',
    status: 'pending'
  },
];

const RequestCard = ({ request, onAccept, onReject, onViewDetails }) => {
  return (
    <View style={styles.requestCard}>
      <View style={styles.cardGlass}>
        {/* Status Indicator */}
        <View style={styles.statusIndicator} />
        
        {/* Header with Client Info */}
        <View style={styles.requestHeader}>
          <View style={styles.clientInfo}>
            <View style={styles.clientAvatar}>
              <MaterialCommunityIcons name="account" size={24} color="#007AFF" />
            </View>
            <View style={styles.clientDetails}>
              <Text style={styles.clientName}>{request.clientName}</Text>
              <Text style={styles.requestTime}>{request.requestedAt}</Text>
            </View>
          </View>
          <View style={styles.priorityBadge}>
            <MaterialCommunityIcons name="star" size={14} color="#FF9800" />
          </View>
        </View>

        {/* Issue Section */}
        <View style={styles.issueSection}>
          <View style={styles.issueTitleRow}>
            <MaterialCommunityIcons name="heart-pulse" size={18} color="#E91E63" />
            <Text style={styles.issueTitle}>{request.issue}</Text>
          </View>
          <Text style={styles.issueDescription} numberOfLines={3}>
            {request.description}
          </Text>
        </View>

        {/* Schedule Section */}
        <View style={styles.scheduleSection}>
          <View style={styles.scheduleCard}>
            <View style={styles.scheduleItem}>
              <View style={styles.scheduleIcon}>
                <MaterialCommunityIcons name="calendar" size={16} color="#4CAF50" />
              </View>
              <Text style={styles.scheduleText}>{request.preferredDate}</Text>
            </View>
            <View style={styles.scheduleItem}>
              <View style={styles.scheduleIcon}>
                <MaterialCommunityIcons name="clock-outline" size={16} color="#2196F3" />
              </View>
              <Text style={styles.scheduleText}>{request.preferredTime}</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.viewDetailsButton} 
            onPress={() => onViewDetails(request)}
          >
            <MaterialCommunityIcons name="eye" size={16} color="#007AFF" />
            <Text style={styles.viewDetailsButtonText}>View Details</Text>
          </TouchableOpacity>
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.rejectButton} 
              onPress={() => onReject(request.id)}
            >
              <MaterialCommunityIcons name="close" size={16} color="#fff" />
              <Text style={styles.rejectButtonText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.acceptButton} 
              onPress={() => onAccept(request.id)}
            >
              <MaterialCommunityIcons name="check" size={16} color="#fff" />
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
    
  );
};

const RequestDetailsModal = ({ visible, request, onClose, onAccept, onReject }) => {
  if (!request) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Session Request Details</Text>
          <TouchableOpacity onPress={onClose}>
            <MaterialCommunityIcons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {/* Client Info */}
          <View style={styles.modalSection}>
            <View style={styles.clientInfoSection}>
              <View>
                <Text style={styles.modalClientName}>{request.clientName}</Text>
                <Text style={styles.modalRequestTime}>Requested {request.requestedAt}</Text>
              </View>
            </View>
          </View>

          {/* Issue Details */}
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>Issue</Text>
            <Text style={styles.modalIssueTitle}>{request.issue}</Text>
            <Text style={styles.modalIssueDescription}>{request.description}</Text>
          </View>

          {/* Preferred Schedule */}
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>Preferred Schedule</Text>
            <View style={styles.modalSchedule}>
              <View style={styles.modalScheduleItem}>
                <MaterialCommunityIcons name="calendar" size={20} color="#007AFF" />
                <Text style={styles.modalScheduleText}>{request.preferredDate}</Text>
              </View>
              <View style={styles.modalScheduleItem}>
                <MaterialCommunityIcons name="clock-outline" size={20} color="#007AFF" />
                <Text style={styles.modalScheduleText}>{request.preferredTime}</Text>
              </View>
            </View>
          </View>
          
        </ScrollView>

        {/* Modal Actions */}
        <View style={styles.modalActions}>
          <TouchableOpacity 
            style={styles.modalRejectButton}
            onPress={() => {
              onReject(request.id);
              onClose();
            }}
          >
            <Text style={styles.modalRejectButtonText}>Decline Request</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.modalAcceptButton}
            onPress={() => {
              onAccept(request.id);
              onClose();
            }}
          >
            <Text style={styles.modalAcceptButtonText}>Accept</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default function BookingRequests() {
  const [requests, setRequests] = useState(sampleRequests);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { hideNavbar, showNavbar } = useNavbar();
  const scrollY = useRef(0);
  const scrollDirection = useRef(null);

  const handleScroll = (event) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const direction = currentScrollY > scrollY.current ? 'down' : 'up';
    
    if (direction !== scrollDirection.current) {
      scrollDirection.current = direction;
      
      if (direction === 'down' && currentScrollY > 50) {
        hideNavbar();
      } else if (direction === 'up' || currentScrollY < 50) {
        showNavbar();
      }
    }
    
    scrollY.current = currentScrollY;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Fetch new requests from API
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleAcceptRequest = async (requestId, message = '') => {
    try {
      // API call to accept request
      Alert.alert('Success', 'Request accepted successfully. The client has been notified.');
      setRequests(requests.filter(req => req.id !== requestId));
    } catch (error) {
      Alert.alert('Error', 'Failed to accept request. Please try again.');
    }
  };

  const handleRejectRequest = async (requestId, message = '') => {
    try {
      // API call to reject request
      Alert.alert('Request Declined', 'The client has been notified about the declined request.');
      setRequests(requests.filter(req => req.id !== requestId));
    } catch (error) {
      Alert.alert('Error', 'Failed to decline request. Please try again.');
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setModalVisible(true);
  };

  if (error) {
    return (
      <View style={styles.container}>
        {/* Gradient Background for non-web platforms */}
        {Platform.OS !== 'web' && (
          <View style={styles.gradientBackground}>
            <View style={styles.gradientTop} />
            <View style={styles.gradientBottom} />
          </View>
        )}
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons name="alert-circle" size={48} color="#F44336" />
            <Text style={styles.errorText}>Something went wrong</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => setError(null)}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Gradient Background for non-web platforms */}
      {Platform.OS !== 'web' && (
        <View style={styles.gradientBackground}>
          <View style={styles.gradientTop} />
          <View style={styles.gradientBottom} />
        </View>
      )}
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerGlass}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <View style={styles.headerTitleContainer}>
                <MaterialCommunityIcons name="calendar-clock" size={28} color="#007AFF" />
                <View style={styles.headerTextContainer}>
                  <Text style={styles.headerTitle}>Booking Requests</Text>
                  <Text style={styles.headerSubtitle}>{requests.length} pending appointments</Text>
                </View>
              </View>
            </View>
            <View style={styles.headerRight}>
              <View style={styles.counsellorAvatarContainer}>
                <Image 
                  source={{ uri: 'https://randomuser.me/api/portraits/women/44.jpg' }} 
                  style={styles.counsellorAvatar} 
                />
                <View style={styles.onlineIndicator} />
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Requests List */}
      <ScrollView 
        style={styles.requestsList}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {requests.length > 0 ? (
          requests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onAccept={handleAcceptRequest}
              onReject={handleRejectRequest}
              onViewDetails={handleViewDetails}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="calendar-check" size={64} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No requests found</Text>
            <Text style={styles.emptyStateSubtitle}>
              You have no pending booking requests at the moment.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Request Details Modal */}
      <RequestDetailsModal
        visible={modalVisible}
        request={selectedRequest}
        onClose={() => setModalVisible(false)}
        onAccept={handleAcceptRequest}
        onReject={handleRejectRequest}
      />
      </View>
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
  
  // Header Styles with Enhanced Design
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
  
  // Request Card Styles with Enhanced Design
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
    top: 0,
    left: 0,
    width: 4,
    height: '100%',
    backgroundColor: '#007AFF',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  
  // Client Info Section
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  clientInfo: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  clientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'rgba(0, 122, 255, 0.2)',
  },
  clientDetails: {
    flex: 1,
  },
  clientName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#061B36',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  requestTime: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
  },
  priorityBadge: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 152, 0, 0.2)',
  },
  
  // Issue Section
  issueSection: {
    marginBottom: 18,
    backgroundColor: 'rgba(233, 30, 99, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(233, 30, 99, 0.1)',
  },
  issueTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  issueTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#061B36',
    marginLeft: 8,
    letterSpacing: -0.2,
  },
  issueDescription: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    fontWeight: '400',
  },
  
  // Schedule Section
  scheduleSection: {
    marginBottom: 20,
  },
  scheduleCard: {
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.1)',
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scheduleIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  scheduleText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
  },
  
  // Actions Section
  actions: {
    gap: 12,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.2)',
  },
  viewDetailsButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  rejectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#F44336',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  rejectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  
  // Empty State Styles
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 20,
    margin: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginTop: 20,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
    lineHeight: 22,
  },
  
  // Error State Styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Modal Styles with Glass Morphism
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(248, 250, 254, 0.95)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(20px)',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#061B36',
    letterSpacing: -0.5,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalSection: {
    backgroundColor: 'rgba(255, 255, 255, 1)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    backdropFilter: 'blur(20px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  clientInfoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalClientName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#061B36',
    letterSpacing: -0.5,
  },
  modalRequestTime: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
    fontWeight: '500',
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#061B36',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  modalIssueTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#061B36',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  modalIssueDescription: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },
  modalSchedule: {
    flexDirection: 'row',
    gap: 20,
  },
  modalScheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.2)',
  },
  modalScheduleText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 8,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
  },
  modalRejectButton: {
    flex: 1,
    backgroundColor: '#F44336',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#F44336',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modalRejectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  modalAcceptButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modalAcceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
