import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

interface LoadingIndicatorProps {
  size?: 'small' | 'large';
  color?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  size = 'small', 
  color = '#007AFF' 
}) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoadingIndicator; 