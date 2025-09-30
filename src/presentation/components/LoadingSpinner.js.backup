import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

const LoadingSpinner = ({ 
  size = 'large', 
  color = '#2196F3', 
  message = 'Carregando...', 
  style 
}) => {
  return (
    <View style={[styles.container, style]} accessible={true} accessibilityLabel={message}>
      <ActivityIndicator 
        size={size} 
        color={color} 
        accessibilityHint="Aguarde enquanto os dados são carregados"
      />
      {message && (
        <Text style={styles.message} accessible={true}>
          {message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default LoadingSpinner;