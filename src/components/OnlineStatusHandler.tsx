import React, { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useAuth } from '@/src/store/AuthContext';
import { friendshipsApi } from '@/services/api/friendships';

/**
 * Component that handles updating the user's online status
 * Sets user as online when app is in foreground and offline when in background
 */
const OnlineStatusHandler: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // Set user as online when component mounts (app starts)
    if (isAuthenticated) {
      console.log('App started, setting user as online');
      friendshipsApi.updateOnlineStatus(true)
        .then(() => console.log('User set to online on app start'))
        .catch(err => console.error('Error setting online status on app start:', err));
    }

    // Handle app state changes (foreground, background)
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (isAuthenticated) {
        if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
          // App came to foreground - set user as online
          console.log('App came to foreground, setting user as online');
          friendshipsApi.updateOnlineStatus(true)
            .then(() => console.log('User set to online on app foreground'))
            .catch(err => console.error('Error setting online status on foreground:', err));
        } else if (nextAppState.match(/inactive|background/) && appState.current === 'active') {
          // App went to background - set user as offline
          console.log('App went to background, setting user as offline');
          friendshipsApi.updateOnlineStatus(false)
            .then(() => console.log('User set to offline on app background'))
            .catch(err => console.error('Error setting offline status on background:', err));
        }
      }
      
      appState.current = nextAppState;
    });

    // Clean up
    return () => {
      subscription.remove();
      
      // Set user as offline when component unmounts (app closes)
      if (isAuthenticated) {
        console.log('App closing, setting user as offline');
        friendshipsApi.updateOnlineStatus(false)
          .catch(err => console.error('Error setting offline status on app close:', err));
      }
    };
  }, [isAuthenticated]);

  // This component doesn't render anything
  return null;
};

export default OnlineStatusHandler; 