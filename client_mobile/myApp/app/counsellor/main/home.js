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
    clientName: 'Aayusha K.',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    type: 'Anxiety Counseling',
    date: 'Today',
    time: '10:00 AM',
  },
  {
    id: '2',
    clientName: 'John D.',
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    type: 'Depression Support',
    date: 'Today',
    time: '2:00 PM',
  },
];

const pendingRequests = [
  {
    id: '1',
    clientName: 'Sarah M.',
    avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
    issue: 'Stress Management',
    requestedTime: '3:00 PM Today',
  },
  {
    id: '2',
    clientName: 'Mike J.',
    avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
    issue: 'Relationship Issues',
    requestedTime: '4:00 PM Tomorrow',
  },
];

const CounsellorHeader = ({ counsellorData, onLogout }) => (
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
          onPress={() => router.push('/counsellor/main/notifications')}
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
      <Text style={styles.greeting}>Welcome Dr. {counsellorData?.fullName || 'Counsellor'} 👨‍⚕️</Text>
      <Text style={styles.message}>
        "Thank you for making a difference in people's lives. Your dedication helps heal hearts and minds. 💙"
      </Text>
    </View>
  </View>
);

const StatCard = ({ icon, title, value, color, onPress }) => (
  <TouchableOpacity style={[styles.statCard, { borderLeftColor: color }]} onPress={onPress}>
    <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
      <MaterialCommunityIcons name={icon} size={24} color={color} />
    </View>
    <View style={styles.statContent}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  </TouchableOpacity>
);

const SessionCard = ({ session }) => (
  <TouchableOpacity style={styles.sessionCard}>
    <Image source={{ uri: session.avatar }} style={styles.sessionAvatar} />
    <View style={styles.sessionDetails}>
      <Text style={styles.sessionClient}>{session.clientName}</Text>
      <Text style={styles.sessionType}>{session.type}</Text>
      <Text style={styles.sessionTime}>{session.date} • {session.time}</Text>
    </View>
    <TouchableOpacity style={styles.joinButton}>
      <MaterialCommunityIcons name="video" size={20} color="#fff" />
    </TouchableOpacity>
  </TouchableOpacity>
);

const RequestCard = ({ request }) => (
  <View style={styles.requestCard}>
    <Image source={{ uri: request.avatar }} style={styles.requestAvatar} />
    <View style={styles.requestDetails}>
      <Text style={styles.requestClient}>{request.clientName}</Text>
      <Text style={styles.requestIssue}>{request.issue}</Text>
      <Text style={styles.requestTime}>{request.requestedTime}</Text>
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
);

export default function CounsellorHome() {
  const [counsellorData, setCounsellorData] = useState(null);
  const [loadingCounsellor, setLoadingCounsellor] = useState(true);
  const [todayStats, setTodayStats] = useState({
    sessions: 5,
    newRequests: 3,
    totalClients: 24,
    revenue: '₹2,400'
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

//testing connection----




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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <CounsellorHeader counsellorData={counsellorData} onLogout={handleLogout} />
        <View style={styles.content}>
          {/* Today's Overview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Overview</Text>
            <View style={styles.statsContainer}>
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
            </View>
            <View style={styles.statsContainer}>
              <StatCard
                icon="account-group"
                title="Total Clients"
                value={todayStats.totalClients}
                color="#2196F3"
                onPress={() => router.push('/counsellor/main/clients')}
              />
              <StatCard
                icon="currency-inr"
                title="Today's Revenue"
                value={todayStats.revenue}
                color="#9C27B0"
                onPress={() => router.push('/counsellor/main/earnings')}
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
                <Text style={styles.seeAllText}>Manage All</Text>
              </TouchableOpacity>
            </View>
            {pendingRequests.map((request) => (
              <RequestCard key={request.id} request={request} />
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
                <MaterialCommunityIcons name="video-plus" size={32} color="#4CAF50" />
                <Text style={styles.quickActionText}>Start Session</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickActionCard}
                onPress={() => router.push('/counsellor/main/availability')}
              >
                <MaterialCommunityIcons name="calendar-edit" size={32} color="#2196F3" />
                <Text style={styles.quickActionText}>Set Availability</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickActionCard}
                onPress={() => router.push('/counsellor/main/notes')}
              >
                <MaterialCommunityIcons name="note-plus" size={32} color="#FF9800" />
                <Text style={styles.quickActionText}>Add Notes</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickActionCard}
                onPress={() => router.push('/counsellor/main/profile')}
              >
                <MaterialCommunityIcons name="account-edit" size={32} color="#9C27B0" />
                <Text style={styles.quickActionText}>Edit Profile</Text>
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
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 3px 3px rgba(0,0,0,0.1)',
      },
    }),
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
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 8px 4px rgba(0,0,0,0.08)',
      },
    }),
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
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0 8px 5px rgba(0,0,0,0.1)',
      },
    }),
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
    ...Platform.select({
      ios: {
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 4px 3px rgba(76,175,80,0.3)',
      },
    }),
  },
  requestCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 4px 3px rgba(0,0,0,0.1)',
      },
    }),
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
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 8px 4px rgba(0,0,0,0.08)',
      },
    }),
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

// Export the CounsellorHome component as default