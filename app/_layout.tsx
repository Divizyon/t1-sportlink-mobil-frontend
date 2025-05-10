import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState, useRef, useCallback } from "react";
import React from "react";
import { ActivityIndicator, View, Text, AppState } from "react-native";

import "@/global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { AuthProvider, useAuth } from "@/src/store/AuthContext";
import apiClient from "@/src/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const unstable_settings = {
  initialRouteName: "index",
  "event-updates": {
    initialRouteName: "index",
  },
};

// Simplified Token validation check - uses AuthContext's validateToken but doesn't actually do anything
function TokenValidationProvider({ children }: { children: React.ReactNode }) {
  // Simply render children without any validation checks
  return <>{children}</>;
}

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
      // Make sure to use a route that definitely exists - check if "login" or "signin" is the correct path
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated, segments, isLoading, router]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GluestackUIProvider mode="light">
      <AuthProvider>
        <AuthenticationGuard>
          <TokenValidationProvider>
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
              <Stack.Screen
                name="event-details/[id]"
                options={{
                  headerShown: false,
                  presentation: "card",
                  animation: "slide_from_right",
                }}
              />
            </Stack>
          </TokenValidationProvider>
        </AuthenticationGuard>
      </AuthProvider>
    </GluestackUIProvider>
  );
}
