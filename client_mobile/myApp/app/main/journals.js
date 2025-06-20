import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, FlatList, StyleSheet, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const journals = () => {
  const [activeTab, setActiveTab] = useState('New Journal');
  const [title, setTitle] = useState('');
  const [mood, setMood] = useState(null);
  const [thoughts, setThoughts] = useState('');
  const [shareWithCounselor, setShareWithCounselor] = useState(false);

  // Dummy data for journal history (replace with real data from API or storage)
  const journalHistory = [
    {
      id: '1',
      title: 'Finding Balance',
      mood: 'Optimistic',
      content: 'Today I found myself reflecting on the importance of the balance in my life. I\'ve been trying to juggle work with...',
      date: 'June 12, 2023 10:45 pm',
      hasAlert: true,
    },
    {
      id: '2',
      title: 'Finding Balance',
      mood: 'Anxious',
      content: 'Today I found myself reflecting on the importance of the balance in my life. I\'ve been trying to juggle work with...',
      date: 'June 12, 2023 10:45 pm',
      hasAlert: false,
    },
    {
      id: '3',
      title: 'Finding Balance',
      mood: 'Proud',
      content: 'Today I found myself reflecting on the importance of the balance in my life. I\'ve been trying to juggle work with...',
      date: 'June 12, 2023 10:45 pm',
      hasAlert: true,
    },
    {
      id: '4',
      title: 'Finding Balance',
      mood: 'Optimistic',
      content: 'Today I found myself reflecting on the importance of the balance in my life. I\'ve been trying to juggle work with...',
      date: 'June 12, 2023 10:45 pm',
      hasAlert: false,
    },
  ];

  const moodOptions = [
    { emoji: '😢', value: 'Sad' },
    { emoji: '😞', value: 'Low' },
    { emoji: '😐', value: 'Neutral' },
    { emoji: '🙂', value: 'Good' },
    { emoji: '😄', value: 'Great' },
  ];

  const handleSaveEntry = async () => {
    if (!title || !mood || !thoughts) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }
    if (title.length < 3) {
      Alert.alert('Error', 'Title must be at least 3 characters.');
      return;
    }

    const token = await AsyncStorage.getItem('token'); // Assuming token is stored as 'token'
    if (!token) {
      Alert.alert('Error', 'No token provided. Please log in again.');
      return;
    }

    try {
      const response = await fetch('https://your-api-base-url/users/journals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          explicitEmotion: mood,
          content: thoughts,
          shareStatus: shareWithCounselor, // Set to true if checked, false if unchecked
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save journal entry');
      }

      Alert.alert('Success', 'Journal entry created successfully');
      setTitle('');
      setMood(null);
      setThoughts('');
      setShareWithCounselor(false);
    } catch (error) {
      Alert.alert('Error', error.message || 'An error occurred while saving the entry');
    }
  };

  const renderJournalItem = ({ item }) => (
    <View style={styles.historyItem}>
      <Text style={styles.historyTitle}>{item.title}</Text>
      <Text style={styles.historyMood}>{item.mood}</Text>
      <Text style={styles.historyContent}>{item.content.substring(0, 50)}...</Text>
      <Text style={styles.historyDate}>{item.date}</Text>
      {item.hasAlert && (
        <View style={styles.alertIndicator}>
          <MaterialCommunityIcons name="alert" size={16} color="#fff" />
          <Text style={styles.alertText}>A</Text>
        </View>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Back Button and Title */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {/* Handle back navigation */}}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Journal</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'New Journal' && styles.activeTab]}
          onPress={() => setActiveTab('New Journal')}
        >
          <Text style={styles.tabText}>New Journal</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Journal History' && styles.activeTab]}
          onPress={() => setActiveTab('Journal History')}
        >
          <Text style={styles.tabText}>Journal History</Text>
        </TouchableOpacity>
      </View>

      {/* Content based on active tab */}
      {activeTab === 'New Journal' ? (
        <View style={styles.newJournalContainer}>
          <Text style={styles.sectionTitle}>New Journal Entry</Text>
          <Text style={styles.privacyText}>Private</Text>
          <TextInput
            style={styles.input}
            placeholder="Give your entry title"
            value={title}
            onChangeText={setTitle}
          />
          <Text style={styles.label}>How's your mood?</Text>
          <View style={styles.moodSelector}>
            {moodOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.moodOption, mood === option.value && styles.selectedMood]}
                onPress={() => setMood(option.value)}
              >
                <Text style={styles.moodEmoji}>{option.emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.label}>Your Thoughts</Text>
          <TextInput
            style={[styles.input, styles.thoughtsInput]}
            placeholder="Write about your day, thoughts, feelings..."
            value={thoughts}
            onChangeText={setThoughts}
            multiline
          />
          <View style={styles.shareContainer}>
            <TouchableOpacity onPress={() => setShareWithCounselor(!shareWithCounselor)}>
              <View style={styles.checkbox}>
                {shareWithCounselor && <View style={styles.checkboxInner} />}
              </View>
            </TouchableOpacity>
            <Text style={styles.shareText}>Share this thought with my counselor</Text>
          </View>
          {shareWithCounselor && (
            <View style={styles.alertIndicator}>
              <MaterialCommunityIcons name="alert" size={16} color="#fff" />
              <Text style={styles.alertText}>A</Text>
            </View>
          )}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => {/* Handle cancel */}}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveEntry}>
              <Text style={styles.buttonText}>Save Entry</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <FlatList
          data={journalHistory}
          renderItem={renderJournalItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.historyList}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3F2FD',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#fff',
    elevation: 1,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    color: '#000',
    fontWeight: 'bold',
  },
  newJournalContainer: {
    padding: 20,
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#003087',
  },
  privacyText: {
    fontSize: 12,
    color: '#666',
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  thoughtsInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#003087',
  },
  moodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  moodOption: {
    alignItems: 'center',
    padding: 5,
  },
  selectedMood: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
  },
  moodEmoji: {
    fontSize: 24,
  },
  shareContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxInner: {
    width: 12,
    height: 12,
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  shareText: {
    fontSize: 14,
    color: '#003087',
  },
  alertIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF4444',
    padding: 2,
    borderRadius: 10,
    position: 'absolute',
    right: 10,
    top: 10,
  },
  alertText: {
    color: '#fff',
    fontSize: 10,
    marginLeft: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    flex: 1,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  historyList: {
    padding: 10,
  },
  historyItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 1,
    position: 'relative',
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#003087',
  },
  historyMood: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  historyContent: {
    fontSize: 14,
    color: '#333',
    marginTop: 5,
  },
  historyDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
});

export default journals;