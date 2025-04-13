import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="login" 
        options={{
          title: 'Giriş Yap',
        }}
      />
      <Stack.Screen 
        name="register" 
        options={{
          title: 'Kayıt Ol',
        }}
      />
    </Stack>
  );
} 