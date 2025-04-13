import React from 'react';
import { View, StyleSheet, SafeAreaView, useColorScheme } from 'react-native';
import LoginForm from '@components/LoginForm';

export default function LoginScreen() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }]}>
      <View style={styles.content}>
        <LoginForm />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
}); 