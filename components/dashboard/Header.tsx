import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Image,
  View,
  ActivityIndicator,
  Animated,
  Platform,
  TextInput,
} from "react-native";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import {
  MessageCircle,
  Bell,
  UserCircle,
  Calendar,
  Search,
} from "lucide-react-native";
import { router } from "expo-router";
import { profileService } from "@/src/api/profileService";
import { UserProfile } from "@/src/types";
import { useMessages } from "@/src/contexts/MessageContext";
import { useAuth } from "@/src/store/AuthContext";

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
  onSearchPress?: () => void;
  scrollY?: Animated.Value; // Scroll pozisyonu için Animated.Value
}

const DEFAULT_AVATAR = "https://randomuser.me/api/portraits/lego/1.jpg";
const HEADER_MAX_HEIGHT = 160; // Header maksimum yüksekliği (tam görünüm) - arttırıldı
const HEADER_MIN_HEIGHT = 80; // Header minimum yüksekliği (küçülmüş görünüm) - arttırıldı
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

const Header: React.FC<HeaderProps> = ({
  userName,
  userAvatar,
  unreadMessages = 0,
  onSearchPress,
  scrollY = new Animated.Value(0), // Varsayılan olarak 0
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Animasyon değerleri
  const headerHeight = useRef(new Animated.Value(HEADER_MAX_HEIGHT)).current;
  const searchOpacity = useRef(new Animated.Value(1)).current;
  const greetingOpacity = useRef(new Animated.Value(1)).current;
  const subtitleOpacity = useRef(new Animated.Value(1)).current;
  const nameOpacity = useRef(new Animated.Value(1)).current;
  const nameTranslateY = useRef(new Animated.Value(0)).current;

  // Get real-time unread count from context
  const messageContext = (() => {
    try {
      return useMessages();
    } catch (error) {
      // Fallback implementation if context throws an error
      console.warn("MessageContext not available, using fallback:", error);
      return { unreadCount: 0 };
    }
  })();

  // Use either prop value or context value (context preferred)
  const currentUnreadCount =
    messageContext.unreadCount > 0
      ? messageContext.unreadCount
      : unreadMessages;

  // Animation values
  const badgeScaleAnim = useRef(new Animated.Value(1)).current;
  const badgeOpacityAnim = useRef(new Animated.Value(1)).current;

  // Track previous count for animation
  const [prevCount, setPrevCount] = useState(currentUnreadCount);

  const { user } = useAuth();

  // Scroll olayını dinle
  useEffect(() => {
    // scrollY değeri değiştiğinde animasyonları güncelle
    const scrollListener = scrollY.addListener(({ value }) => {
      // Header yüksekliği
      const headerHeightValue = Math.max(
        HEADER_MIN_HEIGHT,
        HEADER_MAX_HEIGHT - value
      );
      headerHeight.setValue(headerHeightValue);

      // Kaydırma yüzdesini hesapla (0-1 arası)
      const scrollProgress = Math.min(1, value / HEADER_SCROLL_DISTANCE);

      // Selamlama metni (Günaydın, Merhaba) opaklığı - hızlı kaybolsun
      const greetingOpacityValue = Math.max(0, 1 - scrollProgress * 2.5);
      greetingOpacity.setValue(greetingOpacityValue);

      // Alt başlık (Bugün ne yapmak istersin?) opaklığı - çok hızlı kaybolsun
      const subtitleOpacityValue = Math.max(0, 1 - scrollProgress * 3);
      subtitleOpacity.setValue(subtitleOpacityValue);

      // İsim opaklığı - her zaman görünür kalsın
      nameOpacity.setValue(1);

      // İsmin konumunu ayarla - yukarı çıkıp solda dursun
      const nameTranslateYValue = -scrollProgress * 15; // İsim yukarı kaydırılsın
      nameTranslateY.setValue(nameTranslateYValue);

      // Arama çubuğu opaklığı - hızlı kaybolsun
      const searchOpacityValue = Math.max(0, 1 - scrollProgress * 2);
      searchOpacity.setValue(searchOpacityValue);
    });

    // Component unmount olduğunda listener'ı temizle
    return () => {
      scrollY.removeListener(scrollListener);
    };
  }, [
    scrollY,
    headerHeight,
    greetingOpacity,
    subtitleOpacity,
    nameOpacity,
    searchOpacity,
    nameTranslateY,
  ]);

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

  // Get the user's display name
  const displayName = user
    ? `${user.first_name} ${user.last_name}`
    : userName || "Kullanıcı";

  // Get the avatar source URL
  const avatarSource = user?.avatar || userAvatar || DEFAULT_AVATAR;

  // Format unread count for display
  const formatUnreadCount = (count: number): string => {
    if (count > 99) return "99+";
    return count.toString();
  };

  const firstName = user?.first_name || "Kullanıcı";

  const handleAvatarPress = () => {
    router.push("/(tabs)/profile");
  };

  // Get time of day greeting
  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return "Günaydın";
    if (hour < 18) return "Merhaba";
    return "İyi akşamlar";
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          height: headerHeight,
          overflow: "hidden",
        },
      ]}
    >
      {/* Üst kısım: Avatar ve isim yan yana */}
      <View style={styles.topRow}>
        <View style={styles.avatarNameContainer}>
          <TouchableOpacity
            onPress={handleAvatarPress}
            style={styles.avatarContainer}
          >
            {loading ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <Image
                source={{
                  uri: avatarSource,
                }}
                style={styles.avatar}
              />
            )}
          </TouchableOpacity>

          {/* İsim - Avatar'ın hemen yanında */}
          <Animated.Text
            style={[
              styles.nameText,
              {
                opacity: nameOpacity,
              },
            ]}
          >
            {firstName}
          </Animated.Text>
        </View>

        {/* Mesaj ikonu sağda kalacak */}
        <TouchableOpacity
          onPress={handleMessagesPress}
          style={styles.iconButton}
        >
          <MessageCircle size={26} color={theme.text} />
          {currentUnreadCount > 0 && (
            <Animated.View
              style={[
                styles.badge,
                {
                  transform: [{ scale: badgeScaleAnim }],
                  opacity: badgeOpacityAnim,
                },
              ]}
            >
              <Text style={styles.badgeText}>
                {formatUnreadCount(currentUnreadCount)}
              </Text>
            </Animated.View>
          )}
        </TouchableOpacity>
      </View>

      {/* Selamlama ve alt başlık */}
      <Animated.View
        style={[styles.greetingSection, { opacity: greetingOpacity }]}
      >
        <View style={styles.greetingContainer}>
          {/* Selamlama metni - Küçültüldüğünde kaybolur */}
          <Text style={styles.greetingText}>{getGreeting()}</Text>

          {/* Emoji - Küçültüldüğünde kaybolur */}
          <Text style={styles.emojiText}>👋</Text>
        </View>

        {/* Alt başlık - Küçültüldüğünde çok hızlı kaybolur */}
        <Animated.Text
          style={[styles.subtitleText, { opacity: subtitleOpacity }]}
        >
          Bugün ne yapmak istersin?
        </Animated.Text>
      </Animated.View>

      {/* Arama çubuğu - Küçültüldüğünde kaybolur */}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F8FAFC", // Açık arkaplan
    paddingHorizontal: 20, // 16'dan 20'ye yükseltildi
    paddingTop: 18, // 16'dan 18'e yükseltildi
    paddingBottom: 18, // 16'dan 18'e yükseltildi
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    zIndex: 10,
    position: "relative",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    marginTop: 8,
  },
  avatarNameContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "#10B981", // Yeşil çerçeve
    padding: 2,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 24,
  },
  greetingSection: {
    marginBottom: 12,
  },
  greetingContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  greetingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginRight: 4,
  },
  nameText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#10B981", // İsmi yeşil renkte göster
    marginLeft: 6,
  },
  emojiText: {
    fontSize: 16,
    marginLeft: 4,
  },
  subtitleText: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 2,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchPlaceholder: {
    fontSize: 15,
    color: "#94A3B8",
    marginLeft: 12,
    flex: 1,
  },
  iconButton: {
    padding: 10,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#F43F5E",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
});

export default Header;
