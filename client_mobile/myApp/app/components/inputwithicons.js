import React, { useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

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
  editable,
  error,
  onFocus,
  isDropdown,
  items,
  selectedValue,
  onValueChange,
}) => {
  const inputRef = useRef(null);

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, error && styles.inputError]}>
        <MaterialCommunityIcons
          name={iconName}
          size={20}
          color="#666"
          style={styles.icon}
        />
        <View style={styles.separator} />
        {isDropdown ? (
          <Picker
            selectedValue={selectedValue}
            onValueChange={onValueChange}
            style={styles.picker}
            dropdownIconColor="#666"
          >
            {items.map((item) => (
              <Picker.Item
                key={item.value}
                label={item.label}
                value={item.value}
                style={styles.pickerItem}
              />
            ))}
          </Picker>
        ) : (
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor="#666"
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            editable={editable}
            onFocus={onFocus}
          />
        )}
        {showPassword !== undefined && !isDropdown && (
          <TouchableOpacity style={styles.passwordIcon} onPress={togglePassword}>
            <MaterialCommunityIcons
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color="#666"
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
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
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    marginLeft: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 55,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
  },
  inputError: {
    borderColor: '#D32F2F',
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
    color: '#333',
  },
  picker: {
    flex: 1,
    height: '100%',
    color: '#333',
    textAlign: 'center', // Center the selected text
    justifyContent: 'center', // Center vertically
    
  },
  pickerItem: {
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff', // Visible background for dropdown options
    textAlign: 'center', // Center the dropdown option text
  },
  passwordIcon: {
    paddingHorizontal: 5,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
});

export default InputWithIcon;