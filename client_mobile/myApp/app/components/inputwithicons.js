// app/components/inputwithicon.js
import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const InputWithIcon = ({ iconName, placeholder, value, onChangeText, secureTextEntry, keyboardType, autoCapitalize, showPassword, togglePassword }) => {
  return (
    <View style={styles.inputContainer}>
      <MaterialCommunityIcons
        name={iconName}
        size={20}
        color="#666"
        style={styles.icon}
      />
      <View style={styles.separator} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#666"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
      {showPassword !== undefined && (
        <TouchableOpacity
          style={styles.passwordIcon}
          onPress={togglePassword}
        >
          <MaterialCommunityIcons
            name={showPassword ? 'eye-off' : 'eye'}
            size={20}
            color="#666"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '95%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  separator: {
    width: 1, // Thickness of the vertical line
    height: 25, // Height of the line (adjust to fit within the input height)
    backgroundColor: '#ccc', // Color to match the border
    marginHorizontal: 0, // Space between icon and line
  },
  icon: {
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 10,
    fontSize: 16,
  },
  passwordIcon: {
    paddingHorizontal: 10,
  },
});

export default InputWithIcon;