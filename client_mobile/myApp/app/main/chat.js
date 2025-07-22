import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from 'expo-router';
import { API_BASE_URL } from '@env';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoadingAIResponse, setIsLoadingAIResponse] = useState(false);
  const [forceLayout, setForceLayout] = useState(false); // Added to force layout reset
  const flatListRef = useRef(null);
  const navigation = useNavigation();

  const scrollToBottom = useCallback(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
      console.log('Scrolled to bottom');
    } else {
      console.log('FlatList ref not ready');
    }
  }, []);

  const fetchChatHistory = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/users/chat-history`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        const formattedMessages = data.data.flatMap(item => [
          {
            id: item._id + '-prompt',
            text: item.prompt,
            sender: 'user',
            timestamp: item.timestamp,
          },
          {
            id: item._id + '-response',
            text: item.aiResponse,
            sender: 'ai',
            timestamp: item.timestamp,
          },
        ]);
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.log('Fetch history error:', error);
    }
  };

  useEffect(() => {
    const loadChatHistory = async () => {
      await fetchChatHistory();
      const attemptScroll = (attempt = 1) => {
        if (attempt > 2) return;
        setTimeout(() => {
          if (messages.length > 0) {
            scrollToBottom();
          } else {
            console.log(`Retry scroll attempt ${attempt}: No messages yet`);
            attemptScroll(attempt + 1);
          }
        }, attempt * 150);
      };
      attemptScroll();
    };
    loadChatHistory();
  }, [scrollToBottom]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const keyboardDidHide = Keyboard.addListener('keyboardDidHide', () => {
      console.log('Keyboard dismissed, resetting layout');
      setForceLayout(prev => !prev); // Toggle to force re-render
      scrollToBottom();
    });

    return () => {
      keyboardDidHide.remove();
    };
  }, [scrollToBottom]);

  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim()) return;
    const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    const userMessage = {
      id: `user-${Date.now()}`,
      text: inputText.trim(),
      sender: 'user',
      timestamp: now,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    Keyboard.dismiss();
    setIsLoadingAIResponse(true);

    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/users/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt: userMessage.text }),
      });

      const data = await response.json();
      if (response.ok) {
        const aiMessage = {
          id: `ai-${Date.now()}`,
          text: data.data.aiResponse,
          sender: 'ai',
          timestamp: now,
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.log('Error sending prompt:', error);
    } finally {
      setIsLoadingAIResponse(false);
    }
  }, [inputText]);

  const renderMessage = ({ item }) => {
    if (!item?.id || typeof item.text !== 'string') return null;

    const isUser = item.sender === 'user';
    return (
      <View style={[styles.messageBubbleContainer, isUser ? styles.userContainer : styles.aiContainer]}>
        {!isUser && (
          <View style={styles.aiIconPlaceholder}>
            <Text style={styles.aiIconText}>🧠</Text>
          </View>
        )}
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
          <Text style={isUser ? styles.userMessageText : styles.aiMessageText}>
            {item.text}
          </Text>
        </View>
        {isUser && (
          <View style={styles.userAvatarPlaceholder}>
            <Text style={styles.userAvatarText}>👤</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0} // Reduced to minimize margin
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Sahara</Text>
            <View style={{ width: 24 }} />
          </View>

          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messageListContent}
            keyboardShouldPersistTaps="handled"
            maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
            onContentSizeChange={scrollToBottom}
          />

          {isLoadingAIResponse && (
            <View style={styles.aiLoadingContainer}>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={{ marginLeft: 10, color: '#333' }}>AI is thinking...</Text>
            </View>
          )}

          <View
            style={styles.inputContainer}
            onLayout={(e) => console.log('Input container position:', e.nativeEvent.layout)} // Added for debugging
            key={forceLayout ? 'layout1' : 'layout2'} // Force re-render on keyboard dismiss
          >
            <TextInput
              style={styles.textInput}
              placeholder="Ask anything..."
              placeholderTextColor="#999"
              value={inputText}
              onChangeText={setInputText}
              multiline
              onSubmitEditing={handleSendMessage}
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
              <Text style={styles.sendButtonText}>↵</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E0E7ED',
  },
  container: {
    flex: 1,
    backgroundColor: '#E0E7ED',
    // Removed marginTop: 30 to avoid layout interference
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#D8E0E8',
    borderBottomWidth: 1,
    borderBottomColor: '#CCC',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    flex: 1,
  },
  messageListContent: {
    paddingBottom: 20,
    paddingHorizontal: 15,
  },
  messageBubbleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 5,
    maxWidth: '80%',
  },
  userContainer: {
    alignSelf: 'flex-end',
    marginLeft: 'auto',
    flexDirection: 'row-reverse',
  },
  aiContainer: {
    alignSelf: 'flex-start',
    marginRight: 'auto',
  },
  messageBubble: {
    padding: 14,
    borderRadius: 16,
    marginVertical: 4,
    maxWidth: '80%',
    elevation: 2,
  },
  userBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 2,
    marginRight: 8,
  },
  aiBubble: {
    backgroundColor: '#F0F0F0',
    borderBottomLeftRadius: 2,
    marginLeft: 8,
  },
  userMessageText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  aiMessageText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  userAvatarPlaceholder: {
    width: 30,
    height: 30,
    margin: 5,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#CCC',
    backgroundColor: '#DDD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    fontSize: 18,
  },
  aiIconPlaceholder: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#D3D3D3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CCC',
  },
  aiIconText: {
    fontSize: 18,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    fontSize: 16,
    color: '#333',
  },
  sendButton: {
    backgroundColor: '#2C3E50',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendButtonText: {
    color: '#FFF',
    fontSize: 20,
  },
  aiLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
});

export default ChatPage;
