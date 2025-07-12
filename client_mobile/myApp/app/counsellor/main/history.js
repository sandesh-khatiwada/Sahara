import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';

// Sample data - replace with API calls
const sampleHistory = [
  {
    id: '1',
    clientName: 'Aayusha Karki',
    clientAge: 24,
    date: '2024-01-10',
    time: '10:00 AM',
    duration: 60,
    type: 'Individual Therapy',
    status: 'completed',
    sessionNotes: 'Client showed significant improvement in anxiety management. Discussed coping strategies and scheduled follow-up.',
    rating: 5,
    feedback: 'Very helpful session. Dr. Smith was understanding and provided practical advice.',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    meetingId: 'MTG-001-2024',
    fee: 120,
  },
  {
    id: '2',
    clientName: 'John Doe',
    clientAge: 28,
    date: '2024-01-08',
    time: '2:00 PM',
    duration: 45,
    type: 'Depression Support',
    status: 'completed',
    sessionNotes: 'Initial consultation completed. Client expressing symptoms of moderate depression. Recommended CBT approach.',
    rating: 4,
    feedback: 'Good initial session. Looking forward to continuing treatment.',
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    meetingId: 'MTG-002-2024',
    fee: 100,
  },
  {
    id: '3',
    clientName: 'Sarah Miller',
    clientAge: 22,
    date: '2024-01-05',
    time: '11:30 AM',
    duration: 60,
    type: 'Relationship Counseling',
    status: 'completed',
    sessionNotes: 'Worked on communication patterns. Client is more aware of relationship dynamics. Progress noted.',
    rating: 5,
    feedback: 'Excellent session. Really helped me understand my relationship patterns.',
    avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
    meetingId: 'MTG-003-2024',
    fee: 120,
  },
  {
    id: '4',
    clientName: 'Michael Johnson',
    clientAge: 31,
    date: '2024-01-03',
    time: '3:00 PM',
    duration: 60,
    type: 'Stress Management',
    status: 'no-show',
    sessionNotes: 'Client did not attend scheduled session. Follow-up message sent.',
    rating: null,
    feedback: null,
    avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
    meetingId: 'MTG-004-2024',
    fee: 0,
  },
  {
    id: '5',
    clientName: 'Emma Wilson',
    clientAge: 26,
    date: '2024-01-01',
    time: '4:00 PM',
    duration: 50,
    type: 'Anxiety Treatment',
    status: 'completed',
    sessionNotes: 'Good progress on anxiety management techniques. Client practicing mindfulness regularly.',
    rating: 4,
    feedback: 'Helpful techniques. Feeling more confident managing my anxiety.',
    avatar: 'https://randomuser.me/api/portraits/women/5.jpg',
    meetingId: 'MTG-005-2024',
    fee: 110,
  },
];

