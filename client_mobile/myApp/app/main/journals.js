import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { API_BASE_URL } from '@env';

const journals = () => {
  const [activeTab, setActiveTab] = useState('New Journal');
  const [title, setTitle] = useState('');
  const [mood, setMood] = useState(null);
  const [thoughts, setThoughts] = useState('');
  const [shareWithCounselor, setShareWithCounselor] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [journalHistory, setJournalHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // NEW STATES FOR MODAL
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const moodOptions = [
    { emoji: '😢', value: 'Bad' },
    { emoji: '😞', value: 'Low' },
    { emoji: '😐', value: 'Neutral' },
    { emoji: '🙂', value: 'Good' },
    { emoji: '😄', value: 'Great' },
  ];

  const fetchJournalHistory = async () => {
    try {
      setLoadingHistory(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'No token found. Please log in again.');
        router.replace('/auth/login');
        return;
      }
      const res = await fetch(`${API_BASE_URL}/api/users/journals`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch journal history.');

      setJournalHistory(data.data);
    } catch (err) {
      Alert.alert('Error', err.message || 'Error fetching journal history');
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchJournalHistory();
  }, []);

  const handleSaveEntry = async () => {
    if (!title || !mood || !thoughts) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }
    if (title.length < 3) {
      Alert.alert('Error', 'Title must be at least 3 characters.');
      return;
    }

    const token = await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert('Error', 'No token provided. Please log in again.');
      router.replace('/auth/login');
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch(`${API_BASE_URL}/api/users/journals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          explicitEmotion: mood,
          content: thoughts,
          shareStatus: shareWithCounselor,
        }),
      });

      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.message || 'Failed to save journal entry');

      // Extract predictedEmotion and confidenceScore, format as requested
      const predictedEmotion = responseData.data.predictedEmotion;
      const confidenceScore = (responseData.data.confidenceScore * 100).toFixed(2);
      const capitalizedEmotion = predictedEmotion.charAt(0).toUpperCase() + predictedEmotion.slice(1);
      Alert.alert(
        'Journal Saved Successfully!',
        `Detected Emotion: ${capitalizedEmotion}\nConfidence Score: ${confidenceScore}%`
      );

      setTitle('');
      setMood(null);
      setThoughts('');
      setShareWithCounselor(false);
      fetchJournalHistory();
      setActiveTab('Journal History');
    } catch (error) {
      Alert.alert('Error', error.message || 'An error occurred while saving the entry');
    } finally {
      setIsSaving(false);
    }
  };

  const renderJournalItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedJournal(item);
        setIsModalVisible(true);
      }}
      style={styles.historyItem}
    >
      <Text style={styles.historyTitle}>{item.title}</Text>
      <Text style={styles.historyMood}>Mood: {item.explicitEmotion}</Text>
      <Text style={styles.historyContent}>
        {item.content.length > 50 ? item.content.slice(0, 50) + '...' : item.content}
      </Text>
      <Text style={styles.historyDate}>{item.date} at {item.time}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Journal</Text>
      </View>

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

      {activeTab === 'New Journal' ? (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled" style={{ flex: 1 }}>
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
                <View style={styles.checkbox}>{shareWithCounselor && <View style={styles.checkboxInner} />}</View>
              </TouchableOpacity>
              <Text style={styles.shareText}>Share this with my counselor</Text>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => {}}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveEntry} disabled={isSaving}>
                <Text style={styles.buttonText}>{isSaving ? 'Saving...' : 'Save Entry'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      ) : loadingHistory ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={journalHistory}
          renderItem={renderJournalItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.historyList}
          style={{ flex: 1 }}
        />
      )}

      {/* MODAL FOR JOURNAL DETAIL */}
      {selectedJournal && (
        <Modal
          visible={isModalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Text style={styles.modalCancel}>Close</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{selectedJournal.title}</Text>
              <View style={{ width: 60 }} />
            </View>
            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalLabel}>Mood:</Text>
              <Text style={styles.modalValue}>{selectedJournal.explicitEmotion}</Text>
              <Text style={styles.modalLabel}>Journal:</Text>
              <Text style={styles.modalValue}>{selectedJournal.content}</Text>
              <Text style={styles.modalLabel}>Date:</Text>
              <Text style={styles.modalValue}>{selectedJournal.date} at {selectedJournal.time}</Text>
            </ScrollView>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3F2FD' },
  header: {
    marginTop: 37,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    elevation: 2,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 10 },
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
  activeTab: { backgroundColor: '#007AFF' },
  tabText: { color: '#000', fontWeight: 'bold' },
  newJournalContainer: {
    padding: 20,
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 10,
    elevation: 2,
    height: 635,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#003087' },
  privacyText: { fontSize: 12, color: '#666', alignSelf: 'flex-end', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 20, fontSize: 16 },
  thoughtsInput: { height: 100, textAlignVertical: 'top' },
  label: { fontSize: 16, marginBottom: 5, color: '#003087' },
  moodSelector: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  moodOption: { alignItems: 'center', padding: 5 },
  selectedMood: { backgroundColor: '#007AFF', borderRadius: 10 },
  moodEmoji: { fontSize: 24 },
  shareContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  checkbox: {
    width: 20, height: 20, borderWidth: 1, borderColor: '#ccc', borderRadius: 4, justifyContent: 'center', alignItems: 'center', marginRight: 10,
  },
  checkboxInner: { width: 12, height: 12, backgroundColor: '#007AFF', borderRadius: 2 },
  shareText: { fontSize: 14, color: '#003087' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  cancelButton: { backgroundColor: '#ccc', padding: 10, borderRadius: 5, flex: 1, marginRight: 10 },
  saveButton: { backgroundColor: '#007AFF', padding: 10, borderRadius: 5, flex: 1 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  historyList: { marginBottom: 70, padding: 10 },
  historyItem: { backgroundColor: '#fff', padding: 15, marginBottom: 10, borderRadius: 10, elevation: 1 },
  historyTitle: { fontSize: 16, fontWeight: 'bold', color: '#003087' },
  historyMood: { fontSize: 14, color: '#666', marginTop: 5 },
  historyContent: { fontSize: 14, color: '#333', marginTop: 5 },
  historyDate: { fontSize: 12, color: '#666', marginTop: 5 },
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, borderBottomWidth: 1, borderBottomColor: '#E0E0E0',
    marginTop: Platform.OS === 'ios' ? 20 : 0,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#003087' },
  modalCancel: { fontSize: 16, color: '#007AFF', fontWeight: '600' },
  modalContent: { flex: 1, padding: 20 },
  modalLabel: { fontSize: 18, fontWeight: 'bold', marginTop: 20, color: '#003087' },
  modalValue: { fontSize: 16, color: '#555', marginTop: 4, fontWeight: 'bold' },
});

export default journals;