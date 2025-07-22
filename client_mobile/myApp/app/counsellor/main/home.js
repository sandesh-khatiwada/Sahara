import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavbar } from './_layout';
import { API_BASE_URL } from '@env';

const { width } = Dimensions.get('window');

// Default fallback image
const DEFAULT_PROFILE_IMAGE = 'https://randomuser.me/api/portraits/women/8.jpg';

// Utility to format date (e.g., "2025-07-22" to "Today" or "Jul 22, 2025")
const formatDate = (dateStr) => {
  const today = new Date();
  const date = new Date(dateStr);
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
  if (isToday) return 'Today';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Utility to format time (e.g., "15:00:00" to "3:00 PM")
const formatTime = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const adjustedHours = hours % 12 || 12;
  return `${adjustedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

// Utility to format currency (e.g., 5000 to "$5,000")
const formatCurrency = (amount) => {
  return `$${amount.toLocaleString('en-US')}`;
};

const CounsellorHeader = ({ profileInfo, onLogout }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const getProfileImageUri = () => {
    if (imageError) return DEFAULT_PROFILE_IMAGE;
    if (profileInfo?.profilePhoto?.path) {
      return `${API_BASE_URL}/uploads/profile_photos/${profileInfo.profilePhoto.filename}`;
    }
    return DEFAULT_PROFILE_IMAGE;
  };

  return (
    <View style={styles.header}>
      <StatusBar backgroundColor="transparent" barStyle="dark-content" />
      <View style={styles.headerTop}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/image/SaharaAppIcon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.brandContainer}>
            <Text style={styles.brandText}>Sahara</Text>
            <Text style={styles.brandSubtext}>Mental Health Support</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push('/counsellor/main/profile')}
          >
            <View style={styles.profileContainer}>
              {imageLoading && (
                <View style={[styles.profilePhoto, styles.loadingContainer]}>
                  <ActivityIndicator size="small" color="#007AFF" />
                </View>
              )}
              <Image
                source={{ uri: getProfileImageUri() }}
                style={[styles.profilePhoto, imageLoading && { opacity: 0 }]}
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageError(true);
                  setImageLoading(false);
                }}
                onLoadStart={() => setImageLoading(true)}
                defaultSource={{ uri: DEFAULT_PROFILE_IMAGE }}
              />
              <View style={styles.onlineIndicator} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.separatorLine} />
      <View style={styles.greetingContainer}>
        <View style={styles.greetingContent}>
          <View style={styles.greetingIcon}>
            <MaterialCommunityIcons name="hand-wave" size={24} color="#FF9800" />
          </View>
          <View style={styles.greetingText}>
            <Text style={styles.greeting}>Welcome Dr. {profileInfo?.fullName || 'Counsellor'}</Text>
            <Text style={styles.message}>
              "Thank you for making a difference in people's lives. Your dedication helps heal hearts and minds. 💙"
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const StatCard = ({ icon, title, value, color, onPress }) => (
  <TouchableOpacity style={styles.statCard} onPress={onPress}>
    <View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}>
      <MaterialCommunityIcons name={icon} size={28} color={color} />
    </View>
    <View style={styles.statContent}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
    <View style={styles.statArrow}>
      <MaterialCommunityIcons name="chevron-right" size={20} color={color} />
    </View>
  </TouchableOpacity>
);

const SessionCard = ({ session }) => (
  <View style={styles.sessionCard}>
    <View style={styles.sessionHeader}>
      <View style={styles.sessionClientInfo}>
        <View style={styles.sessionAvatar}>
          <MaterialCommunityIcons name="account" size={20} color="#007AFF" />
        </View>
        <View style={styles.sessionDetails}>
          <Text style={styles.sessionClient}>{session.clientName}</Text>
          <Text style={styles.sessionType}>{session.type || 'General Counseling'}</Text>
          <Text style={styles.sessionTime}>{session.date} • {session.time}</Text>
        </View>
      </View>
    </View>
  </View>
);

const RequestCard = ({ request }) => (
  <View style={styles.requestCard}>
    <View style={styles.requestHeader}>
      <View style={styles.requestClientInfo}>
        <View style={styles.requestAvatar}>
          <MaterialCommunityIcons name="account-heart" size={18} color="#E91E63" />
        </View>
        <View style={styles.requestDetails}>
          <Text style={styles.requestClient}>{request.clientName}</Text>
          <Text style={styles.requestIssue}>{request.issue || 'General Counseling'}</Text>
          <Text style={styles.requestTime}>{request.requestedTime}</Text>
        </View>
      </View>
    </View>
  </View>
);

export default function CounsellorHome() {
  const [counsellorData, setCounsellorData] = useState(null);
  const [profileInfo, setProfileInfo] = useState(null);
  const [loadingCounsellor, setLoadingCounsellor] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [totalStats, setTotalStats] = useState({
    completedSessions: 0,
    pendingSessions: 0,
    totalRevenue: 0,
    totalClients: 0,
  });
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
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

  const fetchProfileInfo = async (token) => {
    try {
      setLoadingProfile(true);
      const res = await fetch(`${API_BASE_URL}/api/counsellors/profile-info`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const json = await res.json();
      if (json.success && json.data) {
        setProfileInfo(json.data);
      } else {
        throw new Error(json.message || 'Failed to load profile information');
      }
    } catch (err) {
      console.error('Fetch profile info error:', err.message);
      setError(`Failed to load profile information: ${err.message}`);
      if (err.message.includes('Unauthorized') || err.message.includes('Invalid token')) {
        Alert.alert(
          'Authentication Error',
          'Your session is invalid. Please login again.',
          [{ text: 'OK', onPress: () => router.replace('/auth/login') }]
        );
      }
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchTotalStats = async (token) => {
    try {
      setLoadingStats(true);
      const res = await fetch(`${API_BASE_URL}/api/counsellors/total-statistics`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const json = await res.json();
      if (json.success && json.data) {
        setTotalStats({
          completedSessions: json.data.completedSessions || 0,
          pendingSessions: json.data.pendingSessions || 0,
          totalRevenue: json.data.totalRevenue || 0,
          totalClients: json.data.totalClients || 0,
        });
      } else {
        throw new Error(json.message || 'Failed to load total statistics');
      }
    } catch (err) {
      console.error('Fetch total stats error:', err.message);
      setError(`Failed to load total statistics: ${err.message}`);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchUpcomingSessions = async (token) => {
    try {
      setLoadingSessions(true);
      const res = await fetch(`${API_BASE_URL}/api/counsellors/sessions`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const json = await res.json();
      if (json.success && json.data) {
        const formattedSessions = json.data
          .filter((session) => session.status === 'accepted')
          .slice(0, 2)
          .map((session) => ({
            id: session._id,
            clientName: session.user.fullName,
            type: session.noteTitle || 'General Counseling',
            date: formatDate(session.date),
            time: formatTime(session.time),
          }));
        setUpcomingSessions(formattedSessions);
      } else {
        throw new Error(json.message || 'Failed to load sessions');
      }
    } catch (err) {
      console.error('Fetch sessions error:', err.message);
      setError(`Failed to load sessions: ${err.message}`);
    } finally {
      setLoadingSessions(false);
    }
  };

  const fetchPendingRequests = async (token) => {
    try {
      setLoadingRequests(true);
      const res = await fetch(`${API_BASE_URL}/api/counsellors/bookings-requests`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const json = await res.json();
      if (json.success && json.data) {
        const formattedRequests = json.data
          .filter((request) => request.status === 'pending')
          .map((request) => ({
            id: request._id,
            clientName: request.user.fullName,
            issue: request.noteTitle || 'General Counseling',
            requestedTime: `${formatDate(request.date)} • ${formatTime(request.time)}`,
          }));
        setPendingRequests(formattedRequests);
      } else {
        throw new Error(json.message || 'Failed to load pending requests');
      }
    } catch (err) {
      console.error('Fetch pending requests error:', err.message);
      setError(`Failed to load pending requests: ${err.message}`);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        const token = await AsyncStorage.getItem('token');

        if (userData && token) {
          const parsedUserData = JSON.parse(userData);

          if (parsedUserData.role === 'Counsellor' && parsedUserData.token) {
            const counsellorInfo = parsedUserData.Counsellor || parsedUserData;
            setCounsellorData(counsellorInfo);

            // Fetch data after counsellor data is loaded
            await Promise.all([
              fetchProfileInfo(token),
              fetchTotalStats(token),
              fetchUpcomingSessions(token),
              fetchPendingRequests(token),
            ]);
          } else {
            Alert.alert(
              'Access Denied',
              'You need to login as a counsellor to access this area.',
              [{ text: 'OK', onPress: () => router.replace('/auth/login') }]
            );
            return;
          }
        } else {
          Alert.alert(
            'Authentication Required',
            'Please login to continue.',
            [{ text: 'OK', onPress: () => router.replace('/auth/login') }]
          );
          return;
        }
      } catch (error) {
        console.error('Error loading counsellor data:', error);
        Alert.alert(
          'Error',
          'Failed to load user data. Please login again.',
          [{ text: 'OK', onPress: () => router.replace('/auth/login') }]
        );
      } finally {
        setLoadingCounsellor(false);
      }
    })();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('counsellorToken');
              await AsyncStorage.removeItem('counsellorData');
              await AsyncStorage.removeItem('user');
              await AsyncStorage.removeItem('token');
              router.replace('/auth/login');
              Alert.alert('Success', 'You have been logged out successfully.');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (loadingCounsellor || loadingProfile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={{ marginTop: 16, fontSize: 16, color: '#666', fontWeight: '500' }}>
            Verifying authentication...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!counsellorData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
          <MaterialCommunityIcons name="account-alert" size={48} color="#F44336" />
          <Text style={{ marginTop: 16, fontSize: 16, color: '#666', textAlign: 'center', fontWeight: '500' }}>
            Authentication required{'\n'}Redirecting to login...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 20 }]}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <CounsellorHeader profileInfo={profileInfo} onLogout={handleLogout} />
          <View style={styles.content}>
            {/* Total Overview */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Total Overview</Text>
              {loadingStats ? (
                <View style={styles.loadingSection}>
                  <ActivityIndicator size="small" color="#007AFF" />
                  <Text style={styles.loadingText}>Loading statistics...</Text>
                </View>
              ) : error ? (
                <View style={styles.errorSection}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : (
                <View style={styles.statsGrid}>
                  <StatCard
                    icon="calendar-check"
                    title="Completed Sessions"
                    value={totalStats.completedSessions}
                    color="#4CAF50"
                    onPress={() => router.push('/counsellor/main/sessions')}
                  />
                  <StatCard
                    icon="account-plus"
                    title="Pending Requests"
                    value={totalStats.pendingSessions}
                    color="#FF9800"
                    onPress={() => router.push('/counsellor/main/requests')}
                  />
                  <StatCard
                    icon="currency-inr"
                    title="Total Revenue"
                    value={formatCurrency(totalStats.totalRevenue)}
                    color="#2196F3"
                  />
                  <StatCard
                    icon="account-group"
                    title="Total Clients"
                    value={totalStats.totalClients}
                    color="#9C27B0"
                
                  />
                </View>
              )}
            </View>

            {/* Upcoming Sessions */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
                <TouchableOpacity onPress={() => router.push('/counsellor/main/sessions')}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              {loadingSessions ? (
                <View style={styles.loadingSection}>
                  <ActivityIndicator size="small" color="#007AFF" />
                  <Text style={styles.loadingText}>Loading sessions...</Text>
                </View>
              ) : error ? (
                <View style={styles.errorSection}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : upcomingSessions.length === 0 ? (
                <View style={styles.emptySection}>
                  <MaterialCommunityIcons name="calendar-blank" size={32} color="#666" />
                  <Text style={styles.emptyText}>No upcoming sessions</Text>
                </View>
              ) : (
                upcomingSessions.slice(0, 2).map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))
              )}
            </View>

            {/* Pending Requests */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Pending Requests</Text>
                <TouchableOpacity onPress={() => router.push('/counsellor/main/requests')}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              {loadingRequests ? (
                <View style={styles.loadingSection}>
                  <ActivityIndicator size="small" color="#007AFF" />
                  <Text style={styles.loadingText}>Loading requests...</Text>
                </View>
              ) : error ? (
                <View style={styles.errorSection}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : pendingRequests.length === 0 ? (
                <View style={styles.emptySection}>
                  <MaterialCommunityIcons name="email-off" size={32} color="#666" />
                  <Text style={styles.emptyText}>No pending requests</Text>
                </View>
              ) : (
                pendingRequests.slice(0, 2).map((request) => (
                  <RequestCard key={request.id} request={request} />
                ))
              )}
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.quickActions}>
                <TouchableOpacity
                  style={styles.quickActionCard}
                  onPress={() => router.push('/counsellor/settings/availability')}
                >
                  <MaterialCommunityIcons name="calendar-clock" size={32} color="#007AFF" />
                  <Text style={styles.quickActionText}>Manage Availability</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickActionCard}
                  onPress={() => router.push('/counsellor/main/sessions?filter=today')}
                >
                  <MaterialCommunityIcons name="video-plus" size={32} color="#4CAF50" />
                  <Text style={styles.quickActionText}>Scheduled Sessions</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8ff',
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
    marginTop: Platform.OS === 'android' ? 35 : 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(224, 224, 224, 0.3)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 36,
    height: 36,
    marginRight: 12,
  },
  brandContainer: {
    alignItems: 'flex-start',
  },
  brandText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#003087',
    letterSpacing: -0.3,
  },
  brandSubtext: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginTop: -2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileButton: {
    marginLeft: 16,
  },
  profileContainer: {
    position: 'relative',
  },
  profilePhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    position: 'absolute',
    zIndex: 1,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
  },
  separatorLine: {
    height: 1,
    backgroundColor: 'rgba(224, 224, 224, 0.5)',
    marginVertical: 8,
  },
  greetingContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
    borderRadius: 16,
    marginTop: 8,
  },
  greetingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greetingIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  greetingText: {
    flex: 1,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '700',
    color: '#061B36',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  message: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#003087',
    letterSpacing: -0.4,
  },
  seeAllText: {
    color: '#8C58FF',
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 52) / 2, // Adjusted for two cards per row
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    minHeight: 80,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 23,
    fontWeight: '700',
    color: '#061B36',
    letterSpacing: -0.5,
  },
  statTitle: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
    fontWeight: '500',
  },
  statArrow: {
    marginLeft: 8,
  },
  sessionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 18,
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
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
    color: '#061B36',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  sessionType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  sessionTime: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  requestCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestClientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  requestAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(233, 30, 99, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  requestDetails: {
    flex: 1,
  },
  requestClient: {
    fontSize: 16,
    fontWeight: '700',
    color: '#061B36',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  requestIssue: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  requestTime: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '600',
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  quickActions: {
    marginTop: 15,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 18,
    width: (width - 52) / 2,
    minHeight: 100,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: 14,
    color: '#061B36',
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 18,
    letterSpacing: -0.1,
  },
  loadingSection: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontWeight: '500',
  },
  errorSection: {
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#F44336',
    textAlign: 'center',
    fontWeight: '500',
  },
  emptySection: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontWeight: '500',
  },
});