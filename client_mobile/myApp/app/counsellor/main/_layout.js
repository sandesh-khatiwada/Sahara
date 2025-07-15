import React, { createContext, useContext, useState, useEffect } from 'react';
import { View, Text, Platform, Animated } from 'react-native';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Create context for navbar visibility
const NavbarContext = createContext({
  isVisible: true,
  setIsVisible: () => {},
  hideNavbar: () => {},
  showNavbar: () => {},
});

export const useNavbar = () => useContext(NavbarContext);

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
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [navbarAnimation] = useState(new Animated.Value(1));
  
  const hideNavbar = () => {
    if (isNavbarVisible) {
      setIsNavbarVisible(false);
      Animated.timing(navbarAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };
  
  const showNavbar = () => {
    if (!isNavbarVisible) {
      setIsNavbarVisible(true);
      Animated.timing(navbarAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };
  
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
      <NavbarContext.Provider value={{ 
        isVisible: isNavbarVisible, 
        setIsVisible: setIsNavbarVisible, 
        hideNavbar, 
        showNavbar 
      }}>
        <View style={{ flex: 1 }}>
          <StatusBar style="dark" />
          <Tabs
            screenOptions={{
              tabBarActiveTintColor: '#003087',
              tabBarInactiveTintColor: '#00308780',
              tabBarStyle: [
                {
                  position: 'absolute',
                  backgroundColor: 'rgba(224, 231, 250, 0.9)', // Glass morphism background
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  borderTopWidth: 0,
                  height: Platform.select({
                    ios: 85,
                    android: 70,
                    default: 70
                  }),
                  paddingBottom: Platform.select({
                    ios: 25,
                    android: 5,
                    default: 5
                  }),
                  paddingTop: 5,
                  backdropFilter: 'blur(20px)', // Glass morphism blur effect
                  ...Platform.select({
                    ios: {
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: -2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 10,
                    },
                    android: {
                      elevation: 12,
                    },
                    web: {
                      boxShadow: '0 -2px 20px rgba(0,0,0,0.1)',
                      backdropFilter: 'blur(20px)',
                    },
                  }),
                },
                {
                  transform: [
                    {
                      translateY: navbarAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [100, 0],
                      }),
                    },
                  ],
                },
              ],
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
      </NavbarContext.Provider>
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
