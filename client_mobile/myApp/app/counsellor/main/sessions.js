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
  Modal,
  Alert,
  FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

// Sample sessions data
const sampleSessions = [
  {
    id: '1',
    clientName: 'Aayusha Karki',
    type: 'Anxiety Counseling',
    date: '2024-01-15',
    time: '10:00 AM',
    duration: '60 minutes',
    status: 'upcoming',
    notes: 'First session with client, focus on anxiety management techniques',
  },
  {
    id: '2',
    clientName: 'John Doe', 
    type: 'Depression Support',
    date: '2024-01-15',
    time: '2:00 PM',
    duration: '45 minutes',
    status: 'upcoming',
    notes: 'Follow-up session on cognitive behavioral therapy',
  },
  {
    id: '3',
    clientName: 'Sarah Miller',
    type: 'Relationship Counseling',
    date: '2024-01-14',
    time: '11:00 AM',
    duration: '60 minutes',
    status: 'completed',
    notes: 'Discussion about communication patterns',
  },
  {
    id: '4',
    clientName: 'Mike Johnson',
    type: 'Stress Management',
    date: '2024-01-14',
    time: '3:30 PM',
    duration: '45 minutes',
    status: 'completed',
    notes: 'Mindfulness and relaxation techniques introduced',
  },
];

