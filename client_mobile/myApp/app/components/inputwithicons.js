import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const InputWithIcon = ({
  label,
  iconName,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  showPassword,
  togglePassword,
}) => {
  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      
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
          <TouchableOpacity style={styles.passwordIcon} onPress={togglePassword}>
            <MaterialCommunityIcons
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color="#666"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '95%',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight:'bold',
    color: '#333',
    marginBottom: 5,
    marginLeft: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
  },
  icon: {
    marginRight: 5,
  },
  separator: {
    width: 1,
    height: 25,
    backgroundColor: '#ccc',
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  passwordIcon: {
    paddingHorizontal: 5,
  },
});

export default InputWithIcon;
