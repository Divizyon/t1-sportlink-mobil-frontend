import React from 'react';
import { View, StyleSheet, SafeAreaView, useColorScheme } from 'react-native';
import RegisterForm from '@components/RegisterForm';

export default function RegisterScreen() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }]}>
      <View style={styles.content}>
        <RegisterForm />
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