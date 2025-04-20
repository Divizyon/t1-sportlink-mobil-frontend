import { Stack } from "expo-router";

export default function UpdatedEventsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          title: "Güncellenen Etkinlikler",
        }}
      />
    </Stack>
  );
} 