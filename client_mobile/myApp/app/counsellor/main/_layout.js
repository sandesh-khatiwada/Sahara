import React from 'react';
import { View, Text, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TabBarIcon = ({ name, color, size = 24 }) => {
  try {
    return <MaterialCommunityIcons name={name} size={size} color={color} />;
  } catch (error) {
    console.warn('TabBarIcon error:', error);
    return <View style={{ width: size, height: size, backgroundColor: color, borderRadius: size/2 }} />;
  }
};

export default function CounsellorMainLayout() {
  const insets = useSafeAreaInsets();
  
  const getTabBarIcon = (routeName) => ({ color, size }) => {
    let iconName;
    
    switch (routeName) {
      case 'home':
        iconName = 'view-dashboard';
        break;
      case 'requests':
        iconName = 'account-clock';
        break;
      case 'sessions':
        iconName = 'video';
        break;
      case 'history':
        iconName = 'history';
        break;
      case 'profile':
        iconName = 'account';
        break;
      default:
        iconName = 'circle';
    }
    
    return <TabBarIcon name={iconName} color={color} size={size} />;
  };
  
  try {
    return (
      <View style={{ flex: 1 }}>
        <StatusBar style="dark" />
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: '#007AFF',
            tabBarInactiveTintColor: '#666',
            tabBarStyle: {
              backgroundColor: '#fff',
              borderTopWidth: 1,
              borderTopColor: '#E0E0E0',
              height: Platform.select({
                ios: 85,
                android: 65,
                default: 65
              }),
              paddingBottom: Platform.select({
                ios: 25,
                android: 10,
                default: 10
              }),
              paddingTop: 8,
              ...Platform.select({
                ios: {
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: -2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                },
                android: {
                  elevation: 8,
                },
                web: {
                  boxShadow: '0 -2px 4px rgba(0,0,0,0.1)',
                },
              }),
            },
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: '600',
              marginTop: -2,
            },
            headerShown: false,
            tabBarHideOnKeyboard: Platform.OS === 'android',
            lazy: true,
          }}
        >
          <Tabs.Screen
            name="home"
            options={{ 
              title: 'Dashboard',
              tabBarIcon: getTabBarIcon('home')
            }}
          />
          <Tabs.Screen
            name="requests"
            options={{ 
              title: 'Requests',
              tabBarIcon: getTabBarIcon('requests')
            }}
          />
          <Tabs.Screen
            name="sessions"
            options={{ 
              title: 'Sessions',
              tabBarIcon: getTabBarIcon('sessions')
            }}
          />
          <Tabs.Screen
            name="history"
            options={{ 
              title: 'History',
              tabBarIcon: getTabBarIcon('history')
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{ 
              title: 'Profile',
              tabBarIcon: getTabBarIcon('profile')
            }}
          />
        </Tabs>
      </View>
    );
  } catch (error) {
    console.error('CounsellorMainLayout error:', error);
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' }}>
        <MaterialCommunityIcons name="alert-circle" size={48} color="#F44336" />
        <Text style={{ fontSize: 16, color: '#666', marginTop: 16, textAlign: 'center' }}>
          Navigation Error{'\n'}Please restart the app
        </Text>
      </View>
    );
  }
}
