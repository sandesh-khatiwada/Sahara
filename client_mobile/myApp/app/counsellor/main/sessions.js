import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  FlatList,
  SafeAreaView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';

// Sample data - replace with API calls
const sampleSessions = [
  {
    id: '1',
    clientName: 'Aayusha Karki',
    clientAge: 24,
    date: '2024-01-15',
    time: '10:00 AM',
    duration: 60,
    type: 'Individual Therapy',
    status: 'scheduled',
    sessionNotes: 'Follow-up on anxiety management techniques',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    meetingId: 'MTG-001-2024',
    isToday: true,
    canJoin: true,
  },
  {
    id: '2',
    clientName: 'John Doe',
    clientAge: 28,
    date: '2024-01-15',
    time: '2:00 PM',
    duration: 45,
    type: 'Depression Support',
    status: 'scheduled',
    sessionNotes: 'Initial consultation for depression screening',
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    meetingId: 'MTG-002-2024',
    isToday: true,
    canJoin: false,
  },
  {
    id: '3',
    clientName: 'Sarah Miller',
    clientAge: 22,
    date: '2024-01-16',
    time: '11:30 AM',
    duration: 60,
    type: 'Relationship Counseling',
    status: 'scheduled',
    sessionNotes: 'Working on communication patterns',
    avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
    meetingId: 'MTG-003-2024',
    isToday: false,
    canJoin: false,
  },
  {
    id: '4',
    clientName: 'Michael Johnson',
    clientAge: 31,
    date: '2024-01-14',
    time: '3:00 PM',
    duration: 60,
    type: 'Stress Management',
    status: 'completed',
    sessionNotes: 'Discussed mindfulness techniques and coping strategies',
    avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
    meetingId: 'MTG-004-2024',
    isToday: false,
    canJoin: false,
  },
];

