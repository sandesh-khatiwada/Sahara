import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';

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
    urgency: 'Medium',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
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
    urgency: 'High',
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
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
    urgency: 'Low',
    avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
    requestedAt: '1 day ago',
    status: 'pending'
  },
];

const RequestCard = ({ request, onAccept, onReject, onViewDetails }) => {
  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'High': return '#F44336';
      case 'Medium': return '#FF9800';
      case 'Low': return '#4CAF50';
      default: return '#666';
    }
  };

  return (
    <View style={styles.requestCard}>
      {/* Header */}
      <View style={styles.requestHeader}>
        <View style={styles.clientInfo}>
          <Image source={{ uri: request.avatar }} style={styles.avatar} />
          <View style={styles.clientDetails}>
            <Text style={styles.clientName}>{request.clientName}</Text>
            <Text style={styles.clientAge}>Age: {request.clientAge}</Text>
            <Text style={styles.requestTime}>{request.requestedAt}</Text>
          </View>
        </View>
        <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(request.urgency) }]}>
          <Text style={styles.urgencyText}>{request.urgency}</Text>
        </View>
      </View>

      {/* Issue */}
      <View style={styles.issueSection}>
        <Text style={styles.issueTitle}>{request.issue}</Text>
        <Text style={styles.issueDescription} numberOfLines={2}>
          {request.description}
        </Text>
      </View>

      {/* Preferred Schedule */}
      <View style={styles.scheduleSection}>
        <View style={styles.scheduleItem}>
          <MaterialCommunityIcons name="calendar" size={16} color="#666" />
          <Text style={styles.scheduleText}>{request.preferredDate}</Text>
        </View>
        <View style={styles.scheduleItem}>
          <MaterialCommunityIcons name="clock-outline" size={16} color="#666" />
          <Text style={styles.scheduleText}>{request.preferredTime}</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.detailsButton} onPress={() => onViewDetails(request)}>
          <Text style={styles.detailsButtonText}>View Details</Text>
        </TouchableOpacity>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.rejectButton} 
            onPress={() => onReject(request.id)}
          >
            <MaterialCommunityIcons name="close" size={18} color="#fff" />
            <Text style={styles.rejectButtonText}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.acceptButton} 
            onPress={() => onAccept(request.id)}
          >
            <MaterialCommunityIcons name="check" size={18} color="#fff" />
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const RequestDetailsModal = ({ visible, request, onClose, onAccept, onReject }) => {
  const [responseMessage, setResponseMessage] = useState('');

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
              <Image source={{ uri: request.avatar }} style={styles.modalAvatar} />
              <View>
                <Text style={styles.modalClientName}>{request.clientName}</Text>
                <Text style={styles.modalClientAge}>Age: {request.clientAge}</Text>
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

          {/* Response Message */}
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>Response Message (Optional)</Text>
            <TextInput
              style={styles.responseInput}
              placeholder="Add a personal message for the client..."
              multiline
              numberOfLines={4}
              value={responseMessage}
              onChangeText={setResponseMessage}
            />
          </View>
        </ScrollView>

        {/* Modal Actions */}
        <View style={styles.modalActions}>
          <TouchableOpacity 
            style={styles.modalRejectButton}
            onPress={() => {
              onReject(request.id, responseMessage);
              onClose();
            }}
          >
            <Text style={styles.modalRejectButtonText}>Decline Request</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.modalAcceptButton}
            onPress={() => {
              onAccept(request.id, responseMessage);
              onClose();
            }}
          >
            <Text style={styles.modalAcceptButtonText}>Accept & Schedule</Text>
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
  const [filter, setFilter] = useState('all'); // all, high, medium, low
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const filteredRequests = requests.filter(request => {
    if (filter === 'all') return true;
    return request.urgency.toLowerCase() === filter;
  });

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={48} color="#F44336" />
          <Text style={styles.errorText}>Something went wrong</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => setError(null)}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Booking Requests</Text>
        <Text style={styles.headerSubtitle}>{requests.length} pending requests</Text>
      </View>

      {/* Filter */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['all', 'high', 'medium', 'low'].map((filterOption) => (
            <TouchableOpacity
              key={filterOption}
              style={[
                styles.filterButton,
                filter === filterOption && styles.activeFilterButton
              ]}
              onPress={() => setFilter(filterOption)}
            >
              <Text style={[
                styles.filterButtonText,
                filter === filterOption && styles.activeFilterButtonText
              ]}>
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                {filterOption === 'all' ? ` (${requests.length})` : 
                 ` (${requests.filter(r => r.urgency.toLowerCase() === filterOption).length})`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Requests List */}
      <ScrollView 
        style={styles.requestsList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredRequests.length > 0 ? (
          filteredRequests.map((request) => (
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
              {filter === 'all' 
                ? 'You have no pending booking requests at the moment.'
                : `No ${filter} priority requests found.`}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    marginTop: 35,
  },
  content: {
    flex: 1,
  },
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
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#003087',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 10,
  },
  activeFilterButton: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  activeFilterButtonText: {
    color: '#fff',
  },
  requestsList: {
    flex: 1,
    padding: 20,
  },
  requestCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  clientInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  clientDetails: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  clientAge: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  requestTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgencyText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  issueSection: {
    marginBottom: 12,
  },
  issueTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  issueDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  scheduleSection: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  scheduleText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailsButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  detailsButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  rejectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  rejectButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginTop: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalSection: {
    marginBottom: 25,
  },
  clientInfoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  modalClientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalClientAge: {
    fontSize: 16,
    color: '#666',
    marginTop: 2,
  },
  modalRequestTime: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  modalIssueTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  modalIssueDescription: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  modalSchedule: {
    flexDirection: 'row',
  },
  modalScheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 25,
  },
  modalScheduleText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 8,
  },
  responseInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 15,
    fontSize: 15,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  modalRejectButton: {
    flex: 1,
    backgroundColor: '#F44336',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  modalRejectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalAcceptButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 10,
  },
  modalAcceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
