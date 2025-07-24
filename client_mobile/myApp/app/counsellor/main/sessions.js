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
  RefreshControl,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useNavbar } from './_layout';
import { API_BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Camera } from 'expo-camera';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
// If you intend to use WebView for showing PDFs directly within the app,
// you'd need to install and import it, but it's generally not recommended for local PDFs.
// import { WebView } from 'react-native-webview';

const { width, height } = Dimensions.get('window');

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

// Renamed and repurposed from PdfViewerModal to ReportActionModal
// This modal primarily serves to show a loading state while fetching the PDF
// and then delegates to sharing or downloading.
const ReportActionModal = ({ visible, sessionId, token, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [actionType, setActionType] = useState(null); // 'view' or 'download'

  useEffect(() => {
    if (visible && sessionId && token && actionType) {
      if (actionType === 'view') {
        handleViewPdf();
      } else if (actionType === 'download') {
        // The download function is now primarily handled by the SessionDetailsModal
        // This modal will just show a loading state briefly if invoked from here
        // In this refactored structure, handleDownloadPdf is not called from here directly
      }
    }
  }, [visible, sessionId, token, actionType]);

  const handleViewPdf = async () => {
    setLoading(true);
    const fileName = `session-report-${sessionId}.pdf`;
    const fileUri = `${FileSystem.cacheDirectory}${fileName}`; // Temporary cache location

    try {
      console.log('Attempting to fetch PDF for viewing...');

      const response = await fetch(`${API_BASE_URL}/api/counsellors/session/pdf-report`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/pdf',
        },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend response not OK:', response.status, errorText);
        let errorMessage = `Failed to fetch PDF: ${response.status} ${response.statusText}`;
        if (response.status === 400 || response.status === 403 || response.status === 404) {
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.message || errorMessage;
            } catch (parseError) {
                // If not JSON, use the raw text
            }
        }
        throw new Error(errorMessage);
      }

      const pdfBlob = await response.blob(); // Get the response as a Blob
      const fileReader = new FileReader();

      fileReader.onload = async () => {
        const base64Data = fileReader.result.split(',')[1]; // Extract base64 part
        await FileSystem.writeAsStringAsync(fileUri, base64Data, { encoding: FileSystem.EncodingType.Base64 });

        console.log('PDF saved to cache:', fileUri);

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Open PDF Report',
          });
          console.log('PDF shared for viewing.');
        } else {
          Alert.alert(
            'Cannot View Report',
            'Sharing is not available on your device. Please try downloading the report instead to open it with a dedicated PDF viewer app.',
          );
        }
      };
      fileReader.readAsDataURL(pdfBlob); // Convert Blob to Data URL (base64) for writing

    } catch (error) {
      console.error('Error fetching or viewing PDF:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to open PDF. Please ensure a PDF viewer is installed or try downloading the report.',
      );
    } finally {
      setLoading(false);
      onClose(); // Close the modal after attempt, whether success or fail
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.pdfModalContainer}>
        <View style={styles.pdfModalHeader}>
          <Text style={styles.pdfModalTitle}>Session Report</Text>
          <TouchableOpacity onPress={onClose}>
            <MaterialCommunityIcons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>
            {actionType === 'view' ? 'Preparing report for viewing...' : 'Initiating download...'}
          </Text>
          <Text style={styles.loadingTextSmall}>This may take a moment.</Text>
        </View>
      </View>
    </Modal>
  );
};

