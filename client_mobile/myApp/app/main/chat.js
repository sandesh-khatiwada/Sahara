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
  Animated,
} from 'react-native';
import { useNavigation } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ChatPage = () => {
  const [messages, setMessages] = useState([
    { id: '1', text: 'Hello! How can I help you today?', sender: 'ai', timestamp: '21:30', date: new Date().toISOString() },
    { id: '2', text: 'Hi Sahara AI, I have a question.', sender: 'user', timestamp: '21:31', date: new Date().toISOString() },
    { id: '3', text: 'Please ask away! I\'m here to assist.', sender: 'ai', timestamp: '21:32', date: new Date().toISOString() },
    { id: '4', text: 'Today 21:33', isTimestamp: true, date: new Date().toISOString() },
    { id: '5', text: 'What is the weather like in Kathmandu?', sender: 'user', timestamp: '21:33', date: new Date().toISOString() },
    { id: '6', text: 'What is the weather like in Kathmandu?', sender: 'user', timestamp: '21:33', date: new Date().toISOString() },
    { id: '7', text: 'What is the weather like in Kathmandu?', sender: 'user', timestamp: '21:33', date: new Date().toISOString() },
    { id: '8', text: 'What is the weather like in Kathmandu?', sender: 'user', timestamp: '00:33', date: new Date().toISOString() },
  ]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef(null);
  const inputAnimation = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  // Handle keyboard show/hide for input field animation
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      Animated.timing(inputAnimation, {
        toValue: e.endCoordinates.height,
        duration: 250,
        useNativeDriver: false,
      }).start();
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({ animated: true });
      }
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      Animated.timing(inputAnimation, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [inputAnimation]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSendMessage = useCallback(() => {
    if (inputText.trim()) {
      const now = new Date();
      const newHour = now.getHours();
      const newMinute = now.getMinutes();
      const formattedTime = `${newHour < 10 ? '0' : ''}${newHour}:${newMinute < 10 ? '0' : ''}${newMinute}`;
      const currentDate = now.toISOString().split('T')[0];

      const newMessage = {
        id: String(messages.length + 1),
        text: inputText.trim(),
        sender: 'user',
        timestamp: formattedTime,
        date: now.toISOString(),
      };

      setMessages((prevMessages) => {
        const lastMessage = prevMessages[prevMessages.length - 1];
        let newMessages = [...prevMessages];

        const shouldAddTimestamp = () => {
          if (!lastMessage) return true;
          if (lastMessage.isTimestamp) {
            const lastTimestampDate = new Date(lastMessage.date).toISOString().split('T')[0];
            return lastTimestampDate !== currentDate;
          }
          const lastMessageTime = new Date(lastMessage.date);
          const timeDiff = (now - lastMessageTime) / 1000 / 60;
          const lastMessageDate = lastMessageTime.toISOString().split('T')[0];
          return timeDiff > 5 || lastMessageDate !== currentDate;
        };

        if (shouldAddTimestamp()) {
          newMessages.push({
            id: `ts-${Date.now()}`,
            text: `Today ${formattedTime}`,
            isTimestamp: true,
            date: now.toISOString(),
          });
        }
        newMessages.push(newMessage);
        return newMessages;
      });
      setInputText('');
      setTimeout(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({ animated: true });
        }
      }, 100);
    }
  }, [inputText, messages]);

  const renderMessage = ({ item }) => {
    if (!item || !item.id || typeof item.text !== 'string') {
      return null;
    }

    if (item.isTimestamp) {
      return (
        <View style={styles.timestampContainer}>
          <Text style={styles.timestampText}>{item.text}</Text>
        </View>
      );
    }

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
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sahara</Text>
          <TouchableOpacity style={styles.alertIconPlaceholder}>
            <Text style={styles.alertIconText}>🔔</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageListContent}
          keyboardShouldPersistTaps="handled"
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 40}
          style={styles.inputAreaWrapper}
        >
          <Animated.View
            style={[
              styles.inputContainer,
              {
                transform: [
                  {
                    translateY: inputAnimation.interpolate({
                      inputRange: [0, 1000],
                      outputRange: [0, -1000],
                    }),
                  },
                ],
              },
            ]}
          >
            <TextInput
              style={styles.textInput}
              placeholder="Share anything"
              placeholderTextColor="#999"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
              <Text style={styles.sendButtonText}>↵</Text>
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
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
    marginTop:30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#D8E0E8', // Slightly darker shade for header
    borderBottomWidth: 1,
    borderBottomColor: '#CCC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
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
    flex: 1,
    textAlign: 'center',
  },
  alertIconPlaceholder: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertIconText: {
    fontSize: 22,
  },
  messageListContent: {
    marginTop:10,
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
    padding: 12,
    borderRadius: 15,
    minHeight: 40,
    justifyContent: 'center',
  },
  userBubble: {
    backgroundColor: '#ADD8E6',
    borderBottomRightRadius: 2,
    marginRight: 8,
  },
  aiBubble: {
    backgroundColor: '#D3D3D3',
    borderBottomLeftRadius: 2,
    marginLeft: 8,
  },
  userMessageText: {
    fontSize: 15,
    color: '#333',
  },
  aiMessageText: {
    fontSize: 15,
    color: '#333',
  },
  userAvatarPlaceholder: {
    width: 30,
    height: 30,
    margin:5,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#CCC',
    backgroundColor: '#DDD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    fontSize: 18,
    lineHeight: 20,
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
    lineHeight: 20,
  },
  timestampContainer: {
    alignSelf: 'center',
    marginVertical: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  timestampText: {
    fontSize: 12,
    color: '#666',
  },
  inputAreaWrapper: {
    paddingBottom: 10,
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
    paddingHorizontal: 5,
    paddingVertical: 0,
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
    lineHeight: 20,
  },
});

export default ChatPage;