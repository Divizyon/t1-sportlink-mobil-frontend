import React, { useEffect, useState, useRef } from "react";
import { 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  View, 
  ActivityIndicator, 
  Animated, 
  Platform 
} from "react-native";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { 
  MessageCircle, 
  Bell, 
  UserCircle, 
  Calendar 
} from "lucide-react-native";
import { router } from "expo-router";
import { profileService } from "@/src/api/profileService";
import { UserProfile } from "@/src/types";
import { useMessages } from "@/src/contexts/MessageContext";

// Theme colors
const theme = {
  primary: "#10B981", // Main green
  primaryLight: "#D1FAE5", // Light green
  primaryDark: "#059669", // Dark green for emphasis
  text: "#0F172A", // Main text
  textSecondary: "#64748B", // Secondary text
  border: "#E2E8F0", // Border color
  background: "#F8FAFC", // Background
  white: "#FFFFFF", // White
  notification: "#F43F5E", // Notification red
  notificationText: "#FFFFFF", // Notification text color
  surface: "#F8FAFC", // Surface background
};

interface HeaderProps {
  userName?: string;
  userAvatar?: string;
  isPro?: boolean;
  unreadMessages?: number;
}

const Header: React.FC<HeaderProps> = ({
  userName,
  userAvatar,
  unreadMessages = 0,
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get real-time unread count from context
  const messageContext = (() => {
    try {
      return useMessages();
    } catch (error) {
      // Fallback implementation if context throws an error
      console.warn('MessageContext not available, using fallback:', error);
      return { unreadCount: 0 };
    }
  })();
  
  // Use either prop value or context value (context preferred)
  const currentUnreadCount = messageContext.unreadCount > 0 ? messageContext.unreadCount : unreadMessages;
  
  // Animation values
  const badgeScaleAnim = useRef(new Animated.Value(1)).current;
  const badgeOpacityAnim = useRef(new Animated.Value(1)).current;
  
  // Track previous count for animation
  const [prevCount, setPrevCount] = useState(currentUnreadCount);
  
  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const profileData = await profileService.getProfile();
        setProfile(profileData);
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError("Could not load profile information");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);
  
  // Handle unread message count changes with animation
  useEffect(() => {
    if (currentUnreadCount !== prevCount) {
      // Pulse animation when count changes
      Animated.sequence([
        Animated.parallel([
          Animated.timing(badgeScaleAnim, {
            toValue: 1.3,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(badgeOpacityAnim, {
            toValue: 0.7,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(badgeScaleAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(badgeOpacityAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
      
      setPrevCount(currentUnreadCount);
    }
  }, [currentUnreadCount, prevCount]);
  
  // Handle navigation to messages
  const handleMessagesPress = () => {
    router.push("/(tabs)/profile/friends-list", {
      withAnchor: true,
    });
  };

  // Handle navigation to profile
  const handleProfilePress = () => {
    router.push("/(tabs)/profile/profile-page");
  };

  // Format the user's display name
  const displayName = profile 
    ? `${profile.first_name} ${profile.last_name}` 
    : userName || "Kullanıcı";
    
  // Get the avatar source URL
  const avatarSource = profile?.avatar || userAvatar || "https://randomuser.me/api/portraits/lego/1.jpg";

  // Format unread count for display
  const formatUnreadCount = (count: number): string => {
    if (count > 99) return "99+";
    return count.toString();
  };

  return (
    <Box style={styles.header}>
      {/* User Profile Section */}
      <TouchableOpacity 
        onPress={handleProfilePress} 
        style={styles.userContainer}
        activeOpacity={0.7}
      >
        <HStack style={styles.userInfo}>
          {/* Avatar with loading state */}
          {loading ? (
            <View style={styles.avatarContainer}>
              <View style={styles.avatarPlaceholder}>
                <ActivityIndicator size="small" color={theme.primary} />
              </View>
            </View>
          ) : (
            <View style={styles.avatarContainer}>
              <Image 
                source={{ uri: avatarSource }} 
                style={styles.avatar} 
              />
              {/* Verified badge - can be conditionally shown later when API supports this */}
              {/* <View style={styles.verifiedBadge} /> */}
            </View>
          )}
          
          {/* User details */}
          <VStack style={styles.textContainer}>
            <Text style={styles.userName}>
              {loading ? "Yükleniyor..." : displayName}
            </Text>
            
            {!loading && profile && (
              <HStack style={styles.statsContainer}>
                <HStack style={styles.statItem}>
                  <Calendar size={12} color={theme.textSecondary} />
                  <Text style={styles.statText}>
                    {profile.total_events || 0} Etkinlik
                  </Text>
                </HStack>
                
                <HStack style={styles.statItem}>
                  <UserCircle size={12} color={theme.textSecondary} />
                  <Text style={styles.statText}>
                    {profile.friend_count || 0} Arkadaş
                  </Text>
                </HStack>
              </HStack>
            )}
          </VStack>
        </HStack>
      </TouchableOpacity>

      {/* Actions Section */}
      <HStack style={styles.actionsContainer}>
        {/* Messages button with notification badge */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleMessagesPress}
          activeOpacity={0.7}
        >
          <MessageCircle size={22} color={theme.text} />
          
          {/* Animated notification badge */}
          {currentUnreadCount > 0 && (
            <Animated.View 
              style={[
                styles.badge,
                {
                  transform: [{ scale: badgeScaleAnim }],
                  opacity: badgeOpacityAnim
                }
              ]}
            >
              <Text style={styles.badgeText}>
                {formatUnreadCount(currentUnreadCount)}
              </Text>
            </Animated.View>
          )}
        </TouchableOpacity>
      </HStack>
    </Box>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 12 : 10,
    paddingBottom: 10,
    backgroundColor: theme.white,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  userContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: theme.primaryLight,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: theme.primary,
    borderWidth: 2,
    borderColor: theme.white,
  },
  textContainer: {
    marginLeft: 10,
    justifyContent: "center",
  },
  userName: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.text,
  },
  statsContainer: {
    marginTop: 3,
    flexDirection: "row",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  statText: {
    fontSize: 11,
    color: theme.textSecondary,
    marginLeft: 3,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    position: "relative",
    backgroundColor: theme.surface,
    marginLeft: 8,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: theme.notification,
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: theme.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  badgeText: {
    color: theme.notificationText,
    fontSize: 10,
    fontWeight: "bold",
  },
});

export default Header;
