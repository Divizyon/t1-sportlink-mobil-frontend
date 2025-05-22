import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState, useRef, useCallback } from "react";
import React from "react";
import { ActivityIndicator, View, Text, AppState } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";

import "@/global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { AuthProvider, useAuth } from "@/src/store/AuthContext";
import apiClient from "@/src/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MessageProvider } from "@/src/contexts/MessageContext";
import OnlineStatusHandler from "@/src/components/OnlineStatusHandler";

export const unstable_settings = {
  initialRouteName: "index",
  "event-updates": {
    initialRouteName: "index",
  },
};

// Simple TokenValidationProvider to ensure token is regularly checked
function TokenValidationProvider({ children }: { children: React.ReactNode }) {
  const { validateToken, isAuthenticated, forceLogout } = useAuth();
  const appState = useRef(AppState.currentState);

  // Validate token when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active" &&
        isAuthenticated
      ) {
        if (process.env.NODE_ENV === "development") {
          console.log("App came to foreground, validating token...");
        }
        validateToken().then((isValid) => {
          if (!isValid) {
            if (process.env.NODE_ENV === "development") {
              console.log("Token invalid after app resume, forcing logout");
            }
            forceLogout("Oturumunuz sona erdi. Lütfen tekrar giriş yapın.");
          }
        });
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [validateToken, isAuthenticated, forceLogout]);

  // Periodically validate token while app is active
  useEffect(() => {
    if (!isAuthenticated) return;

    if (process.env.NODE_ENV === "development") {
      console.log("Setting up periodic token validation");
    }

    // Check token every 5 minutes
    const interval = setInterval(() => {
      if (process.env.NODE_ENV === "development") {
        console.log("Performing periodic token validation check");
      }
      validateToken().then((isValid) => {
        if (!isValid) {
          if (process.env.NODE_ENV === "development") {
            console.log("Token invalid during periodic check, forcing logout");
          }
          forceLogout("Oturumunuz sona erdi. Lütfen tekrar giriş yapın.");
        }
      });
    }, 5 * 60 * 1000); // 5 minutes

    return () => {
      clearInterval(interval);
    };
  }, [isAuthenticated, validateToken, forceLogout]);

  return <>{children}</>;
}

// Authentication Guard for navigation control
function AuthenticationGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const hasCheckedAuthRef = useRef(false);

  useEffect(() => {
    if (isLoading) return; // Skip during loading

    // Mark that we've checked authentication
    hasCheckedAuthRef.current = true;

    // Is user on the welcome page?
    const isOnWelcomePage = segments.length === 1 && segments[0] === "";
    const isOnIndexPage = segments.length === 1 && segments[0] === "index";

    // WELCOME PAGE POLICY: Allow users to stay on the welcome/index page
    // regardless of authentication status
    if (isOnWelcomePage || isOnIndexPage) {
      if (process.env.NODE_ENV === "development") {
        console.log("On welcome page, not enforcing redirects");
      }
      return;
    }

    // Check if user is in authentication group or protected area
    const inAuthGroup = segments[0] === "(auth)";
    const inProtectedArea =
      segments[0] === "(tabs)" ||
      segments[0] === "upcoming-events" ||
      segments[0] === "updated-events" ||
      segments[0] === "event-updates" ||
      segments[0] === "system-notifications" ||
      segments[0] === "messages" ||
      segments[0] === "friend-requests";

    // Redirect authenticated users away from auth pages
    if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)/dashboard");
    }

    // Redirect unauthenticated users away from protected areas
    else if (!isAuthenticated && inProtectedArea) {
      router.replace("/(auth)/signin");
    }
  }, [isAuthenticated, segments, isLoading, router]);

  return <>{children}</>;
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    // Add fonts if needed
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    const hideSplash = async () => {
      if (loaded) {
        try {
          await SplashScreen.hideAsync();
        } catch (e) {
          console.warn("Error hiding splash screen:", e);
        }
      }
    };

    hideSplash();
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GluestackUIProvider mode="light">
      <AuthProvider>
        <MessageProvider>
          <AuthenticationGuard>
            <TokenValidationProvider>
              <OnlineStatusHandler />
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
                <Stack.Screen
                  name="messages"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="friend-requests/index"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="chat/[id]"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="login"
                  options={{ headerShown: false, gestureEnabled: false }}
                />
                <Stack.Screen
                  name="register"
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
        </MessageProvider>
      </AuthProvider>
    </GluestackUIProvider>
  );
}
