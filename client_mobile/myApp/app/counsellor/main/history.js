import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Platform,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';
import { useNavbar } from './_layout';

const HistoryCard = ({ session, onViewDetails }) => {
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
    if (!rating && rating !== 0) return <Text style={styles.noRating}>No rating</Text>;

    // Round rating to nearest half star
    const roundedRating = Math.round(rating * 2) / 2;

    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => {
          if (star <= roundedRating) {
            return (
              <MaterialCommunityIcons key={star} name="star" size={16} color="#FFD700" />
            );
          }
          if (star - 0.5 === roundedRating) {
            return (
              <MaterialCommunityIcons key={star} name="star-half-full" size={16} color="#FFD700" />
            );
          }
          return (
            <MaterialCommunityIcons key={star} name="star-outline" size={16} color="#ccc" />
          );
        })}
      </View>
    );
  };

const formattedDate = session.date;  // yyyy-mm-dd string from API
const formattedTime = session.time;  // hh:mm:ss string from API


  return (
    <View style={styles.historyCard}>
      {/* Header */}
      <View style={styles.historyHeader}>
        <View style={styles.clientInfo}>
          <View style={styles.clientDetails}>
            <Text style={styles.clientName}>{session.user?.fullName || 'Client Name'}</Text>
            <Text style={styles.sessionType}>{session.noteTitle || 'Session'}</Text>
            <Text style={styles.sessionDate}>{formattedDate} • {formattedTime}</Text>
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
          <Text style={styles.infoText}>60 minutes</Text>
        </View>
        <View style={styles.infoRow}>
          {/* <MaterialCommunityIcons name="currency-inr" size={16} color="#666" /> */}
       

          <Text style={styles.infoText}>Payment: {session.paymentStatus === 'pending' ? 'Pending' : 'Paid'}</Text>
        </View>
        {session.rating !== null && session.rating !== undefined && (
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
            <Text style={styles.infoText}>Rating: {session.rating}/5</Text>
          </View>
        )}
      </View>

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
      </View>
    </View>
  );
};

const SessionDetailsModal = ({ visible, session, onClose }) => {
  if (!session) return null;

  const renderStars = (rating) => {
    if (!rating && rating !== 0) return null;

    // Round rating to nearest half star
    const roundedRating = Math.round(rating * 2) / 2;

    return (
      <View style={styles.modalStarsContainer}>
        {[1, 2, 3, 4, 5].map((star) => {
          if (star <= roundedRating) {
            return (
              <MaterialCommunityIcons key={star} name="star" size={20} color="#FFD700" />
            );
          }
          if (star - 0.5 === roundedRating) {
            return (
              <MaterialCommunityIcons key={star} name="star-half-full" size={20} color="#FFD700" />
            );
          }
          return (
            <MaterialCommunityIcons key={star} name="star-outline" size={20} color="#ccc" />
          );
        })}
       
        <Text style={styles.modalRatingText}>({rating}/5)</Text>
      </View>
    );
  };

const formattedDate = session.date;
const formattedTime = session.time;


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
              <View>
                <Text style={styles.modalClientName}>{session.user?.fullName || 'Client Name'}</Text>
                <Text style={styles.modalSessionType}>{session.noteTitle || 'Session'}</Text>
              </View>
            </View>
          </View>

          {/* Session Info */}
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>Session Information</Text>
            <View style={styles.modalInfoGrid}>
              <View style={styles.modalInfoItem}>
                <Text style={styles.modalInfoLabel}>Date</Text>
                <Text style={styles.modalInfoValue}>{formattedDate}</Text>
              </View>
              <View style={styles.modalInfoItem}>
                <Text style={styles.modalInfoLabel}>Time</Text>
                <Text style={styles.modalInfoValue}>{formattedTime}</Text>
              </View>
              <View style={styles.modalInfoItem}>
                <Text style={styles.modalInfoLabel}>Duration</Text>
                <Text style={styles.modalInfoValue}>60 minutes</Text>
              </View>
              <View style={styles.modalInfoItem}>
                <Text style={styles.modalInfoLabel}>Payment</Text>
                <Text style={styles.modalInfoValue}>{session.paymentStatus}</Text>
              </View>
            </View>
          </View>

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
        </ScrollView>
      </View>
    </Modal>
  );
};

