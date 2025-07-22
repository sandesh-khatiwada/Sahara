import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  Modal,
  Alert,
  FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useNavbar } from './_layout';
import { API_BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';


const { width, height } = Dimensions.get('window');
// const API_BASE_URL = 'YOUR_API_BASE_URL'; // Replace with your actual API base url


const SessionCard = ({ session, onPress, onJoin }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return '#4CAF50';
      case 'completed':
        return '#666';
      case 'cancelled':
        return '#F44336';
      default:
        return '#007AFF';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'upcoming':
        return 'clock-outline';
      case 'completed':
        return 'check-circle';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'calendar';
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
          <View style={styles.paymentStatusBadge(session.paymentStatus)}>
            <Text style={styles.paymentStatusText}>₹: {session.paymentStatus.toUpperCase()}</Text>
          </View>
          {session.status === 'upcoming' && (
            <TouchableOpacity style={styles.joinButton} onPress={() => onJoin(session)}>
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
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Session Details</Text>
          <TouchableOpacity onPress={onClose}>
            <MaterialCommunityIcons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>Client Information</Text>
            <Text style={styles.modalClientName}>{session.clientName}</Text>
            <Text style={styles.modalSessionType}>{session.type}</Text>
          </View>

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
        </ScrollView>

        {session.status === 'upcoming' && (
          <View style={styles.modalActions}>
            {/* <TouchableOpacity style={[styles.modalJoinButton, styles.modalJoinButtonFullWidth]}>
              <Text style={styles.modalJoinButtonText}>Join Session</Text>
            </TouchableOpacity> */}
          </View>
        )}
      </View>
    </Modal>
  );
};

export default function CounsellorSessions() {
  const { filter: initialFilter } = useLocalSearchParams();
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState(initialFilter || 'all');
  const [selectedSession, setSelectedSession] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { hideNavbar, showNavbar } = useNavbar();
  const scrollY = useRef(0);
  const scrollDirection = useRef(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    filterSessions(selectedFilter);
  }, [selectedFilter, sessions]);

  const fetchSessions = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/api/counsellors/sessions`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await res.json();
    if (data.success) {
      const formattedSessions = data.data.map((session) => ({
        id: session._id,
        clientName: session.user.fullName,
        type: session.noteTitle || 'Counseling Session',
        date: session.date,
        time: session.time,
        duration: '60 minutes',
        status: session.status === 'accepted' ? 'upcoming' : session.status,
        paymentStatus: session.paymentStatus,
        notes: session.noteDescription || '',
      }));
      setSessions(formattedSessions);
    }
  } catch (error) {
    console.log('Failed to fetch sessions:', error);
  }
};


const filters = [
  { key: 'all', label: 'All Sessions', icon: 'calendar-multiple' },
  { key: 'today', label: 'Today', icon: 'calendar-today' },
  { key: 'upcoming', label: 'Upcoming', icon: 'clock-outline' },
  { key: 'completed', label: 'Completed', icon: 'check-circle-outline' },
];


const filterSessions = (filter) => {
  const today = new Date().toISOString().split('T')[0];

  let filtered = sessions;
  switch (filter) {
    case 'today':
      filtered = sessions.filter((session) => session.date === today);
      break;
    case 'upcoming':
      filtered = sessions.filter((session) => session.date > today && session.status !== 'completed');
      break;
    case 'completed':
      filtered = sessions.filter((session) => session.status === 'completed');
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
    Alert.alert('Join Session', `Join the ${session.type} with ${session.clientName}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Join', onPress: () => Alert.alert('Joining...', 'Joining session...') },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSessions();
    setRefreshing(false);
  };

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

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="transparent" barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sessions</Text>
      </View>
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContent}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[styles.filterButton, selectedFilter === filter.key && styles.filterButtonActive]}
              onPress={() => setSelectedFilter(filter.key)}>
              <MaterialCommunityIcons
                name={filter.icon}
                size={14}
                color={selectedFilter === filter.key ? '#fff' : '#666'}
              />
              <Text style={[styles.filterText, selectedFilter === filter.key && styles.filterTextActive]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {filteredSessions.length > 0 ? (
        <FlatList
          data={filteredSessions}
          renderItem={({ item }) => (
            <SessionCard session={item} onPress={handleSessionPress} onJoin={handleJoinSession} />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.sessionsContent, { paddingBottom: 20 }]}
          refreshing={refreshing}
          onRefresh={onRefresh}
          style={styles.sessionsList}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        />
      ) : (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="calendar-remove" size={64} color="#ccc" />
          <Text style={styles.emptyStateTitle}>No Sessions Found</Text>
          <Text style={styles.emptyStateText}>
            {selectedFilter === 'all' ? 'You have no sessions scheduled yet.' : `No ${selectedFilter} sessions found.`}
          </Text>
        </View>
      )}

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
  container: { flex: 1, backgroundColor: '#f0f4f8ff' },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'android' ? 50 : 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(224, 224, 224, 0.3)',
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#003087' },
  filtersContainer: { backgroundColor: 'rgba(255, 255, 255, 0.95)', paddingVertical: 8 },
  filtersContent: { paddingHorizontal: 20, gap: 8 },
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
  filterButtonActive: { backgroundColor: '#007AFF' },
  filterText: { fontSize: 12, fontWeight: '600', color: '#666', marginLeft: 4 },
  filterTextActive: { color: '#fff' },
  sessionsList: { flex: 1, backgroundColor: '#f8f9fa' },
  sessionsContent: { padding: 20, flexGrow: 1 },
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
  sessionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sessionClientInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  sessionAvatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  sessionDetails: { flex: 1 },
  sessionClient: { fontSize: 16, fontWeight: '700', color: '#061B36' },
  sessionType: { fontSize: 13, color: '#666', fontWeight: '500' },
  sessionDateTime: { fontSize: 11, color: '#999', fontWeight: '500' },
  sessionActions: { alignItems: 'flex-end' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, marginBottom: 4 },
  statusText: { fontSize: 11, fontWeight: '600', marginLeft: 3 },
  joinButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    paddingHorizontal:25,
    marginTop: 4,
  },
  joinButtonText: { color: '#fff', fontSize: 11, fontWeight: '600', marginLeft: 3 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100, minHeight: height * 0.5 },
  emptyStateTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginTop: 16, marginBottom: 8 },
  emptyStateText: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 20 },
  modalContainer: { flex: 1, backgroundColor: '#f8f9fa' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#061B36' },
  modalContent: { flex: 1, padding: 20 },
  modalSection: { backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 16, padding: 18, marginBottom: 16 },
  modalSectionTitle: { fontSize: 16, fontWeight: '700', color: '#061B36', marginBottom: 12 },
  modalClientName: { fontSize: 18, fontWeight: '700', color: '#061B36', marginBottom: 4 },
  modalSessionType: { fontSize: 14, color: '#007AFF', fontWeight: '600' },
  modalInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  modalInfoText: { fontSize: 16, color: '#333', marginLeft: 12, fontWeight: '500' },
  modalActions: { flexDirection: 'row', padding: 20, backgroundColor: 'rgba(255, 255, 255, 0.95)' },
  modalJoinButton: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#4CAF50', alignItems: 'center' },
  modalJoinButtonFullWidth: { flex: 1, width: '100%' },
  modalJoinButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  paymentStatusBadge: (status) => ({
    marginTop: 5,
    marginBottom:5,
    paddingHorizontal: 15,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: status === 'pending' ? '#FFA726' : '#4CAF50',
  }),
  paymentStatusText: { fontSize: 11, color: '#fff', fontWeight: '600', textAlign: 'center' },
});
