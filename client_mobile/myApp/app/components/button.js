import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const Button = ({
  title,
  onPress,
  style,
  textStyle, // ✅ Add this
  backgroundColor = '#007AFF',
  textColor = '#fff'
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, { backgroundColor }, style]}
    >
      <Text style={[styles.text, { color: textColor }, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Button;