export default function SessionHistory() {
  const [history, setHistory] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [filter, setFilter] = useState('all'); // all, completed, no-show, cancelled

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

  const fetchSessionHistory = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'User token not found. Please login again.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/counsellors/session-history`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching session history: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        setHistory(result.data);
      } else {
        Alert.alert('Error', 'Failed to load session history.');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  useEffect(() => {
    fetchSessionHistory();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSessionHistory();
    setRefreshing(false);
  };

  const handleViewDetails = (session) => {
    setSelectedSession(session);
    setDetailsModalVisible(true);
  };

  const getFilteredHistory = () => {
    if (filter === 'all') return history;
    return history.filter(session => session.status === filter);
  };

  const filteredHistory = getFilteredHistory();

  // Calculate statistics
  const totalSessions = history.length;
  const completedSessions = history.filter(s => s.status === 'completed').length;
  const ratingsArray = history.filter(s => s.rating !== null && s.rating !== undefined && !isNaN(s.rating));
  const averageRating = ratingsArray.length > 0
    ? ratingsArray.reduce((sum, s) => sum + s.rating, 0) / ratingsArray.length
    : 0;

  return (
    <View style={styles.container}>
      {/* Gradient Background for non-web platforms */}
      {Platform.OS !== 'web' && (
        <View style={styles.gradientBackground}>
          <View style={styles.gradientTop} />
          <View style={styles.gradientBottom} />
        </View>
      )}
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>Session History</Text>
              <Text style={styles.headerSubtitle}>{totalSessions} total sessions</Text>
            </View>
            {/* <View style={styles.headerRight}>
              <Image
                source={{ uri: 'https://randomuser.me/api/portraits/women/44.jpg' }}
                style={styles.counsellorAvatar}
              />
            </View> */}
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{completedSessions}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{averageRating ? averageRating.toFixed(1) : '0.0'}</Text>
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
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {filteredHistory.length > 0 ? (
            filteredHistory.map((session) => (
              <HistoryCard
                key={session._id}
                session={session}
                onViewDetails={handleViewDetails}
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // ... (Your existing styles remain unchanged here)
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8ff',
    position: 'relative',
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 1,
  },
  gradientTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '50%',
    backgroundColor: '#ffffff',
  },
  gradientBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
    backgroundColor: '#e3f2fd',
    opacity: 0.6,
  },
  scrollView: {
    flex: 1,
    zIndex: 2,
    marginTop: 35,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    marginLeft: 15,
  },
  counsellorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#007AFF',
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
    color: '#061B36',
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
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clientDetails: {
    marginLeft: 10,
  },
  clientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#061B36',
  },
  sessionType: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  sessionDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  sessionInfo: {
    flexDirection: 'row',
    marginTop: 12,
    justifyContent: 'space-between',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  feedbackPreview: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  feedbackLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  feedbackText: {
    fontStyle: 'italic',
    fontSize: 13,
    color: '#555',
  },
  starsContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  noRating: {
    fontSize: 12,
    color: '#aaa',
    fontStyle: 'italic',
  },
  historyActions: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  viewButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  viewButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ccc',
    marginTop: 10,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#061B36',
  },
  modalContent: {
    flex: 1,
  },
  modalSection: {
    marginBottom: 25,
  },
  clientInfoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalClientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#061B36',
  },
  modalSessionType: {
    fontSize: 14,
    color: '#666',
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#003087',
    marginBottom: 10,
  },
  modalInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  modalInfoItem: {
    width: '50%',
    marginBottom: 10,
  },
  modalInfoLabel: {
    fontSize: 14,
    color: '#666',
  },
  modalInfoValue: {
    fontSize: 16,
    color: '#061B36',
    fontWeight: '500',
  },
  modalFeedbackContainer: {
    backgroundColor: '#F5F8FF',
    borderRadius: 12,
    padding: 12,
  },
  modalFeedback: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#333',
    marginBottom: 10,
  },
  modalStarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalRatingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#555',
  },
});
