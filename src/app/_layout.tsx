import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen 
          name="(auth)/login" 
          options={{ 
            headerShown: false 
          }} 
        />
        <Stack.Screen 
          name="(auth)/register" 
          options={{ 
            headerShown: false 
          }} 
        />
      </Stack>
    </>
  );
} 