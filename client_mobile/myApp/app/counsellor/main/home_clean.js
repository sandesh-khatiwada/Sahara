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

// Shadow helper function
const getShadowStyle = (color, opacity, radius, elevation) => {
  if (Platform.OS === 'ios') {
    return {
      shadowColor: color,
      shadowOffset: {
        width: 0,
        height: radius / 2,
      },
      shadowOpacity: opacity,
      shadowRadius: radius,
    };
  } else {
    return {
      elevation: elevation,
    };
  }
};

// Mock data for development
const mockUpcomingSessions = [
  {
    id: '1',
    clientName: 'John D.',
    type: 'Individual Therapy',
    time: '2:00 PM',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
  },
  {
    id: '2',
    clientName: 'Sarah K.',
    type: 'Couples Therapy',
    time: '3:30 PM',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
  },
];

// Mock session requests
const mockSessionRequests = [
  {
    id: '1',
    clientName: 'Michael R.',
    requestedTime: '2:00 PM Today',
    issue: 'Anxiety Management',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
  },
  {
    id: '2',
    clientName: 'Emma L.',
    requestedTime: '4:00 PM Tomorrow',
    issue: 'Relationship Issues',
    avatar: 'https://randomuser.me/api/portraits/women/5.jpg',
  },
];

const CounsellorHeader = ({ counsellorData }) => (
  <View style={styles.header}>
    <StatusBar backgroundColor="#fff" barStyle="dark-content" />
    <View style={styles.headerTop}>
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../../assets/image/SaharaAppIcon.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <View style={styles.headerActions}>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => console.log('Notifications pressed')}
        >
          <MaterialCommunityIcons name="bell-outline" size={24} color="#003087" />
          <View style={styles.notificationBadge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => router.push('/counsellor/main/profile')}
        >
          <Image 
            source={{ 
              uri: counsellorData?.profilePhoto || 'https://randomuser.me/api/portraits/women/8.jpg' 
            }} 
            style={styles.profilePhoto} 
          />
        </TouchableOpacity>
      </View>
    </View>
    <View style={styles.separatorLine} />
    <View style={styles.greetingContainer}>
      <Text style={styles.greeting}>
        Hello, Dr. {counsellorData?.firstName || 'Sarah'}! 👋
      </Text>
      <Text style={styles.message}>
        You have {mockUpcomingSessions.length} sessions scheduled today
      </Text>
    </View>
  </View>
);