const HistoryCard = ({ session, onViewDetails, onEditNotes }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'no-show': return '#F44336';
      case 'cancelled': return '#FF9800';
      default: return '#666';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'no-show': return 'No Show';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const renderStars = (rating) => {
    if (!rating) return <Text style={styles.noRating}>No rating</Text>;
    
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <MaterialCommunityIcons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={16}
            color={star <= rating ? '#FFD700' : '#ccc'}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.historyCard}>
      {/* Header */}
      <View style={styles.historyHeader}>
        <View style={styles.clientInfo}>
          <Image source={{ uri: session.avatar }} style={styles.avatar} />
          <View style={styles.clientDetails}>
            <Text style={styles.clientName}>{session.clientName}</Text>
            <Text style={styles.sessionType}>{session.type}</Text>
            <Text style={styles.sessionDate}>{session.date} • {session.time}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(session.status) }]}>
          <Text style={styles.statusText}>{getStatusText(session.status)}</Text>
        </View>
      </View>

      {/* Session Info */}
      <View style={styles.sessionInfo}>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="clock-outline" size={16} color="#666" />
          <Text style={styles.infoText}>{session.duration} minutes</Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="currency-inr" size={16} color="#666" />
          <Text style={styles.infoText}>₹{session.fee}</Text>
        </View>
        {session.rating && (
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
            <Text style={styles.infoText}>Rating: {session.rating}/5</Text>
          </View>
        )}
      </View>

      {/* Notes Preview */}
      {session.sessionNotes && (
        <View style={styles.notesPreview}>
          <Text style={styles.notesText} numberOfLines={2}>
            {session.sessionNotes}
          </Text>
        </View>
      )}

      {/* Feedback Preview */}
      {session.feedback && (
        <View style={styles.feedbackPreview}>
          <Text style={styles.feedbackLabel}>Client Feedback:</Text>
          <Text style={styles.feedbackText} numberOfLines={1}>
            "{session.feedback}"
          </Text>
          {renderStars(session.rating)}
        </View>
      )}

      {/* Actions */}
      <View style={styles.historyActions}>
        <TouchableOpacity 
          style={styles.viewButton} 
          onPress={() => onViewDetails(session)}
        >
          <Text style={styles.viewButtonText}>View Details</Text>
        </TouchableOpacity>
        {session.status === 'completed' && (
          <TouchableOpacity 
            style={styles.editNotesButton}
            onPress={() => onEditNotes(session)}
          >
            <MaterialCommunityIcons name="pencil" size={16} color="#007AFF" />
            <Text style={styles.editNotesText}>Edit Notes</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const SessionDetailsModal = ({ visible, session, onClose }) => {
  if (!session) return null;

  const renderStars = (rating) => {
    if (!rating) return null;
    
    return (
      <View style={styles.modalStarsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <MaterialCommunityIcons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={20}
            color={star <= rating ? '#FFD700' : '#ccc'}
          />
        ))}
        <Text style={styles.modalRatingText}>({rating}/5)</Text>
      </View>
    );
  };

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
              <Image source={{ uri: session.avatar }} style={styles.modalAvatar} />
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
                <Text style={styles.modalInfoLabel}>Fee</Text>
                <Text style={styles.modalInfoValue}>₹{session.fee}</Text>
              </View>
            </View>
          </View>

          {/* Session Notes */}
          {session.sessionNotes && (
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Session Notes</Text>
              <View style={styles.modalNotesContainer}>
                <Text style={styles.modalNotes}>{session.sessionNotes}</Text>
              </View>
            </View>
          )}

          {/* Client Feedback */}
          {session.feedback && (
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Client Feedback</Text>
              <View style={styles.modalFeedbackContainer}>
                <Text style={styles.modalFeedback}>"{session.feedback}"</Text>
                {renderStars(session.rating)}
              </View>
            </View>
          )}

          {/* Action Items */}
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>Action Items</Text>
            <TouchableOpacity style={styles.actionItem}>
              <MaterialCommunityIcons name="file-document-outline" size={20} color="#007AFF" />
              <Text style={styles.actionItemText}>Generate Session Report</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem}>
              <MaterialCommunityIcons name="calendar-plus" size={20} color="#4CAF50" />
              <Text style={styles.actionItemText}>Schedule Follow-up</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem}>
              <MaterialCommunityIcons name="message-text" size={20} color="#FF9800" />
              <Text style={styles.actionItemText}>Send Follow-up Message</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const EditNotesModal = ({ visible, session, onClose, onSave }) => {
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (session) {
      setNotes(session.sessionNotes || '');
    }
  }, [session]);

  const handleSave = () => {
    onSave(session.id, notes);
    onClose();
  };

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
          <Text style={styles.modalTitle}>Edit Session Notes</Text>
          <TouchableOpacity onPress={onClose}>
            <MaterialCommunityIcons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.editNotesContent}>
          <Text style={styles.editNotesLabel}>
            Session with {session.clientName} - {session.date}
          </Text>
          <TextInput
            style={styles.editNotesInput}
            multiline
            placeholder="Enter your session notes here..."
            value={notes}
            onChangeText={setNotes}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.editNotesActions}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Notes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default function SessionHistory() {
  const [history, setHistory] = useState(sampleHistory);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [editNotesModalVisible, setEditNotesModalVisible] = useState(false);
  const [filter, setFilter] = useState('all'); // all, completed, no-show, cancelled

  const onRefresh = async () => {
    setRefreshing(true);
    // Fetch new history from API
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleViewDetails = (session) => {
    setSelectedSession(session);
    setDetailsModalVisible(true);
  };

  const handleEditNotes = (session) => {
    setSelectedSession(session);
    setEditNotesModalVisible(true);
  };

  const handleSaveNotes = (sessionId, notes) => {
    setHistory(history.map(session => 
      session.id === sessionId 
        ? { ...session, sessionNotes: notes }
        : session
    ));
    Alert.alert('Success', 'Session notes updated successfully.');
  };

  const getFilteredHistory = () => {
    if (filter === 'all') return history;
    return history.filter(session => session.status === filter);
  };

  const filteredHistory = getFilteredHistory();

  // Calculate statistics
  const totalSessions = history.length;
  const completedSessions = history.filter(s => s.status === 'completed').length;
  const totalRevenue = history.reduce((sum, session) => sum + session.fee, 0);
  const averageRating = history.filter(s => s.rating).reduce((sum, s, _, arr) => sum + s.rating / arr.length, 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Session History</Text>
        <Text style={styles.headerSubtitle}>{totalSessions} total sessions</Text>
      </View>

      {/* Statistics */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{completedSessions}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>₹{totalRevenue.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Total Revenue</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{averageRating.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Avg Rating</Text>
        </View>
      </View>

      {/* Filter */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'all', label: `All (${history.length})` },
            { key: 'completed', label: `Completed (${history.filter(s => s.status === 'completed').length})` },
            { key: 'no-show', label: `No Show (${history.filter(s => s.status === 'no-show').length})` },
            { key: 'cancelled', label: `Cancelled (${history.filter(s => s.status === 'cancelled').length})` }
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

      {/* History List */}
      <ScrollView 
        style={styles.historyList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredHistory.length > 0 ? (
          filteredHistory.map((session) => (
            <HistoryCard
              key={session.id}
              session={session}
              onViewDetails={handleViewDetails}
              onEditNotes={handleEditNotes}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="history" size={64} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No sessions found</Text>
            <Text style={styles.emptyStateSubtitle}>
              {filter === 'all' 
                ? 'You have no session history yet.'
                : `No ${filter} sessions found.`}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Session Details Modal */}
      <SessionDetailsModal
        visible={detailsModalVisible}
        session={selectedSession}
        onClose={() => setDetailsModalVisible(false)}
      />

      {/* Edit Notes Modal */}
      <EditNotesModal
        visible={editNotesModalVisible}
        session={selectedSession}
        onClose={() => setEditNotesModalVisible(false)}
        onSave={handleSaveNotes}
      />
    </View>
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
  statsContainer: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#003087',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 15,
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
  historyList: {
    flex: 1,
    padding: 20,
  },
  historyCard: {
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
  historyHeader: {
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
  sessionDate: {
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
  sessionInfo: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  notesPreview: {
    backgroundColor: '#F8F9FA',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  feedbackPreview: {
    backgroundColor: '#FFF8E1',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  feedbackLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4,
  },
  feedbackText: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
    marginBottom: 5,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noRating: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  historyActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  viewButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  editNotesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  editNotesText: {
    color: '#007AFF',
    fontSize: 14,
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
  modalNotesContainer: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 8,
  },
  modalNotes: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  modalFeedbackContainer: {
    backgroundColor: '#FFF8E1',
    padding: 15,
    borderRadius: 8,
  },
  modalFeedback: {
    fontSize: 15,
    color: '#333',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  modalStarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalRatingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    fontWeight: '600',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 10,
  },
  actionItemText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 12,
    fontWeight: '600',
  },

  // Edit Notes Modal
  editNotesContent: {
    flex: 1,
    padding: 20,
  },
  editNotesLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  editNotesInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 15,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  editNotesActions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