const SessionCard = React.memo(({ session, onJoinSession, onViewDetails, onReschedule, onCancel }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return session.isToday ? '#4CAF50' : '#2196F3';
      case 'in-progress': return '#FF9800';
      case 'completed': return '#666';
      case 'cancelled': return '#F44336';
      default: return '#666';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'scheduled': return session.isToday ? 'Today' : 'Scheduled';
      case 'in-progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  return (
    <View style={styles.sessionCard}>
      {/* Header */}
      <View style={styles.sessionHeader}>
        <View style={styles.clientInfo}>
          <Image 
            source={{ uri: session.avatar }} 
            style={styles.avatar}
            loadingIndicatorSource={{ uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==' }}
            defaultSource={{ uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==' }}
          />
          <View style={styles.clientDetails}>
            <Text style={styles.clientName}>{session.clientName}</Text>
            <Text style={styles.sessionType}>{session.type}</Text>
            <Text style={styles.sessionId}>ID: {session.meetingId}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(session.status) }]}>
          <Text style={styles.statusText}>{getStatusText(session.status)}</Text>
        </View>
      </View>

      {/* Session Details */}
      <View style={styles.sessionDetails}>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="calendar" size={16} color="#666" />
          <Text style={styles.detailText}>{session.date}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="clock-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{session.time} ({session.duration} min)</Text>
        </View>
        {session.sessionNotes && (
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="note-text" size={16} color="#666" />
            <Text style={styles.detailText} numberOfLines={1}>{session.sessionNotes}</Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.sessionActions}>
        <TouchableOpacity 
          style={styles.detailsButton} 
          onPress={() => onViewDetails(session)}
        >
          <Text style={styles.detailsButtonText}>Details</Text>
        </TouchableOpacity>
        
        {session.status === 'scheduled' && (
          <View style={styles.actionButtons}>
            {session.canJoin && (
              <TouchableOpacity 
                style={styles.joinButton}
                onPress={() => onJoinSession(session)}
              >
                <MaterialCommunityIcons name="video" size={16} color="#fff" />
                <Text style={styles.joinButtonText}>Join</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={styles.rescheduleButton}
              onPress={() => onReschedule(session)}
            >
              <MaterialCommunityIcons name="calendar-edit" size={16} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => onCancel(session)}
            >
              <MaterialCommunityIcons name="close" size={16} color="#F44336" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
});

const SessionDetailsModal = ({ visible, session, onClose, onJoinSession }) => {
  if (!session) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Session Details</Text>
          <TouchableOpacity onPress={onClose}>
            <MaterialCommunityIcons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {/* Client Info */}
          <View style={styles.modalSection}>
            <View style={styles.clientInfoSection}>
              <Image 
                source={{ uri: session.avatar }} 
                style={styles.modalAvatar}
                loadingIndicatorSource={{ uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==' }}
                defaultSource={{ uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==' }}
              />
              <View>
                <Text style={styles.modalClientName}>{session.clientName}</Text>
                <Text style={styles.modalClientAge}>Age: {session.clientAge}</Text>
                <Text style={styles.modalSessionType}>{session.type}</Text>
              </View>
            </View>
          </View>

          {/* Session Info */}
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>Session Information</Text>
            <View style={styles.modalInfoGrid}>
              <View style={styles.modalInfoItem}>
                <Text style={styles.modalInfoLabel}>Date</Text>
                <Text style={styles.modalInfoValue}>{session.date}</Text>
              </View>
              <View style={styles.modalInfoItem}>
                <Text style={styles.modalInfoLabel}>Time</Text>
                <Text style={styles.modalInfoValue}>{session.time}</Text>
              </View>
              <View style={styles.modalInfoItem}>
                <Text style={styles.modalInfoLabel}>Duration</Text>
                <Text style={styles.modalInfoValue}>{session.duration} minutes</Text>
              </View>
              <View style={styles.modalInfoItem}>
                <Text style={styles.modalInfoLabel}>Meeting ID</Text>
                <Text style={styles.modalInfoValue}>{session.meetingId}</Text>
              </View>
            </View>
          </View>

          {/* Session Notes */}
          {session.sessionNotes && (
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Session Notes</Text>
              <Text style={styles.modalNotes}>{session.sessionNotes}</Text>
            </View>
          )}

          {/* Previous Sessions */}
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>Previous Sessions</Text>
            <Text style={styles.modalSubtext}>3 previous sessions completed</Text>
            <TouchableOpacity style={styles.viewHistoryButton}>
              <Text style={styles.viewHistoryButtonText}>View Session History</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Modal Actions */}
        {session.status === 'scheduled' && (
          <View style={styles.modalActions}>
            {session.canJoin && (
              <TouchableOpacity 
                style={styles.modalJoinButton}
                onPress={() => {
                  onJoinSession(session);
                  onClose();
                }}
              >
                <MaterialCommunityIcons name="video" size={20} color="#fff" />
                <Text style={styles.modalJoinButtonText}>Join Session</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </Modal>
  );
};

export default function Sessions() {
  const [sessions, setSessions] = useState(sampleSessions);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filter, setFilter] = useState('all'); // all, today, upcoming, completed

  const onRefresh = async () => {
    setRefreshing(true);
    // Fetch new sessions from API
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getFilteredSessions = useMemo(() => {
    switch (filter) {
      case 'today':
        return sessions.filter(s => s.isToday);
      case 'upcoming':
        return sessions.filter(s => s.status === 'scheduled' && !s.isToday);
      case 'completed':
        return sessions.filter(s => s.status === 'completed');
      default:
        return sessions;
    }
  }, [sessions, filter]);

  const handleJoinSession = useCallback((session) => {
    Alert.alert(
      'Join Session',
      `Start video session with ${session.clientName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Join',
          onPress: () => {
            // Navigate to video call screen or open external video app
            Alert.alert('Joining Session', 'Opening video session...');
          }
        }
      ]
    );
  }, []);

  const handleViewDetails = useCallback((session) => {
    setSelectedSession(session);
    setModalVisible(true);
  }, []);

  const handleReschedule = useCallback((session) => {
    Alert.alert(
      'Reschedule Session',
      `Do you want to reschedule the session with ${session.clientName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reschedule',
          onPress: () => {
            // Navigate to reschedule screen
            Alert.alert('Reschedule', 'Reschedule functionality would open here');
          }
        }
      ]
    );
  }, []);

  const handleCancel = useCallback((session) => {
    Alert.alert(
      'Cancel Session',
      `Are you sure you want to cancel the session with ${session.clientName}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            setSessions(sessions.map(s => 
              s.id === session.id ? { ...s, status: 'cancelled' } : s
            ));
            Alert.alert('Session Cancelled', 'The client has been notified.');
          }
        }
      ]
    );
  }, [sessions, setSessions]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Sessions</Text>
        <Text style={styles.headerSubtitle}>
          {sessions.filter(s => s.isToday).length} sessions today
        </Text>
      </View>

      {/* Filter */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'all', label: `All (${sessions.length})` },
            { key: 'today', label: `Today (${sessions.filter(s => s.isToday).length})` },
            { key: 'upcoming', label: `Upcoming (${sessions.filter(s => s.status === 'scheduled' && !s.isToday).length})` },
            { key: 'completed', label: `Completed (${sessions.filter(s => s.status === 'completed').length})` }
          ].map((filterOption) => (
            <TouchableOpacity
              key={filterOption.key}
              style={[
                styles.filterButton,
                filter === filterOption.key && styles.activeFilterButton
              ]}
              onPress={() => setFilter(filterOption.key)}
            >
              <Text style={[
                styles.filterButtonText,
                filter === filterOption.key && styles.activeFilterButtonText
              ]}>
                {filterOption.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Sessions List */}
      <FlatList 
        style={styles.sessionsList}
        data={getFilteredSessions}
        renderItem={({ item: session }) => (
          <SessionCard
            session={session}
            onJoinSession={handleJoinSession}
            onViewDetails={handleViewDetails}
            onReschedule={handleReschedule}
            onCancel={handleCancel}
          />
        )}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="calendar-blank" size={64} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No sessions found</Text>
            <Text style={styles.emptyStateSubtitle}>
              {filter === 'all' 
                ? 'You have no sessions scheduled at the moment.'
                : `No ${filter} sessions found.`}
            </Text>
          </View>
        )}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={10}
      />

      {/* Session Details Modal */}
      <SessionDetailsModal
        visible={modalVisible}
        session={selectedSession}
        onClose={() => setModalVisible(false)}
        onJoinSession={handleJoinSession}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    marginTop: 35,
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
  sessionsList: {
    flex: 1,
    padding: 20,
  },
  sessionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  sessionHeader: {
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
  sessionType: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  sessionId: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  sessionDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  sessionActions: {
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
    alignItems: 'center',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  rescheduleButton: {
    padding: 8,
    marginRight: 8,
  },
  cancelButton: {
    padding: 8,
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
  modalSessionType: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 2,
    fontWeight: '600',
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  modalInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  modalInfoItem: {
    width: '50%',
    marginBottom: 15,
  },
  modalInfoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  modalInfoValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
  },
  modalNotes: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 8,
  },
  modalSubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  viewHistoryButton: {
    backgroundColor: '#F0F0F0',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  viewHistoryButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  modalJoinButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalJoinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