export default function CounsellorHome() {
  const [counsellorData, setCounsellorData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadCounsellorData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('counsellorData');
      if (storedData) {
        setCounsellorData(JSON.parse(storedData));
      }
    } catch (error) {
      console.error('Error loading counsellor data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCounsellorData();
  }, []);

  const handleAcceptRequest = (requestId) => {
    Alert.alert('Request Accepted', `Session request ${requestId} has been accepted.`);
  };

  const handleRejectRequest = (requestId) => {
    Alert.alert('Request Rejected', `Session request ${requestId} has been rejected.`);
  };

  const handleJoinSession = (sessionId) => {
    Alert.alert('Join Session', `Joining session ${sessionId}...`);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <CounsellorHeader counsellorData={counsellorData} />
        
        <View style={styles.content}>
          {/* Statistics Cards */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Overview</Text>
            <View style={styles.statsContainer}>
              <View style={[styles.statCard, { borderLeftColor: '#4CAF50' }]}>
                <View style={[styles.statIconContainer, { backgroundColor: '#E8F5E8' }]}>
                  <MaterialCommunityIcons name="calendar-check" size={20} color="#4CAF50" />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statValue}>8</Text>
                  <Text style={styles.statTitle}>Sessions</Text>
                </View>
              </View>
              
              <View style={[styles.statCard, { borderLeftColor: '#FF9800' }]}>
                <View style={[styles.statIconContainer, { backgroundColor: '#FFF3E0' }]}>
                  <MaterialCommunityIcons name="clock-outline" size={20} color="#FF9800" />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statValue}>3</Text>
                  <Text style={styles.statTitle}>Pending</Text>
                </View>
              </View>
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
            
            {mockUpcomingSessions.map((session) => (
              <View key={session.id} style={styles.sessionCard}>
                <Image source={{ uri: session.avatar }} style={styles.sessionAvatar} />
                <View style={styles.sessionDetails}>
                  <Text style={styles.sessionClient}>{session.clientName}</Text>
                  <Text style={styles.sessionType}>{session.type}</Text>
                  <Text style={styles.sessionTime}>{session.time}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.joinButton}
                  onPress={() => handleJoinSession(session.id)}
                >
                  <MaterialCommunityIcons name="video" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Session Requests */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Session Requests</Text>
              <TouchableOpacity onPress={() => router.push('/counsellor/main/requests')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            
            {mockSessionRequests.map((request) => (
              <View key={request.id} style={styles.requestCard}>
                <Image source={{ uri: request.avatar }} style={styles.requestAvatar} />
                <View style={styles.requestDetails}>
                  <Text style={styles.requestClient}>{request.clientName}</Text>
                  <Text style={styles.requestIssue}>{request.issue}</Text>
                  <Text style={styles.requestTime}>{request.requestedTime}</Text>
                </View>
                <View style={styles.requestActions}>
                  <TouchableOpacity 
                    style={styles.acceptButton}
                    onPress={() => handleAcceptRequest(request.id)}
                  >
                    <MaterialCommunityIcons name="check" size={18} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.rejectButton}
                    onPress={() => handleRejectRequest(request.id)}
                  >
                    <MaterialCommunityIcons name="close" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity 
                style={styles.quickActionCard}
                onPress={() => router.push('/counsellor/main/sessions')}
              >
                <MaterialCommunityIcons name="calendar-plus" size={32} color="#007AFF" />
                <Text style={styles.quickActionText}>Schedule Session</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickActionCard}
                onPress={() => router.push('/counsellor/main/history')}
              >
                <MaterialCommunityIcons name="history" size={32} color="#4CAF50" />
                <Text style={styles.quickActionText}>View History</Text>
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
                onPress={() => console.log('Reports pressed')}
              >
                <MaterialCommunityIcons name="chart-line" size={32} color="#9C27B0" />
                <Text style={styles.quickActionText}>Reports</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    paddingBottom: 100, // Space for mobile navigation
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 10,
    paddingBottom: 15,
    paddingHorizontal: 16,
    ...getShadowStyle('#000', 0.1, 3, 3),
    zIndex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoContainer: {
    flex: 1,
  },
  logo: {
    width: width * 0.3,
    height: 35,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#FF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  profileButton: {
    padding: 2,
  },
  profilePhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  separatorLine: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 10,
  },
  greetingContainer: {
    marginTop: 10,
  },
  greeting: {
    fontSize: width < 375 ? 18 : 20,
    fontWeight: 'bold',
    color: '#003087',
    marginBottom: 5,
    lineHeight: width < 375 ? 22 : 24,
  },
  message: {
    fontSize: width < 375 ? 12 : 14,
    color: '#666',
    lineHeight: width < 375 ? 16 : 18,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: width < 375 ? 18 : 20,
    fontWeight: 'bold',
    color: '#003087',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    ...getShadowStyle('#000', 0.08, 8, 4),
    minHeight: 80,
  },
  statIconContainer: {
    marginRight: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: width < 375 ? 20 : 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statTitle: {
    fontSize: width < 375 ? 10 : 12,
    color: '#666',
    marginTop: 2,
  },
  sessionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    ...getShadowStyle('#000', 0.1, 8, 5),
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  sessionAvatar: {
    width: width < 375 ? 45 : 50,
    height: width < 375 ? 45 : 50,
    borderRadius: width < 375 ? 22.5 : 25,
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#E8F5E8',
  },
  sessionDetails: {
    flex: 1,
    paddingRight: 8,
  },
  sessionClient: {
    fontSize: width < 375 ? 14 : 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  sessionType: {
    fontSize: width < 375 ? 12 : 14,
    color: '#666',
    marginBottom: 4,
  },
  sessionTime: {
    fontSize: width < 375 ? 11 : 12,
    color: '#4CAF50',
    fontWeight: '600',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  joinButton: {
    backgroundColor: '#4CAF50',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...getShadowStyle('#4CAF50', 0.3, 4, 3),
  },
  requestCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    ...getShadowStyle('#000', 0.1, 4, 3),
  },
  requestAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 15,
  },
  requestDetails: {
    flex: 1,
  },
  requestClient: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  requestIssue: {
    fontSize: 14,
    color: '#666',
    marginVertical: 2,
  },
  requestTime: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '600',
  },
  requestActions: {
    flexDirection: 'row',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  rejectButton: {
    backgroundColor: '#F44336',
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickActionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: (width - 44) / 2, // Responsive width accounting for padding and gap
    minHeight: 100,
    alignItems: 'center',
    justifyContent: 'center',
    ...getShadowStyle('#000', 0.08, 8, 4),
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  quickActionText: {
    fontSize: width < 375 ? 12 : 14,
    color: '#333',
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 18,
  },
});
