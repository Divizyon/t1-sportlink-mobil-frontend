import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import React from "react";

import "@/global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { AuthProvider, useAuth } from "@/src/store/AuthContext";

export const unstable_settings = {
  initialRouteName: "index",
  "event-updates": {
    initialRouteName: "index",
  },
};

// Oturum kontrolü ve yönlendirme için özel bileşen
function AuthenticationGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Yükleme sırasında hiçbir şey yapma

    const inAuthGroup = segments[0] === "(auth)";
    const inProtectedArea =
      segments[0] === "(tabs)" ||
      segments[0] === "upcoming-events" ||
      segments[0] === "updated-events" ||
      segments[0] === "event-updates" ||
      segments[0] === "system-notifications" ||
      segments[0] === "messages" ||
      segments[0] === "friend-requests";

    // Giriş yapmış kullanıcılar auth sayfalarına gitmeye çalışırsa ana sayfaya yönlendir
    if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)/dashboard");
    }

    // Giriş yapmamış kullanıcılar korumalı alanlara gitmeye çalışırsa giriş sayfasına yönlendir
    if (!isAuthenticated && inProtectedArea) {
      router.replace("/(auth)/signin");
    }
  }, [isAuthenticated, segments, isLoading]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GluestackUIProvider mode="light">
      <AuthProvider>
        <AuthenticationGuard>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="upcoming-events"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="updated-events"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="event-updates"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="system-notifications/index"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="messages" options={{ headerShown: false }} />
            <Stack.Screen
              name="friend-requests/index"
              options={{ headerShown: false }}
            />
          </Stack>
        </AuthenticationGuard>
      </AuthProvider>
    </GluestackUIProvider>
  );
}