const SessionDetailsModal = ({ visible, session, onClose }) => {
  const [downloading, setDownloading] = useState(false);
  const [token, setToken] = useState(null);
  const [reportActionModalVisible, setReportActionModalVisible] = useState(false);
  const [currentActionType, setCurrentActionType] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      setToken(storedToken);
    };
    if (visible) {
      fetchToken();
    }
  }, [visible]);

  const handleViewReport = () => {
    if (!token || !session?.id) {
      console.error('Missing token or session ID:', { token, sessionId: session?.id });
      Alert.alert('Error', 'Unable to load PDF. Please try again.');
      return;
    }
    setCurrentActionType('view');
    setReportActionModalVisible(true);
  };

  const handleDownloadReport = async () => {
    if (downloading) return; // Prevent double tap

    setDownloading(true);
    setCurrentActionType('download'); // Set action type for the loading modal
    setReportActionModalVisible(true); // Show the loading modal

    const fileName = `${session.clientName.replace(/\s+/g, '_')}_${session.date.replace(/-/g, '')}_report.pdf`;
    const downloadDest = `${FileSystem.documentDirectory}${fileName}`; // Use documentDirectory for more persistent storage

    try {
      console.log('Starting PDF download to:', downloadDest);

      const response = await fetch(`${API_BASE_URL}/api/counsellors/session/pdf-report`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/pdf',
        },
        body: JSON.stringify({ sessionId: session.id }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend response not OK during download:', response.status, errorText);
        let errorMessage = `Failed to download PDF: ${response.status} ${response.statusText}`;
        if (response.status === 400 || response.status === 403 || response.status === 404 || response.status === 500) {
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.message || errorMessage;
            } catch (parseError) {
                // If not JSON, use the raw text
            }
        }
        throw new Error(errorMessage);
      }

      // Get the response as an ArrayBuffer
      const pdfArrayBuffer = await response.arrayBuffer();
      // Convert ArrayBuffer to Base64 string
      const base64Pdf = btoa(String.fromCharCode(...new Uint8Array(pdfArrayBuffer)));

      await FileSystem.writeAsStringAsync(downloadDest, base64Pdf, { encoding: FileSystem.EncodingType.Base64 });
      console.log('PDF saved to:', downloadDest);

      Alert.alert('Download Complete', `Report saved to your device:\n${fileName}`, [
        { text: 'OK' },
        {
          text: 'Open File',
          onPress: async () => {
            if (await Sharing.isAvailableAsync()) {
              await Sharing.shareAsync(downloadDest, { mimeType: 'application/pdf' });
            } else {
              Alert.alert('Error', 'Sharing is not available on your device.');
            }
          },
        },
      ]);
    } catch (error) {
      console.error('Error downloading PDF report:', error);
      Alert.alert('Download Failed', error.message || 'Failed to download PDF report. Please try again.');
    } finally {
      setDownloading(false);
      setReportActionModalVisible(false); // Hide the loading modal
      setCurrentActionType(null);
    }
  };

  if (!session) return null;

  return (
    <>
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

           
            {session.status != 'completed' && session.reportShareStatus === true && (
              <View style={styles.buttonContainer}>
                {/* <TouchableOpacity
                  style={[styles.viewButton, downloading && styles.viewButtonDisabled]}
                  onPress={handleViewReport}
                  disabled={downloading}
                >
                  <MaterialCommunityIcons name="eye" size={20} color="#fff" />
                  <Text style={styles.viewButtonText}>View Report</Text>
                </TouchableOpacity> */}
                <TouchableOpacity
                  style={[styles.downloadButton, downloading && styles.downloadButtonDisabled]}
                  onPress={handleDownloadReport}
                  disabled={downloading}
                >
                  <MaterialCommunityIcons name="download" size={20} color="#fff" />
                  <Text style={styles.downloadButtonText}>
                    {downloading ? 'Downloading...' : 'Download Report'}
                  </Text>
                  {downloading && <ActivityIndicator size="small" color="#fff" style={{ marginLeft: 8 }} />}
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
      <ReportActionModal
        visible={reportActionModalVisible}
        sessionId={session?.id}
        token={token}
        onClose={() => setReportActionModalVisible(false)}
        actionType={currentActionType}
      />
    </>
  );
};

const VideoCallModal = ({ visible, sessionId, onClose }) => {
  // WebView requires installation: expo install react-native-webview
  // If you don't have it installed, this component will cause an error.
  // Make sure you import WebView if you use this.
  // For the purpose of providing a complete working solution, I'm assuming it's installed or will be.
  // If not, you might consider linking to an external browser for video calls as well.
  const WebView = require('react-native-webview').WebView;

  return (
    <Modal
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
      animationType="slide"
    >
      <View style={styles.videoCallModalContainer}>
        <View style={styles.videoCallHeader}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <MaterialCommunityIcons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.videoCallTitle}>Video Call</Text>
        </View>
        {sessionId ? (
          <WebView
            source={{ uri: `https://meet.systemli.org/${sessionId}#config.requireDisplayName=false&config.startWithVideoMuted=true` }}
            style={styles.webview}
            javaScriptEnabled={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error('WebView error:', nativeEvent);
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
  );
};

export default function CounsellorSessions() {
  const { filter: initialFilter } = useLocalSearchParams();
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState(initialFilter || 'all');
  const [selectedSession, setSelectedSession] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [videoCallModalVisible, setVideoCallModalVisible] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const { hideNavbar, showNavbar } = useNavbar();
  const scrollY = useRef(0);
  const scrollDirection = useRef(null);

  useEffect(() => {
    fetchSessions();
    requestPermissions();
  }, []);

  useEffect(() => {
    filterSessions(selectedFilter);
  }, [selectedFilter, sessions]);

  const requestPermissions = async () => {
    // For saving files to media library (optional, depends on desired save location)
    // const { status: mediaLibraryStatus } = await MediaLibrary.requestPermissionsAsync();
    // if (mediaLibraryStatus !== 'granted') {
    //   Alert.alert('Permission required', 'Media Library permission is needed to save files.');
    // }

    const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
    const { status: audioStatus } = await Audio.requestPermissionsAsync();
    if (cameraStatus !== 'granted' || audioStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Camera and microphone permissions are needed for video calls.',
        [
          { text: 'OK' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
    }
  };

  const fetchSessions = async () => {
    try {
      setRefreshing(true);
      const token = await AsyncStorage.getItem('token');
      console.log('Fetching sessions with token:', token ? 'Bearer [REDACTED]' : 'No token');
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
          reportShareStatus: session.reportShareStatus || false,
        }));
        console.log('Formatted Sessions:', formattedSessions);
        setSessions(formattedSessions);
      } else {
        throw new Error(data.message || 'Failed to fetch sessions');
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      Alert.alert('Error', 'Failed to fetch sessions. Please try again.');
    } finally {
      setRefreshing(false);
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
        filtered = sessions.filter((session) => session.date >= today && session.status === 'upcoming');
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

  const handleJoinSession = async (session) => {
    try {
      const { status: cameraStatus } = await Camera.getCameraPermissionsAsync();
      const { status: audioStatus } = await Audio.getPermissionsAsync();

      if (cameraStatus !== 'granted' || audioStatus !== 'granted') {
        Alert.alert(
          'Permissions Required',
          'Please enable camera and microphone access to join the video call',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
        return;
      }

      setSelectedSessionId(session.id);
      setVideoCallModalVisible(true);
    } catch (error) {
      console.error('Error joining session:', error);
      Alert.alert('Error', 'Failed to join the session. Please try again.');
    }
  };

  const onRefresh = async () => {
    await fetchSessions();
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
            <SessionCard
              session={item}
              onPress={handleSessionPress}
              onJoin={handleJoinSession}
            />
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

      <VideoCallModal
        visible={videoCallModalVisible}
        sessionId={selectedSessionId}
        onClose={() => {
          setVideoCallModalVisible(false);
          setSelectedSessionId(null);
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  viewButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
  },
  viewButtonDisabled: {
    backgroundColor: '#aaa',
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  downloadButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 5,
  },
  downloadButtonDisabled: {
    backgroundColor: '#aaa',
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
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
    paddingHorizontal: 25,
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
  paymentStatusBadge: (status) => ({
    marginTop: 5,
    marginBottom: 5,
    paddingHorizontal: 15,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: status === 'pending' ? '#FFA726' : '#4CAF50',
  }),
  paymentStatusText: { fontSize: 11, color: '#fff', fontWeight: '600', textAlign: 'center' },
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
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    color: '#333',
    fontSize: 16,
    marginTop: 10,
  },
  loadingTextSmall: {
    color: '#666',
    fontSize: 12,
    marginTop: 5,
  },
  pdfModalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  pdfModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  pdfModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#061B36',
  },
  pdfViewer: {
    flex: 1,
    width: width,
    height: height,
  },
});