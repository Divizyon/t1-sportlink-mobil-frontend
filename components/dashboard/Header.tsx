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
import { useMessageStore } from "@/src/store";
import { useAuth } from "@/src/store/AuthContext";
import LoadingAnimation from "../animations/LoadingAnimations";

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

  // Zustand store'undan okunmamış mesaj sayısını al
  const { unreadCount, fetchUnreadMessages } = useMessageStore();

  // Prop olarak gelen değer sadece yedek olarak kullanılacak (store'dan alınan değer 0 ise)
  const currentUnreadCount =
    unreadCount > 0 ? unreadCount : unreadMessages || 0;

  // Animation values
  const badgeScaleAnim = useRef(new Animated.Value(1)).current;
  const badgeOpacityAnim = useRef(new Animated.Value(1)).current;

  // Track previous count for animation
  const [prevCount, setPrevCount] = useState(currentUnreadCount);

  // Auth context'ten kullanıcı bilgilerini al
  const { user } = useAuth();

  // Mesaj bildirimini periyodik olarak güncelle
  useEffect(() => {
    // İlk yüklemede okunmamış mesaj sayısını al
    fetchUnreadMessages();

    // Her 10 saniyede bir okunmamış mesaj sayısını güncelle
    const interval = setInterval(() => {
      fetchUnreadMessages();
    }, 10000); // 15 saniyeden 10 saniyeye düşürüldü

    // Component unmount olduğunda interval'i temizle
    return () => clearInterval(interval);
  }, [fetchUnreadMessages]);

  // Okunmamış mesaj sayısındaki değişikliği izle ve animasyon göster
  useEffect(() => {
    if (currentUnreadCount !== prevCount) {
      console.log(
        `Bildirim sayısı değişti: ${prevCount} -> ${currentUnreadCount}`
      );

      // Pulse animation when count changes
      Animated.sequence([
        Animated.parallel([
          Animated.timing(badgeScaleAnim, {
            toValue: 1.5, // Daha belirgin büyüme
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(badgeOpacityAnim, {
            toValue: 0.6,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(badgeScaleAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(badgeOpacityAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      setPrevCount(currentUnreadCount);
    }
  }, [currentUnreadCount, prevCount, badgeScaleAnim, badgeOpacityAnim]);

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

        // Profile service ile profil verilerini getir
        const profileData = await profileService.getProfile();
        setProfile(profileData);
        console.log("Profil verisi başarıyla alındı:", profileData);

        // Profile verisi başarıyla yüklenirse loading durumunu kapat
        setLoading(false);
      } catch (err) {
        console.error("Profil verisi alınırken hata:", err);
        setError("Profil bilgileri yüklenemedi");

        // Hata durumunda da loading durumunu kapat
        setLoading(false);

        // Hata durumunda direkt Auth context'teki user bilgilerini kullan
        console.log("Auth context'ten kullanıcı bilgileri kullanılacak:", user);
      }
    };

    // Kullanıcı oturum açmışsa profil verilerini getir
    if (user && user.id) {
      console.log("Header - Oturum açmış kullanıcı:", user);
      fetchProfileData();
    } else {
      console.log("Header - Oturum açmış kullanıcı yok veya ID eksik");
      setLoading(false);
    }
  }, [user]);

  // Handle navigation to messages
  const handleMessagesPress = () => {
    router.push("/messages");
  };

  // Handle navigation to profile
  const handleProfilePress = () => {
    router.push("/(tabs)/profile/profile-page");
  };

  // Format unread count for display
  const formatUnreadCount = (count: number): string => {
    if (count > 99) return "99+";
    return count.toString();
  };

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

  // Kullanıcı ismini belirle - öncelik profile, sonra auth context, son olarak props
  // Burada kullanıcı yoksa userName props'unu, o da yoksa "Kullanıcı" kullan
  const firstName =
    profile?.first_name || user?.first_name || userName || "Kullanıcı";

  // Avatar kaynağını belirle - öncelik profile, sonra auth context (avatar veya profile_picture), son olarak props veya default
  const avatarSource =
    profile?.avatar ||
    user?.avatar ||
    user?.profile_picture ||
    userAvatar ||
    DEFAULT_AVATAR;

  // Avatar ve isim hata ayıklama için console.log
  useEffect(() => {
    console.log("Header - Kullanılan isim:", firstName);
    console.log("Header - Kullanılan avatar:", avatarSource);
  }, [firstName, avatarSource]);

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
              <LoadingAnimation size={24} />
            ) : (
              <Image
                source={{
                  uri: avatarSource,
                }}
                style={styles.avatar}
                // Resim yüklenemediğinde bir fallback göster
                onError={() => {
                  console.log(
                    "Avatar resmi yüklenirken hata oluştu, varsayılan avatar kullanılıyor"
                  );
                }}
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
    top: -5,
    right: -5,
    backgroundColor: "#F43F5E",
    borderRadius: 12,
    minWidth: 22,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
});

export default Header;
