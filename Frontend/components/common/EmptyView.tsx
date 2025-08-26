import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native';

interface EmptyViewProps {
  message?: string;
  icon?: string;
}

export const EmptyView: React.FC<EmptyViewProps> = ({ 
  message = '데이터가 없습니다.',
  icon = '📭'
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
