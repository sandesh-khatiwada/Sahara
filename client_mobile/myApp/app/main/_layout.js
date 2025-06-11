import React from 'react';
import { Tabs } from 'expo-router';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function MainLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: '#E0F7FA', // Adjusted to match the light blue from the image
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          height: 70, // Adjusted to match the image height
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarActiveTintColor: '#003087', // Darker blue to match the image
        tabBarInactiveTintColor: '#00308780', // Slightly transparent version of active color
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
            <TouchableOpacity
              {...props}
              style={styles.chatButton}
            >
              <MaterialCommunityIcons name="robot-excited-outline" size={32} color="#fff" />
            </TouchableOpacity>
          ),
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
        name="mood"
        options={{
          title: 'Mood',
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
    top: -15, // Adjusted to match the image's elevation
    backgroundColor: '#003087', // Adjusted to match the dark blue from the image
    width: 56, // Adjusted to match the image
    height: 56, // Adjusted to match the image
    borderRadius: 28, // Half of width/height for a perfect circle
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3, // Reduced elevation to match the image
  },
});