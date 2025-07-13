import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// Sample data
const upcomingSessions = [
  {
    id: '1',
    clientName: 'Aayusha Karki',
    type: 'Anxiety Counseling',
    date: 'Today',
    time: '10:00 AM',
  },
  {
    id: '2',
    clientName: 'John Doe',
    type: 'Depression Support',
    date: 'Today',
    time: '2:00 PM',
  },
];

const pendingRequests = [
  {
    id: '1',
    clientName: 'Sarah Miller',
    issue: 'Stress Management',
    requestedTime: '3:00 PM Today',
  },
  {
    id: '2',
    clientName: 'Mike Johnson',
    issue: 'Relationship Issues',
    requestedTime: '4:00 PM Tomorrow',
  },
];

const CounsellorHeader = ({ counsellorData, onLogout }) => (
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
          <Text style={styles.brandSubtext}>Mental Health</Text>
        </View>
      </View>
      <View style={styles.headerActions}>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => router.push('/counsellor/main/profile')}
        >
          <View style={styles.profileContainer}>
            <Image 
              source={{ 
                uri: counsellorData?.profilePhoto || 'https://randomuser.me/api/portraits/women/8.jpg' 
              }} 
              style={styles.profilePhoto} 
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
          <Text style={styles.greeting}>Welcome Dr. {counsellorData?.fullName || 'Counsellor'}</Text>
          <Text style={styles.message}>
            "Thank you for making a difference in people's lives. Your dedication helps heal hearts and minds. 💙"
          </Text>
        </View>
      </View>
    </View>
  </View>
);

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
          <Text style={styles.sessionType}>{session.type}</Text>
          <Text style={styles.sessionTime}>{session.date} • {session.time}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.joinButton}>
        <MaterialCommunityIcons name="video" size={20} color="#fff" />
        <Text style={styles.joinButtonText}>Join</Text>
      </TouchableOpacity>
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
          <Text style={styles.requestIssue}>{request.issue}</Text>
          <Text style={styles.requestTime}>{request.requestedTime}</Text>
        </View>
      </View>
      <View style={styles.requestActions}>
        <TouchableOpacity style={styles.acceptButton}>
          <MaterialCommunityIcons name="check" size={18} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.rejectButton}>
          <MaterialCommunityIcons name="close" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

export default function CounsellorHome() {
  const [counsellorData, setCounsellorData] = useState(null);
  const [loadingCounsellor, setLoadingCounsellor] = useState(true);
  const [todayStats, setTodayStats] = useState({
    sessions: 5,
    newRequests: 3,
    totalClients: 24
  });

  useEffect(() => {
    (async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const parsedUserData = JSON.parse(userData);
          if (parsedUserData.role === 'Counsellor') {
            setCounsellorData(parsedUserData);
          }
        }
      } catch (error) {
        console.error('Error loading counsellor data:', error);
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
              // Clear all possible storage locations
              await AsyncStorage.removeItem('counsellorToken');
              await AsyncStorage.removeItem('counsellorData');
              await AsyncStorage.removeItem('user');
              await AsyncStorage.removeItem('token');
              router.replace('/auth/login');
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  if (loadingCounsellor) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Loading counsellor data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <CounsellorHeader counsellorData={counsellorData} onLogout={handleLogout} />
          <View style={styles.content}>
            {/* Today's Overview */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Today's Overview</Text>
              <View style={styles.statsGrid}>
                <StatCard
                  icon="calendar-check"
                  title="Sessions"
                  value={todayStats.sessions}
                  color="#4CAF50"
                  onPress={() => router.push('/counsellor/main/sessions')}
                />
                <StatCard
                  icon="account-plus"
                  title="New Requests"
                  value={todayStats.newRequests}
                  color="#FF9800"
                  onPress={() => router.push('/counsellor/main/requests')}
                />
                <StatCard
                  icon="account-group"
                  title="Total Clients"
                  value={todayStats.totalClients}
                  color="#2196F3"
                  onPress={() => router.push('/counsellor/main/clients')}
                />
              </View>
            </View>

            {/* Upcoming Sessions */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
                <TouchableOpacity onPress={() => router.push('/counsellor/main/sessions')}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              {upcomingSessions.slice(0, 2).map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </View>

            {/* Pending Requests */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Pending Requests</Text>
                <TouchableOpacity onPress={() => router.push('/counsellor/main/requests')}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              {pendingRequests.slice(0, 2).map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.quickActions}>
                <TouchableOpacity 
                  style={styles.quickActionCard}
                  onPress={() => router.push('/counsellor/main/availability')}
                >
                  <MaterialCommunityIcons name="calendar-clock" size={32} color="#007AFF" />
                  <Text style={styles.quickActionText}>Manage Availability</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.quickActionCard}
                  onPress={() => router.push('/counsellor/main/sessions')}
                >
                  <MaterialCommunityIcons name="video-plus" size={32} color="#4CAF50" />
                  <Text style={styles.quickActionText}>Schedule Session</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.quickActionCard}
                  onPress={() => router.push('/counsellor/main/profile')}
                >
                  <MaterialCommunityIcons name="account-cog" size={32} color="#FF9800" />
                  <Text style={styles.quickActionText}>Profile Settings</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.quickActionCard}
                  onPress={() => router.push('/counsellor/main/history')}
                >
                  <MaterialCommunityIcons name="chart-line" size={32} color="#9C27B0" />
                  <Text style={styles.quickActionText}>View Analytics</Text>
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
    backgroundColor: '#f8f9fa',
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
    color: '#1a1a1a',
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
    color: '#1a1a1a',
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
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -0.4,
  },
  seeAllText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 56) / 3,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 16,
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
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  statTitle: {
    fontSize: 12,
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
    color: '#1a1a1a',
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
  joinButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
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
    color: '#1a1a1a',
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
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  rejectButton: {
    backgroundColor: '#F44336',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F44336',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActions: {
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
    color: '#1a1a1a',
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 18,
    letterSpacing: -0.1,
  },
});