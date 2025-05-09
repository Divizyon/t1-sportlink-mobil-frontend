import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet, useColorScheme } from "react-native";

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const activeColor = colorScheme === "dark" ? "#2ecc71" : "#2ecc71";
  const inactiveColor = colorScheme === "dark" ? "#7f8c8d" : "#95a5a6";
  const bgColor = colorScheme === "dark" ? "#1a1a1a" : "#ffffff";

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: activeColor,
          tabBarInactiveTintColor: inactiveColor,
          tabBarStyle: {
            backgroundColor: bgColor,
            borderTopWidth: 0,
            elevation: 0,
            height: 90,
            paddingBottom: 10,
            paddingTop: 10,
            shadowOpacity: 0,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: "500",
            maxWidth: 80,
          },
        }}
      >
        <Tabs.Screen
          name="dashboard"
          options={{
            title: "Ana Sayfa",
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                color={color}
                size={24}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="events"
          options={{
            title: "Etkinlikler",
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "calendar" : "calendar-outline"}
                color={color}
                size={24}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="news"
          options={{
            title: "Haberler-Duyurular",
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "newspaper" : "newspaper-outline"}
                color={color}
                size={24}
              />
            ),
            href: "/news"
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            title: "Bildirimler",
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "notifications" : "notifications-outline"}
                color={color}
                size={24}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profil",
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "person" : "person-outline"}
                color={color}
                size={24}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="reminders"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({});
