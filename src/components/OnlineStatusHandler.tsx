import React, { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { useAuth } from "@/src/store/AuthContext";
import { friendshipsApi } from "@/services/api/friendships";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Component that handles updating the user's online status
 * Sets user as online when app is in foreground and offline when in background
 */
const OnlineStatusHandler: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const appState = useRef(AppState.currentState);

  // Token kontrolü ile çevrimiçi/çevrimdışı durumu güncelleme
  const updateOnlineStatus = async (isOnline: boolean) => {
    try {
      // İlk önce token'ın olup olmadığını kontrol et
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.log("Token bulunamadı, çevrimiçi durumu güncellenemiyor");
        return;
      }

      await friendshipsApi.updateOnlineStatus(isOnline);
      console.log(
        `Kullanıcı ${isOnline ? "çevrimiçi" : "çevrimdışı"} duruma geçti`
      );
    } catch (err) {
      // Hata durumunda sessizce devam et, gereksiz log mesajı gösterme
      console.log(`Çevrimiçi durum güncellenirken hata oluştu (önemli değil)`);
    }
  };

  useEffect(() => {
    // Set user as online when component mounts (app starts)
    if (isAuthenticated) {
      console.log("App started, setting user as online");
      updateOnlineStatus(true);
    }

    // Handle app state changes (foreground, background)
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (isAuthenticated) {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          // App came to foreground - set user as online
          console.log("App came to foreground, setting user as online");
          updateOnlineStatus(true);
        } else if (
          nextAppState.match(/inactive|background/) &&
          appState.current === "active"
        ) {
          // App went to background - set user as offline
          console.log("App went to background, setting user as offline");
          updateOnlineStatus(false);
        }
      }

      appState.current = nextAppState;
    });

    // Clean up
    return () => {
      subscription.remove();

      // Set user as offline when component unmounts (app closes)
      if (isAuthenticated) {
        console.log("App closing, setting user as offline");
        updateOnlineStatus(false);
      }
    };
  }, [isAuthenticated]);

  // This component doesn't render anything
  return null;
};

export default OnlineStatusHandler;
