import { Tabs, usePathname } from 'expo-router';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function MainLayout() {
  const pathname = usePathname();

  // List of paths where tab bar should be hidden
  const hideTabBarRoutes = ['/main/hello/hi'];

  const isTabBarVisible = !hideTabBarRoutes.includes(pathname);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          display: isTabBarVisible ? 'flex' : 'none', // Hide tab bar conditionally
          position: 'absolute',
          backgroundColor: '#E0F7FA',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          height: 70,
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarActiveTintColor: '#003087',
        tabBarInactiveTintColor: '#00308780',
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="journals"
        options={{
          title: 'Journal',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="notebook-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'AI Chat',
          tabBarButton: (props) => (
            <TouchableOpacity {...props} style={styles.chatButton}>
              <MaterialCommunityIcons name="robot-excited-outline" size={32} color="#fff" />
            </TouchableOpacity>
          ),
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="sessions"
        options={{
          title: 'Sessions',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          title: 'Statistics',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="emoticon-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  chatButton: {
    top: -15,
    backgroundColor: '#003087',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
});
