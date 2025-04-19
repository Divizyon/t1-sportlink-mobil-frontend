import { Stack } from "expo-router";

export default function DashboardLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false, title: "" }} />
      <Stack.Screen
        name="event-details"
        options={{ headerShown: false, title: "" }}
      />
      <Stack.Screen
        name="create-event"
        options={{ headerShown: false, title: "" }}
      />
    </Stack>
  );
}