const SessionCard = ({ session, onPress, onJoin }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return '#4CAF50';
      case 'completed': return '#666';
      case 'cancelled': return '#F44336';
      default: return '#007AFF';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'upcoming': return 'clock-outline';
      case 'completed': return 'check-circle';
      case 'cancelled': return 'close-circle';
      default: return 'calendar';
    }
  };

  return (
    <TouchableOpacity style={styles.sessionCard} onPress={() => onPress(session)}>
      <View style={styles.sessionHeader}>
        <View style={styles.sessionClientInfo}>
          <View style={[styles.sessionAvatar, { backgroundColor: getStatusColor(session.status) + '15' }]}>
            <MaterialCommunityIcons name="account" size={20} color={getStatusColor(session.status)} />
          </View>
          <View style={styles.sessionDetails}>
            <Text style={styles.sessionClient}>{session.clientName}</Text>
            <Text style={styles.sessionType}>{session.type}</Text>
            <Text style={styles.sessionDateTime}>{session.date} • {session.time}</Text>
          </View>
        </View>
        <View style={styles.sessionActions}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(session.status) + '15' }]}>
            <MaterialCommunityIcons name={getStatusIcon(session.status)} size={14} color={getStatusColor(session.status)} />
            <Text style={[styles.statusText, { color: getStatusColor(session.status) }]}>
              {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
            </Text>
          </View>
          {session.status === 'upcoming' && (
            <TouchableOpacity 
              style={styles.joinButton}
              onPress={() => onJoin(session)}
            >
              <MaterialCommunityIcons name="video" size={16} color="#fff" />
              <Text style={styles.joinButtonText}>Join</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const SessionDetailsModal = ({ visible, session, onClose }) => {
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
            <Text style={styles.modalSectionTitle}>Client Information</Text>
            <Text style={styles.modalClientName}>{session.clientName}</Text>
            <Text style={styles.modalSessionType}>{session.type}</Text>
          </View>

          {/* Session Details */}
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>Session Information</Text>
            <View style={styles.modalInfoRow}>
              <MaterialCommunityIcons name="calendar" size={20} color="#007AFF" />
              <Text style={styles.modalInfoText}>{session.date}</Text>
            </View>
            <View style={styles.modalInfoRow}>
              <MaterialCommunityIcons name="clock-outline" size={20} color="#007AFF" />
              <Text style={styles.modalInfoText}>{session.time}</Text>
            </View>
            <View style={styles.modalInfoRow}>
              <MaterialCommunityIcons name="timer-outline" size={20} color="#007AFF" />
              <Text style={styles.modalInfoText}>{session.duration}</Text>
            </View>
          </View>

          {/* Notes */}
          {session.notes && (
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Session Notes</Text>
              <Text style={styles.modalNotes}>{session.notes}</Text>
            </View>
          )}
        </ScrollView>

        {/* Modal Actions */}
        {session.status === 'upcoming' && (
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.modalRescheduleButton}>
              <Text style={styles.modalRescheduleButtonText}>Reschedule</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalJoinButton}>
              <Text style={styles.modalJoinButtonText}>Join Session</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

export default function CounsellorSessions() {
  const [sessions, setSessions] = useState(sampleSessions);
  const [filteredSessions, setFilteredSessions] = useState(sampleSessions);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedSession, setSelectedSession] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const filters = [
    { key: 'all', label: 'All Sessions', icon: 'calendar-multiple' },
    { key: 'today', label: 'Today', icon: 'calendar-today' },
    { key: 'upcoming', label: 'Upcoming', icon: 'clock-outline' },
    { key: 'completed', label: 'Completed', icon: 'check-circle' },
  ];

  useEffect(() => {
    filterSessions(selectedFilter);
  }, [selectedFilter, sessions]);

  const filterSessions = (filter) => {
    let filtered = sessions;
    const today = new Date().toISOString().split('T')[0];

    switch (filter) {
      case 'today':
        filtered = sessions.filter(session => session.date === today);
        break;
      case 'upcoming':
        filtered = sessions.filter(session => session.status === 'upcoming');
        break;
      case 'completed':
        filtered = sessions.filter(session => session.status === 'completed');
        break;
      default:
        filtered = sessions;
    }

    setFilteredSessions(filtered);
  };

  const handleSessionPress = (session) => {
    setSelectedSession(session);
    setModalVisible(true);
  };

  const handleJoinSession = (session) => {
    Alert.alert(
      'Join Session',
      `Join the ${session.type} session with ${session.clientName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Join', onPress: () => {
          // Here you would integrate with your video calling solution
          Alert.alert('Success', 'Joining session...');
        }}
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="transparent" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sessions</Text>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                selectedFilter === filter.key && styles.filterButtonActive
              ]}
              onPress={() => setSelectedFilter(filter.key)}
            >
              <MaterialCommunityIcons 
                name={filter.icon} 
                size={14} 
                color={selectedFilter === filter.key ? '#fff' : '#666'} 
              />
              <Text style={[
                styles.filterText,
                selectedFilter === filter.key && styles.filterTextActive
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Sessions List */}
      {filteredSessions.length > 0 ? (
        <FlatList
          data={filteredSessions}
          renderItem={({ item }) => (
            <SessionCard
              session={item}
              onPress={handleSessionPress}
              onJoin={handleJoinSession}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.sessionsContent}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
          style={styles.sessionsList}
        />
      ) : (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="calendar-remove" size={64} color="#ccc" />
          <Text style={styles.emptyStateTitle}>No Sessions Found</Text>
          <Text style={styles.emptyStateText}>
            {selectedFilter === 'all' 
              ? 'You have no sessions scheduled yet.' 
              : `No ${selectedFilter} sessions found.`}
          </Text>
        </View>
      )}

      {/* Session Details Modal */}
      <SessionDetailsModal
        visible={modalVisible}
        session={selectedSession}
        onClose={() => {
          setModalVisible(false);
          setSelectedSession(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'android' ? 50 : 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(224, 224, 224, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  filtersContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 8,
  },
  filtersContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginRight: 8,
    height: 28,
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginLeft: 4,
  },
  filterTextActive: {
    color: '#fff',
  },
  sessionsList: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  sessionsContent: {
    padding: 20,
    flexGrow: 1,
  },
  sessionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionClientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sessionAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sessionDetails: {
    flex: 1,
  },
  sessionClient: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  sessionType: {
    fontSize: 13,
    color: '#666',
    marginBottom: 3,
    fontWeight: '500',
  },
  sessionDateTime: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
  },
  sessionActions: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 3,
  },
  joinButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 3,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    minHeight: height * 0.5,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(224, 224, 224, 0.3)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  modalClientName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  modalSessionType: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalInfoText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    fontWeight: '500',
  },
  modalNotes: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(224, 224, 224, 0.3)',
  },
  modalRescheduleButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    alignItems: 'center',
  },
  modalRescheduleButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '700',
  },
  modalJoinButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  modalJoinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
