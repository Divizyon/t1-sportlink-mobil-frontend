import { Stack } from "expo-router";

export default function EventUpdatesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: "Güncellenen Etkinlikler",
          headerShown: false
        }} 
      />
    </Stack>
  );
} 