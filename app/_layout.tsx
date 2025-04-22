import { Stack } from "expo-router";

import "@/global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";

export const unstable_settings = {
  initialRouteName: "index",
  "event-updates": {
    initialRouteName: "index",
  },
};

export default function RootLayout() {
  return (
    <GluestackUIProvider mode="light">
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="upcoming-events" options={{ headerShown: false }} />
        <Stack.Screen name="updated-events" options={{ headerShown: false }} />
        <Stack.Screen name="event-updates" options={{ headerShown: false }} />
      </Stack>
    </GluestackUIProvider>
  );
}
