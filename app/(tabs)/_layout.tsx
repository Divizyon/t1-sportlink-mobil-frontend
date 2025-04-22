import React, { useState, useEffect } from "react";
import { Tabs, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  useColorScheme,
  TouchableOpacity,
  StyleSheet,
  View,
} from "react-native";
import { router } from "expo-router";
import { Plus } from "lucide-react-native";

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const activeColor = colorScheme === "dark" ? "#2ecc71" : "#2ecc71";
  const inactiveColor = colorScheme === "dark" ? "#7f8c8d" : "#95a5a6";
  const bgColor = colorScheme === "dark" ? "#1a1a1a" : "#ffffff";

  const pathname = usePathname();
  // Artı butonunu görünür yap - varsayılan olarak göster
  const [showFloatingButton, setShowFloatingButton] = useState(true);

  useEffect(() => {
    // Ana sayfa dışındaki sayfalarda butonu gizle
    const hideButtonOnPaths = [
      "/profile",
      "/notifications",
      "/events",
      "/dashboard/create-event",
    ];

    // Eğer şu anki path hideButtonOnPaths içindeki herhangi bir değerle başlıyorsa butonu gizle
    const shouldHideButton = hideButtonOnPaths.some((path) =>
      pathname.startsWith(path)
    );
    setShowFloatingButton(!shouldHideButton);

    console.log("Mevcut path:", pathname);
    console.log("Buton gösterilecek mi:", !shouldHideButton);
  }, [pathname]);

  // Yeni etkinlik oluşturma sayfasına yönlendir
  const handleCreateEvent = () => {
    router.push("/(tabs)/dashboard/create-event");
  };

  return (
    <>
      {/* Sabit Artı Butonu */}
      {showFloatingButton && (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={handleCreateEvent}
          activeOpacity={0.8}
        >
          <Plus size={22} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: activeColor,
          tabBarInactiveTintColor: inactiveColor,
          tabBarStyle: {
            backgroundColor: bgColor,
            borderTopWidth: 0,
            elevation: 0,
            height: 60,
            paddingBottom: 10,
            paddingTop: 10,
            shadowOpacity: 0,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "500",
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

const styles = StyleSheet.create({
  floatingButton: {
    position: "absolute",
    right: 20,
    bottom: 80,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#0B9A6D",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
});
