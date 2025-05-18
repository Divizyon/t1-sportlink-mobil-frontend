import { Text } from "@/components/ui/text";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  Bell,
  BookOpen,
  Cake,
  Calendar,
  Camera,
  Check,
  ChevronRight,
  Clock,
  Edit3,
  HelpCircle,
  Image as ImageIcon,
  LogOut,
  Mail,
  Map,
  MapPin,
  Mic,
  MoreVertical,
  Settings,
  Shield,
  Star,
  Users,
  X,
  Smartphone,
  RefreshCw,
  AlertCircle,
} from "lucide-react-native";
import React, { useState, useEffect, useCallback } from "react";
import {
  ActionSheetIOS,
  Alert,
  Image,
  Linking,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "@/src/store/AuthContext";
import apiClient from "@/src/api";
import { useRouter } from "expo-router";
import { friendshipsApi } from "@/services/api/friendships";
import profileService from "@/src/api/profileService";
import { UserProfile } from "@/src/types";
import eventService from "@/src/api/eventService";
import EventCard from "@/components/profile/EventCard";
import eventBus from "@/src/utils/EventBus";
import AccountSettings from "@/components/profile/AccountSettings";

// Menü öğesi tipi tanımlama
interface MenuItem {
  id: string;
  title: string;
  icon: React.ReactNode;
}

// Event tipi tanımlama
interface Event {
  id: number;
  title: string;
  type: string;
  category: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  distance: string;
  participants: {
    id: number;
    name: string;
    profileImage: string;
  }[];
  participantCount: number;
  maxParticipants: number;
  rating: number;
  reviews: {
    id: number;
    userName: string;
    rating: number;
    comment: string;
  }[];
  isJoined: boolean;
  organizer: {
    id: number;
    name: string;
    isVerified: boolean;
    logoUrl: string;
  };
  description: string;
  requirements: string;
  calculatedDistance?: number;
}

// Spor Kategorileri - Önceden tanımlanmış spor dalları
const sportsCategories = [
  "Futbol",
  "Basketbol",
  "Tenis",
  "Yüzme",
  "Voleybol",
  "Koşu",
  "Bisiklet",
  "Yoga",
  "Yürüyüş",
];

// Varsayılan profil fotoğrafı URL'si
const DEFAULT_PROFILE_IMAGE = "https://randomuser.me/api/portraits/lego/1.jpg";

// Geçici etkinlik verileri - Sadece katıldığım etkinlikler
const eventData = [
  {
    id: 2,
    title: "Futbol Turnuvası",
    category: "Futbol",
    date: "23 Ekim",
    startTime: "14:00",
    endTime: "17:00",
    location: "Meram Futbol Sahası",
    coordinates: {
      latitude: 37.8599,
      longitude: 32.4522,
    },
    distance: "2.5 km",
    participants: [
      {
        id: 1,
        name: "Ayşe K.",
        profileImage: "https://randomuser.me/api/portraits/women/65.jpg",
      },
      {
        id: 2,
        name: "Mehmet Y.",
        profileImage: "https://randomuser.me/api/portraits/men/22.jpg",
      },
      {
        id: 3,
        name: "Ali B.",
        profileImage: "https://randomuser.me/api/portraits/men/32.jpg",
      },
      {
        id: 4,
        name: "Zeynep T.",
        profileImage: "https://randomuser.me/api/portraits/women/28.jpg",
      },
    ],
    participantCount: 18,
    maxParticipants: 22,
    rating: 4.8,
    reviews: [
      {
        id: 1,
        userName: "Mehmet A.",
        rating: 5,
        comment: "Çok profesyonelce organize edilmiş.",
      },
      {
        id: 2,
        userName: "Ali B.",
        rating: 4,
        comment: "Keyifliydi, tekrar katılacağım.",
      },
    ],
    isJoined: true,
    organizer: {
      id: 2,
      name: "Meram Spor Akademisi",
      isVerified: true,
      logoUrl: "https://randomuser.me/api/portraits/men/45.jpg",
    },
    description:
      "5v5 halı saha futbol turnuvası. Kazanan takıma kupa verilecektir.",
    requirements: "Takım olarak katılım veya bireysel kayıt mümkündür.",
  },
  {
    id: 3,
    title: "Yüzme Etkinliği",
    category: "Yüzme",
    date: "24 Ekim",
    startTime: "10:00",
    endTime: "11:30",
    location: "Olimpik Yüzme Havuzu",
    coordinates: {
      latitude: 37.851,
      longitude: 32.4726,
    },
    distance: "3.7 km",
    participants: [
      {
        id: 5,
        name: "Deniz A.",
        profileImage: "https://randomuser.me/api/portraits/women/33.jpg",
      },
      {
        id: 6,
        name: "Burak C.",
        profileImage: "https://randomuser.me/api/portraits/men/45.jpg",
      },
      {
        id: 7,
        name: "Canan Y.",
        profileImage: "https://randomuser.me/api/portraits/women/44.jpg",
      },
    ],
    participantCount: 8,
    maxParticipants: 15,
    rating: 4.2,
    reviews: [
      {
        id: 1,
        userName: "Deniz Y.",
        rating: 4,
        comment: "Su sıcaklığı idealdi, eğitmenler yardımcıydı.",
      },
      {
        id: 2,
        userName: "Canan M.",
        rating: 5,
        comment: "Yeni teknikler öğrendim, teşekkürler!",
      },
    ],
    isJoined: true,
    organizer: {
      id: 3,
      name: "Konya Yüzme Kulübü",
      isVerified: false,
      logoUrl: "https://randomuser.me/api/portraits/women/28.jpg",
    },
    description:
      "Tüm seviyelere uygun yüzme etkinliği. Profesyonel eğitmenler eşliğinde stil geliştirme.",
    requirements:
      "Mayo, bone ve gözlük getirmeniz gerekiyor. Duş malzemelerinizi de unutmayın.",
  },
];

// Menü öğeleri
const menuItems: MenuItem[] = [
  {
    id: "notifications",
    title: "Bildirimler",
    icon: <Bell size={22} color="#f39c12" />,
  },
  {
    id: "privacy",
    title: "Gizlilik ve Güvenlik",
    icon: <Shield size={22} color="#2ecc71" />,
  },
  {
    id: "help",
    title: "Yardım ve Destek",
    icon: <HelpCircle size={22} color="#9b59b6" />,
  },

  {
    id: "logout",
    title: "Çıkış Yap",
    icon: <LogOut size={22} color="#95a5a6" />,
  },
];

// Define notification category types
interface NotificationCategory {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

// Define permission type
interface Permission {
  id: string;
  title: string;
  description: string;
  status: "granted" | "denied" | "unknown";
  icon: React.ReactNode;
}

// Default notification categories
const defaultNotificationCategories: NotificationCategory[] = [
  {
    id: "event_invitations",
    title: "Etkinlik Davetleri",
    description: "Birisi sizi bir etkinliğe davet ettiğinde bildirim alın",
    enabled: true,
  },
  {
    id: "new_events",
    title: "Yeni Etkinlikler",
    description:
      "İlgi alanlarınıza uygun yeni etkinlikler oluşturulduğunda bildirim alın",
    enabled: true,
  },
  {
    id: "event_reminders",
    title: "Etkinlik Hatırlatıcıları",
    description: "Katılacağınız etkinlikler yaklaştığında hatırlatıcılar alın",
    enabled: true,
  },
  {
    id: "friend_activity",
    title: "Arkadaş Etkinlikleri",
    description: "Arkadaşlarınız bir etkinliğe katıldığında bildirim alın",
    enabled: false,
  },
  {
    id: "messages",
    title: "Mesajlar",
    description: "Yeni mesaj aldığınızda bildirim alın",
    enabled: true,
  },
  {
    id: "app_updates",
    title: "Uygulama Güncellemeleri",
    description:
      "Uygulama güncellemeleri ve yeni özellikler hakkında bildirim alın",
    enabled: false,
  },
];

// Profil servisini oluştur
const profilePasswordService = {
  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }) => {
    return profileService.changePassword(data);
  },
};

// Katıldığım Etkinlik tipi
interface ParticipatedEvent {
  id: number;
  title: string;
  sport?: {
    id: number;
    icon: string;
    name: string;
  };
  sport_id?: number;
  status: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location_name: string;
  description?: string;
  max_participants?: number;
}

export default function ProfileScreen() {
  const { logout } = useAuth();
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isEditProfileModalVisible, setIsEditProfileModalVisible] =
    useState(false);
  const [isNotificationsModalVisible, setIsNotificationsModalVisible] =
    useState(false);
  const [isPrivacyModalVisible, setIsPrivacyModalVisible] = useState(false);
  const [isSportsModalVisible, setIsSportsModalVisible] = useState(false);
  const [isAccountSettingsVisible, setIsAccountSettingsVisible] =
    useState(false);
  const [availableSports, setAvailableSports] = useState<
    Array<{ id: number; name: string; icon: string }>
  >([]);
  const [selectedSports, setSelectedSports] = useState<Array<number>>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notificationCategories, setNotificationCategories] = useState<
    NotificationCategory[]
  >([...defaultNotificationCategories]);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [activePrivacySection, setActivePrivacySection] = useState<
    string | null
  >(null);

  // Spor tipine göre emoji gösteren fonksiyon
  const getSportEmoji = (sportName: string) => {
    switch (sportName) {
      case "Futbol":
        return "⚽";
      case "Basketbol":
        return "🏀";
      case "Yüzme":
        return "🏊";
      case "Tenis":
        return "🎾";
      case "Voleybol":
        return "🏐";
      case "Koşu":
        return "🏃";
      case "Yoga":
        return "🧘";
      case "Bisiklet":
        return "🚴";
      case "Yürüyüş":
        return "🚶";
      case "Akıl Oyunları":
        return "🧠";
      case "Okçuluk":
        return "🏹";
      default:
        return "🏆";
    }
  };

  // Spor tipine göre ikon render etme fonksiyonu kullanılmayacak

  const [permissions, setPermissions] = useState<Permission[]>([
    {
      id: "camera",
      title: "Kamera",
      description: "Kamera erişimine izin verin (profil fotoğrafı çekmek için)",
      status: "unknown",
      icon: <Camera size={22} color="#3498db" />,
    },
    {
      id: "microfon",
      title: "Mikrofon",
      description: "Mikrofon erişimine izin verin (sesli mesaj göndermek için)",
      status: "unknown",
      icon: <Mic size={22} color="#e74c3c" />,
    },
    {
      id: "location",
      title: "Konum",
      description:
        "Konum erişimine izin verin (yakınınızdaki etkinlikleri görmek için)",
      status: "unknown",
      icon: <Map size={22} color="#2ecc71" />,
    },
    {
      id: "photos",
      title: "Fotoğraflar",
      description: "Galeri erişimine izin verin (profil fotoğrafı seçmek için)",
      status: "unknown",
      icon: <ImageIcon size={22} color="#9b59b6" />,
    },
  ]);

  // Kullanıcı profili için state tanımlama
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sports, setSports] = useState<
    Array<{
      sport_id: number;
      sport: { id: number; name: string; icon: string; description: string };
    }>
  >([]);

  const [editedProfile, setEditedProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    birthDate: "",
    biography: "",
    profileImage: DEFAULT_PROFILE_IMAGE,
    interests: [] as string[],
  });
  const [friendCount, setFriendCount] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    loadFriendCount();
  }, []);

  const loadFriendCount = async () => {
    try {
      const friends = await friendshipsApi.getFriends();
      setFriendCount(friends.length);
    } catch (e) {
      setFriendCount(0);
    }
  };

  // Orijinal profil verilerini saklamak için yeni state ekleyelim
  const [originalProfile, setOriginalProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    birthDate: "",
    biography: "",
    profileImage: DEFAULT_PROFILE_IMAGE,
    interests: [] as string[],
  });

  // Profil değişikliği yapılıp yapılmadığını kontrol eden değişken
  const [isProfileChanged, setIsProfileChanged] = useState(false);

  // Katıldığım etkinlikler için state
  const [participatedEvents, setParticipatedEvents] = useState<
    ParticipatedEvent[]
  >([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);

  // Profil bilgilerini getirme fonksiyonu
  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Profil bilgileri getiriliyor...");

      // API endpointi: GET /api/profile
      const profileData = await profileService.getProfile();
      console.log("Alınan profil verileri:", profileData);

      // İlgi alanlarını getir
      const sportsData = await profileService.getSports();
      setSports(sportsData);
      console.log("İlgi alanları alındı:", sportsData);

      // Profil verileri geçerli mi kontrol et
      if (!profileData) {
        throw new Error("Sunucudan boş profil verisi alındı");
      }

      setUserProfile(profileData);

      // Düzenleme state'ini güncelle
      const updatedProfile = {
        firstName: profileData.first_name || "",
        lastName: profileData.last_name || "",
        email: profileData.email || "",
        birthDate: profileData.birthday_date || "",
        biography: profileData.bio || "",
        profileImage: profileData.avatar || DEFAULT_PROFILE_IMAGE,
        interests:
          sportsData.map(
            (sportItem: { sport: { name: string } }) => sportItem.sport.name
          ) || [], // İlgi alanlarını kullan
      };

      setEditedProfile(updatedProfile);
      setOriginalProfile(updatedProfile);
      setIsProfileChanged(false);

      console.log("Profil bilgileri başarıyla alındı.");
    } catch (err: any) {
      console.error("Profil verilerini getirme hatası:", err);

      // Daha detaylı hata mesajları
      let errorMessage = "Profil bilgileri alınamadı. Lütfen tekrar deneyin.";

      if (err.response) {
        // Sunucu yanıtı varsa
        const status = err.response.status;

        if (status === 401) {
          errorMessage = "Oturumunuz sona ermiş. Lütfen tekrar giriş yapın.";
        } else if (status === 404) {
          errorMessage = "Profil bilgileri bulunamadı.";
        } else if (status >= 500) {
          errorMessage = "Sunucu hatası. Lütfen daha sonra tekrar deneyin.";
        }
      } else if (err.request) {
        // İstek gönderildi ama yanıt alınamadı
        errorMessage =
          "Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Sayfa yüklendiğinde profil bilgilerini getir
  useEffect(() => {
    fetchProfileData();
    fetchParticipatedEvents();
    loadFriendCount();

    // Etkinlik katılım durumu değiştiğinde etkinlikleri yenile
    const unsubscribe = eventBus.subscribe(
      "EVENT_PARTICIPATION_CHANGED",
      () => {
        console.log(
          "Etkinlik katılım değişikliği algılandı, etkinlikler yenileniyor..."
        );
        fetchParticipatedEvents();
      }
    );

    // Component unmount olduğunda event dinleyicisini temizle
    return () => {
      unsubscribe();
    };
  }, []);

  const handleEditProfile = () => {
    console.log("Profil düzenleme modalı açılıyor");

    // Mevcut profil verilerini al
    const updatedOriginalProfile = {
      firstName: userProfile?.first_name || "",
      lastName: userProfile?.last_name || "",
      email: userProfile?.email || "",
      birthDate: userProfile?.birthday_date || "",
      biography: userProfile?.bio || "",
      profileImage: userProfile?.avatar || DEFAULT_PROFILE_IMAGE,
      interests:
        sports.map(
          (sportItem: { sport: { name: string } }) => sportItem.sport.name
        ) || [],
    };

    // Düzenleme alanlarını mevcut değerlerle doldur
    setEditedProfile(updatedOriginalProfile);

    // Orijinal profil verilerini kaydet
    setOriginalProfile(updatedOriginalProfile);

    // Değişiklik yapılmadığını belirt
    setIsProfileChanged(false);

    // Modalı göster
    setIsEditProfileModalVisible(true);
  };

  const handleSaveProfile = async () => {
    // Doğum tarihi kontrolü
    if (editedProfile.birthDate && !isValidBirthDate(editedProfile.birthDate)) {
      Alert.alert(
        "Hata",
        "Lütfen geçerli bir doğum tarihi giriniz (YYYY-AA-GG formatında).",
        [{ text: "Tamam" }]
      );
      return;
    }

    // E-posta kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editedProfile.email)) {
      Alert.alert("Hata", "Lütfen geçerli bir e-posta adresi giriniz.", [
        { text: "Tamam" },
      ]);
      return;
    }

    try {
      setLoading(true);

      // Profil bilgilerini güncelle
      const updateData = {
        first_name: editedProfile.firstName,
        last_name: editedProfile.lastName,
        email: editedProfile.email,
        birthday_date: editedProfile.birthDate,
        bio: editedProfile.biography,
      };

      console.log("Gönderilen güncelleme verileri:", updateData);

      // API endpointi: PUT /api/profile
      await profileService.updateProfile(updateData);

      // Güncel profil bilgilerini getir
      await fetchProfileData();

      setIsEditProfileModalVisible(false);

      console.log("Profil başarıyla güncellendi");

      Alert.alert("Başarılı", "Profil bilgileriniz başarıyla güncellendi.", [
        { text: "Tamam" },
      ]);
    } catch (error: any) {
      console.error("Profil güncelleme hatası:", error);

      // Daha detaylı hata mesajları
      let errorMessage =
        "Profil bilgileriniz güncellenirken bir hata oluştu. Lütfen tekrar deneyin.";

      if (error.response) {
        // Sunucu yanıtı varsa
        const status = error.response.status;

        if (status === 401) {
          errorMessage = "Oturumunuz sona ermiş. Lütfen tekrar giriş yapın.";
        } else if (status === 400) {
          if (error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
          } else {
            errorMessage =
              "Gönderilen bilgilerde hata var. Lütfen tüm alanları kontrol edin.";
          }
        } else if (status >= 500) {
          errorMessage = "Sunucu hatası. Lütfen daha sonra tekrar deneyin.";
        }
      } else if (error.request) {
        // İstek gönderildi ama yanıt alınamadı
        errorMessage =
          "Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.";
      }

      Alert.alert("Hata", errorMessage, [{ text: "Tamam" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuItemPress = (id: string) => {
    switch (id) {
      case "notifications":
        setIsNotificationsModalVisible(true);
        break;
      case "privacy":
        setIsPrivacyModalVisible(true);
        break;
      case "help":
        // Yardım sayfasına yönlendir veya modal göster
        break;
      case "account":
        setIsAccountSettingsVisible(true);
        break;
      case "reports":
        // Raporlarım sayfasına yönlendir
        router.push("/(tabs)/profile/user-reports");
        break;
      case "logout":
        handleLogout();
        break;
      default:
        break;
    }
  };

  // Kullanıcı çıkışı yapma
  const handleLogout = async () => {
    try {
      await logout();
      router.push("/(auth)/signin");
    } catch (error) {
      console.error("Çıkış yapılırken hata oluştu:", error);
      Alert.alert(
        "Hata",
        "Çıkış yapılırken bir hata oluştu. Lütfen tekrar deneyin."
      );
    }
  };

  const renderMenuItem = (item: MenuItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.menuItem}
      onPress={() => handleMenuItemPress(item.id)}
    >
      <View style={styles.menuIconContainer}>{item.icon}</View>
      <Text style={styles.menuItemText}>{item.title}</Text>
      <ChevronRight size={18} color="#ccc" />
    </TouchableOpacity>
  );

  const handleJoinEvent = (eventId: number) => {
    console.log(`Etkinlik katılım durumu değişti: ${eventId}`);
  };

  const handleRateEvent = (eventId: number) => {
    console.log(`Etkinlik değerlendirilecek: ${eventId}`);
    // Burada değerlendirme modalını gösterme işlemi olabilir
  };

  // Etkinlik detayına gitme
  const handleEventPress = (eventId: number) => {
    console.log(`Etkinlik detayına yönlendiriliyor: ${eventId}`);

    // Doğru rotaya yönlendir
    router.push(`/dashboard/event-details?id=${eventId}`);
  };

  // Handler for profile picture change
  const handleChangeProfilePicture = async () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["İptal", "Kamera", "Galeri"],
          cancelButtonIndex: 0,
          userInterfaceStyle: "light",
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) {
            await takePicture();
          } else if (buttonIndex === 2) {
            await pickImage();
          }
        }
      );
    } else {
      // For Android
      Alert.alert("Profil Fotoğrafı", "Lütfen bir seçenek belirleyin", [
        { text: "İptal", style: "cancel" },
        { text: "Kamera", onPress: takePicture },
        { text: "Galeri", onPress: pickImage },
      ]);
    }
  };

  // Take a picture using the camera
  const takePicture = async () => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "İzin Gerekli",
          "Kamerayı kullanabilmek için izin vermeniz gerekmektedir.",
          [{ text: "Tamam" }]
        );
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled) {
        try {
          setLoading(true);

          // API endpointi: POST /api/profile/avatar
          console.log("Fotoğraf yükleniyor...");
          const avatarUrl = await profileService.uploadAvatar(
            result.assets[0].uri
          );

          console.log("Alınan avatar URL:", avatarUrl);

          if (avatarUrl) {
            // Düzenleme modalında görüntüyü güncelle
            setEditedProfile({
              ...editedProfile,
              profileImage: avatarUrl,
            });

            // userProfile state'ini de direkt güncelle
            if (userProfile) {
              setUserProfile({
                ...userProfile,
                avatar: avatarUrl,
              });
            }

            Alert.alert(
              "Başarılı",
              "Profil fotoğrafınız başarıyla güncellendi."
            );
          } else {
            // Profil verilerini yeniden yükle ve güncel avatar bilgisini al
            const updatedProfile = await profileService.getProfile();

            console.log("Güncel profil verisi:", updatedProfile);

            if (updatedProfile?.avatar) {
              // Hem editedProfile hem de userProfile'ı güncelle
              setEditedProfile({
                ...editedProfile,
                profileImage: updatedProfile.avatar,
              });

              if (userProfile) {
                setUserProfile({
                  ...userProfile,
                  avatar: updatedProfile.avatar,
                });
              }
            }

            Alert.alert(
              "Bilgi",
              "Profil fotoğrafı yüklendi. Profil sayfası yenilendikten sonra görünecektir."
            );
          }

          setLoading(false);
        } catch (error) {
          console.error("Profil fotoğrafı yükleme hatası:", error);
          setLoading(false);
          Alert.alert(
            "Hata",
            "Fotoğraf yüklenirken bir hata oluştu. Lütfen tekrar deneyin."
          );
        }
      }
    } catch (error) {
      console.log("Kamera hatası:", error);
      Alert.alert("Hata", "Fotoğraf çekilirken bir hata oluştu");
    }
  };

  // Handler for picking image from gallery
  const pickImage = async () => {
    try {
      // Request media library permissions
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "İzin Gerekli",
          "Galeriye erişebilmek için izin vermeniz gerekmektedir.",
          [{ text: "Tamam" }]
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled) {
        try {
          setLoading(true);

          // API endpointi: POST /api/profile/avatar (resimdeki endpointe göre)
          console.log("Galeriden seçilen fotoğraf yükleniyor...");
          const avatarUrl = await profileService.uploadAvatar(
            result.assets[0].uri
          );

          console.log("Alınan avatar URL:", avatarUrl);

          if (avatarUrl) {
            // Düzenleme modalında görüntüyü güncelle
            setEditedProfile({
              ...editedProfile,
              profileImage: avatarUrl,
            });

            // userProfile state'ini de direkt güncelle
            if (userProfile) {
              setUserProfile({
                ...userProfile,
                avatar: avatarUrl,
              });
            }

            Alert.alert(
              "Başarılı",
              "Profil fotoğrafınız başarıyla güncellendi."
            );
          } else {
            // Profil verilerini yeniden yükle ve güncel avatar bilgisini al
            const updatedProfile = await profileService.getProfile();

            console.log("Güncel profil verisi:", updatedProfile);

            if (updatedProfile?.avatar) {
              // Hem editedProfile hem de userProfile'ı güncelle
              setEditedProfile({
                ...editedProfile,
                profileImage: updatedProfile.avatar,
              });

              if (userProfile) {
                setUserProfile({
                  ...userProfile,
                  avatar: updatedProfile.avatar,
                });
              }
            }

            Alert.alert(
              "Bilgi",
              "Profil fotoğrafı yüklendi. Profil sayfası yenilendikten sonra görünecektir."
            );
          }

          setLoading(false);
        } catch (error) {
          console.error("Profil fotoğrafı yükleme hatası:", error);
          setLoading(false);
          Alert.alert(
            "Hata",
            "Fotoğraf yüklenirken bir hata oluştu. Lütfen tekrar deneyin."
          );
        }
      }
    } catch (error) {
      console.log("Galeri hatası:", error);
      Alert.alert("Hata", "Resim seçilirken bir hata oluştu");
    }
  };

  // Handler for toggling sports
  const handleToggleSport = (sport: string) => {
    setEditedProfile((prevProfile) => {
      if (prevProfile.interests.includes(sport)) {
        // Remove sport if already selected
        return {
          ...prevProfile,
          interests: prevProfile.interests.filter((item) => item !== sport),
        };
      } else {
        // Add sport if not selected
        return {
          ...prevProfile,
          interests: [...prevProfile.interests, sport],
        };
      }
    });
  };

  // Toggle all notifications
  const toggleNotifications = (value: boolean) => {
    setNotificationsEnabled(value);

    // If turning off all notifications, disable all categories
    if (!value) {
      setNotificationCategories(
        notificationCategories.map((category) => ({
          ...category,
          enabled: false,
        }))
      );
    } else {
      // If turning on notifications, restore defaults
      setNotificationCategories([...defaultNotificationCategories]);
    }
  };

  // Toggle individual notification category
  const toggleNotificationCategory = (categoryId: string, value: boolean) => {
    setNotificationCategories(
      notificationCategories.map((category) =>
        category.id === categoryId ? { ...category, enabled: value } : category
      )
    );

    // If any category is enabled, main toggle should be on
    const anyEnabled = notificationCategories.some((category) =>
      category.id === categoryId ? value : category.enabled
    );

    if (anyEnabled && !notificationsEnabled) {
      setNotificationsEnabled(true);
    }
  };

  // Save notification settings
  const handleSaveNotificationSettings = () => {
    // Here would be API calls to save notification preferences
    Alert.alert(
      "Bildirim Ayarları",
      "Bildirim tercihleriniz başarıyla kaydedildi.",
      [{ text: "Tamam", onPress: () => setIsNotificationsModalVisible(false) }]
    );
  };

  const handlePasswordChange = () => {
    // Password validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Hata", "Lütfen tüm şifre alanlarını doldurunuz.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Hata", "Yeni şifre ve şifre tekrarı eşleşmiyor.");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Hata", "Şifre en az 6 karakter olmalıdır.");
      return;
    }

    console.log("Şifre değiştirme isteği gönderiliyor");

    // API endpointi: PUT /api/profile/password
    profileService
      .changePassword({
        currentPassword,
        newPassword,
        confirmNewPassword: confirmPassword,
      })
      .then(() => {
        console.log("Şifre başarıyla değiştirildi");
        Alert.alert("Başarılı", "Şifreniz başarıyla değiştirildi.", [
          {
            text: "Tamam",
            onPress: () => {
              setCurrentPassword("");
              setNewPassword("");
              setConfirmPassword("");
              setActivePrivacySection(null);
            },
          },
        ]);
      })
      .catch((error: any) => {
        let errorMessage = "Şifre değiştirme sırasında bir hata oluştu.";

        // Eğer belirli bir hata mesajı varsa, onu kullan
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }

        // Özel hata kontrolü
        if (error.response) {
          if (error.response.status === 401) {
            errorMessage = "Mevcut şifreniz yanlış.";

            // Mevcut şifre yanlış olduğunda kullanıcıya uyarı göster, token yenilemeye çalışma
            Alert.alert(
              "Şifre Doğrulama Hatası",
              "Mevcut şifreniz yanlış. Lütfen doğru şifreyi girin.",
              [{ text: "Tamam" }]
            );
            return;
          } else if (error.response.status === 404) {
            errorMessage =
              "İstek yapılan endpoint bulunamadı. Lütfen daha sonra tekrar deneyin.";
          } else if (error.response.status === 400) {
            errorMessage =
              "Geçersiz şifre formatı. Şifreniz en az 6 karakter olmalıdır.";
          }
        }

        Alert.alert("Hata", errorMessage);
      });
  };

  const handleFreezeAccount = async () => {
    Alert.alert(
      "Hesap Dondurma",
      "Hesabınızı dondurmak istediğinize emin misiniz? Bu işlem gerçekleştiğinde hesabınız geçici olarak askıya alınacaktır. 30 gün içinde giriş yapmazsanız hesabınız devre dışı bırakılacaktır.",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Hesabı Dondur",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              // Gerçek API çağrısı
              const result = await profileService.freezeAccount();
              setLoading(false);

              if (result.success) {
                Alert.alert(
                  "Başarılı",
                  result.message ||
                    "Hesabınız başarıyla donduruldu. Tekrar giriş yaparak hesabınızı aktifleştirebilirsiniz.",
                  [
                    {
                      text: "Tamam",
                      onPress: () => {
                        logout();
                        setActivePrivacySection(null);
                        router.push("/(auth)/signin");
                      },
                    },
                  ]
                );
              } else {
                Alert.alert(
                  "Hata",
                  result.message ||
                    "Hesap dondurma işlemi sırasında bir hata oluştu."
                );
              }
            } catch (error) {
              setLoading(false);
              console.error("Hesap dondurma hatası:", error);
              Alert.alert(
                "Hata",
                "Hesap dondurma işlemi sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin."
              );
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Hesap Silme",
      "Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve tüm verileriniz kalıcı olarak silinecektir.",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Hesabı Sil",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              // Gerçek API çağrısı
              const result = await profileService.deleteAccount();
              setLoading(false);

              if (result.success) {
                Alert.alert(
                  "Başarılı",
                  result.message || "Hesabınız başarıyla devre dışı bırakıldı.",
                  [
                    {
                      text: "Tamam",
                      onPress: () => {
                        logout();
                        setActivePrivacySection(null);
                        router.push("/(auth)/signin");
                      },
                    },
                  ]
                );
              } else {
                Alert.alert(
                  "Hata",
                  result.message ||
                    "Hesap silme işlemi sırasında bir hata oluştu."
                );
              }
            } catch (error) {
              setLoading(false);
              console.error("Hesap silme hatası:", error);
              Alert.alert(
                "Hata",
                "Hesap silme işlemi sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin."
              );
            }
          },
        },
      ]
    );
  };

  // Function to close the active privacy section and return to the main menu
  const handleBackToPrivacyMenu = () => {
    setActivePrivacySection(null);
    // Reset form fields
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  // Function to check permission status
  const checkPermissions = async () => {
    try {
      // Create a copy of the current permissions
      const updatedPermissions = [...permissions];

      // Check camera permission
      const cameraPermission = await ImagePicker.getCameraPermissionsAsync();
      const cameraIndex = updatedPermissions.findIndex(
        (p) => p.id === "camera"
      );
      if (cameraIndex !== -1) {
        updatedPermissions[cameraIndex] = {
          ...updatedPermissions[cameraIndex],
          status: cameraPermission.granted
            ? "granted"
            : cameraPermission.canAskAgain
            ? "unknown"
            : "denied",
        };
      }

      // Check media library permission
      const mediaLibraryPermission =
        await ImagePicker.getMediaLibraryPermissionsAsync();
      const photosIndex = updatedPermissions.findIndex(
        (p) => p.id === "photos"
      );
      if (photosIndex !== -1) {
        updatedPermissions[photosIndex] = {
          ...updatedPermissions[photosIndex],
          status: mediaLibraryPermission.granted
            ? "granted"
            : mediaLibraryPermission.canAskAgain
            ? "unknown"
            : "denied",
        };
      }

      // For other permissions, we'd need to use their specific permission APIs
      // This is a simplified example that only checks permissions we have direct access to

      // Update the permissions state
      setPermissions(updatedPermissions);
    } catch (error) {
      console.log("Permission checking error:", error);
    }
  };

  // Function to request permission
  const requestPermission = async (permissionId: string) => {
    try {
      let result;

      if (permissionId === "camera") {
        result = await ImagePicker.requestCameraPermissionsAsync();
      } else if (permissionId === "photos") {
        result = await ImagePicker.requestMediaLibraryPermissionsAsync();
      } else {
        // For other permissions, we would use their specific request methods
        Alert.alert(
          "Uygulama Ayarları",
          "Bu izni ayarlamak için lütfen uygulama ayarlarını açın.",
          [
            { text: "İptal" },
            { text: "Ayarları Aç", onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }

      // After requesting permission, update our state
      const permissionIndex = permissions.findIndex(
        (p) => p.id === permissionId
      );
      if (permissionIndex !== -1) {
        const updatedPermissions = [...permissions];
        updatedPermissions[permissionIndex] = {
          ...updatedPermissions[permissionIndex],
          status: result.granted
            ? "granted"
            : result.canAskAgain
            ? "unknown"
            : "denied",
        };
        setPermissions(updatedPermissions);
      }

      if (!result.granted && !result.canAskAgain) {
        // If permission is denied and we can't ask again, suggest opening settings
        Alert.alert(
          "İzin Reddedildi",
          "Bu izni etkinleştirmek için lütfen uygulama ayarlarını açın.",
          [
            { text: "İptal" },
            { text: "Ayarları Aç", onPress: () => Linking.openSettings() },
          ]
        );
      }
    } catch (error) {
      console.log("Permission request error:", error);
    }
  };

  // Handle deleting the profile picture
  const handleDeleteProfilePicture = () => {
    // Eğer zaten varsayılan fotoğraf kullanılıyorsa işlem yapmaya gerek yok
    if (editedProfile.profileImage === DEFAULT_PROFILE_IMAGE) {
      return;
    }

    Alert.alert(
      "Profil Fotoğrafı Silme",
      "Profil fotoğrafınızı silmek istediğinize emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);

              // API endpointi: DELETE /api/profile/avatar
              const result = await profileService.deleteAvatar();

              if (result.success) {
                console.log(
                  "Silme sonrası varsayılan avatar:",
                  result.defaultAvatarUrl
                );

                // Backend'den gelen varsayılan avatar URL'ini kullan
                const newAvatarUrl =
                  result.defaultAvatarUrl || DEFAULT_PROFILE_IMAGE;

                // Profil verilerini yeniden yükle
                const updatedProfile = await profileService.getProfile();

                console.log("Güncellenen profil verileri:", {
                  backendAvatar: updatedProfile?.avatar,
                  defaultFromResult: result.defaultAvatarUrl,
                  usingAvatar: updatedProfile?.avatar || newAvatarUrl,
                });

                // Profil resmini backend'den gelen avatar ile güncelle veya varsayılan resmi kullan
                setEditedProfile({
                  ...editedProfile,
                  profileImage: updatedProfile?.avatar || newAvatarUrl,
                });

                if (userProfile) {
                  setUserProfile({
                    ...userProfile,
                    avatar: updatedProfile?.avatar || newAvatarUrl,
                  });
                }

                Alert.alert(
                  "Başarılı",
                  result.message || "Profil fotoğrafınız başarıyla silindi."
                );
              } else {
                Alert.alert(
                  "Hata",
                  "Profil fotoğrafı silinirken bir sorun oluştu."
                );
              }
              setLoading(false);
            } catch (error) {
              console.error("Profil fotoğrafı silme hatası:", error);
              setLoading(false);
              Alert.alert(
                "Hata",
                "Profil fotoğrafı silinirken bir hata oluştu. Lütfen tekrar deneyin."
              );
            }
          },
        },
      ]
    );
  };

  // Yaş hesaplama fonksiyonu
  const calculateAge = (birthDateStr: string): number => {
    try {
      const birthDate = new Date(birthDateStr);

      // Geçerli bir tarih kontrolü
      if (isNaN(birthDate.getTime())) {
        return 0;
      }

      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      return age;
    } catch (error) {
      console.error("Yaş hesaplanırken hata oluştu:", error);
      return 0;
    }
  };

  // Doğum tarihi formatını otomatik düzeltme
  const formatBirthDate = (input: string): string => {
    // Sadece sayıları al
    const cleaned = input.replace(/[^0-9]/g, "");

    // Formatlama (YYYY-MM-DD)
    let formatted = "";
    if (cleaned.length <= 4) {
      formatted = cleaned;
    } else if (cleaned.length <= 6) {
      formatted = `${cleaned.substring(0, 4)}-${cleaned.substring(4)}`;
    } else {
      formatted = `${cleaned.substring(0, 4)}-${cleaned.substring(
        4,
        6
      )}-${cleaned.substring(6, 8)}`;
    }

    return formatted;
  };

  // Doğum tarihi kontrolü
  const isValidBirthDate = (dateStr: string): boolean => {
    // YYYY-MM-DD formatını kontrol et
    const dateRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
    const match = dateStr.match(dateRegex);

    if (!match) return false;

    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1; // JavaScript'te ay 0-11 arası
    const day = parseInt(match[3], 10);

    // Geçerli bir tarih mi?
    const birthDate = new Date(year, month, day);
    return (
      birthDate.getFullYear() === year &&
      birthDate.getMonth() === month &&
      birthDate.getDate() === day &&
      birthDate <= new Date()
    );
  };

  // Profil alanı değiştiğinde çağrılan fonksiyon
  const handleProfileChange = (
    field: keyof typeof editedProfile,
    value: string
  ) => {
    setEditedProfile((prev) => {
      const newProfile = { ...prev, [field]: value };

      // Değişiklik yapılıp yapılmadığını kontrol et
      const hasChanged =
        newProfile.firstName !== originalProfile.firstName ||
        newProfile.lastName !== originalProfile.lastName ||
        newProfile.email !== originalProfile.email ||
        newProfile.birthDate !== originalProfile.birthDate ||
        newProfile.biography !== originalProfile.biography;

      console.log(
        `Değişiklik: ${field}=${value}, değişiklik var mı: ${hasChanged}`
      );

      setIsProfileChanged(hasChanged);
      return newProfile;
    });
  };

  // Etkinlikleri veri tabanından çekme fonksiyonu
  const fetchParticipatedEvents = async () => {
    try {
      setEventsLoading(true);
      setEventsError(null);
      console.log("Katıldığım etkinlikler getiriliyor...");

      // EventService kullan
      const response = await eventService.getParticipatedEvents(1, 10);
      console.log(
        "Katıldığım etkinlikler endpointi: /events/my/participated?page=1&limit=10"
      );

      // API yanıtının yapısını kontrol et ve logla
      console.log("API yanıtı alındı, veri kontrolü yapılıyor...");

      if (
        response.data &&
        response.data.status === "success" &&
        response.data.data &&
        response.data.data.events &&
        Array.isArray(response.data.data.events)
      ) {
        console.log(
          "Sunucudan etkinlikler alındı:",
          response.data.data.events.length
        );

        // Etkinlikleri state'e kaydet
        const events = response.data.data.events;
        setParticipatedEvents(events);
      } else {
        console.log(
          "API yanıtında etkinlik verisi bulunamadı veya beklenen formatta değil"
        );
        setParticipatedEvents([]);
        setEventsError("Katıldığınız etkinlik bulunamadı.");
      }
    } catch (error: any) {
      console.error("Katıldığım etkinlikleri getirme hatası:", error);

      let errorMessage = "Etkinlikler yüklenirken bir hata oluştu.";

      // Daha anlaşılır hata mesajları
      if (error.message.includes("Network Error")) {
        errorMessage =
          "Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.";
      } else if (error.response) {
        // Sunucu yanıtı varsa
        if (error.response.status === 401) {
          errorMessage = "Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.";
        } else if (error.response.status === 403) {
          errorMessage = "Bu etkinlikleri görüntüleme yetkiniz yok.";
        } else if (error.response.status === 404) {
          errorMessage = "Kayıtlı etkinlik bulunamadı.";
        } else if (error.response.status >= 500) {
          errorMessage = "Sunucu hatası. Lütfen daha sonra tekrar deneyin.";
        }
      }

      setParticipatedEvents([]);
      setEventsError(errorMessage);
    } finally {
      setEventsLoading(false);
    }
  };

  // İlgi alanlarını getirme fonksiyonu
  const fetchAvailableSports = async () => {
    try {
      const response = await apiClient.get("/sports");
      if (response.data && response.data.data) {
        setAvailableSports(response.data.data);
      }
    } catch (error) {
      console.error("İlgi alanları yüklenirken hata oluştu:", error);
    }
  };

  // İlgi alanlarını güncelleme fonksiyonu
  const updateUserSports = async () => {
    try {
      setLoading(true);

      // Mevcut ve yeni seçilen sporlar arasındaki farkı hesapla
      const currentSportIds = sports.map((s) => s.sport.id);

      // Eklenecek sporlar (yeni seçilip daha önce eklenmemiş olanlar)
      const sportsToAdd = selectedSports.filter(
        (id) => !currentSportIds.includes(id)
      );

      // Kaldırılacak sporlar (daha önce eklenmiş olup şu an seçili olmayanlar)
      const sportsToRemove = currentSportIds.filter(
        (id) => !selectedSports.includes(id)
      );

      // Değişiklik yoksa işlemi sonlandır
      if (sportsToAdd.length === 0 && sportsToRemove.length === 0) {
        setIsSportsModalVisible(false);
        return;
      }

      // API ile her bir işlemi tek tek gerçekleştir
      const updates = [];

      // Eklenecek sporları işle - POST /api/profile/sports
      for (const sportId of sportsToAdd) {
        updates.push(profileService.addSport(sportId));
      }

      // Kaldırılacak sporları işle - DELETE /api/profile/sports/{sportId}
      for (const sportId of sportsToRemove) {
        updates.push(profileService.removeSport(sportId));
      }

      console.log(
        `İlgi alanları güncelleniyor: ${sportsToAdd.length} spor ekleniyor, ${sportsToRemove.length} spor kaldırılıyor`
      );

      // Tüm isteklerin tamamlanmasını bekle
      await Promise.all(updates);

      // Profil bilgilerini güncelle
      await fetchProfileData();
      setIsSportsModalVisible(false);
      Alert.alert("Başarılı", "İlgi alanlarınız güncellendi");
    } catch (error) {
      console.error("İlgi alanları güncellenirken hata oluştu:", error);
      Alert.alert("Hata", "İlgi alanları güncellenirken bir sorun oluştu");
    } finally {
      setLoading(false);
    }
  };

  // Spor seçimini değiştirme fonksiyonu
  const toggleSportSelection = (sportId: number) => {
    setSelectedSports((prevSelectedSports) => {
      if (prevSelectedSports.includes(sportId)) {
        return prevSelectedSports.filter((id) => id !== sportId);
      } else {
        return [...prevSelectedSports, sportId];
      }
    });
  };

  // İlgi alanları değişiklik kontrolü
  const isUserSportsChanged = () => {
    const currentSportIds = sports.map((s) => s.sport.id);
    const sportsToAdd = selectedSports.filter(
      (id) => !currentSportIds.includes(id)
    );
    const sportsToRemove = currentSportIds.filter(
      (id) => !selectedSports.includes(id)
    );

    return sportsToAdd.length > 0 || sportsToRemove.length > 0;
  };

  // İlgi alanları modalını açma fonksiyonu - GET /sports endpoint'i ile
  const openSportsModal = async () => {
    try {
      setLoading(true);
      // Tüm mevcut sporları getir - API endpointi: GET /sports
      const availableSportsData = await profileService.getAllSports();
      console.log(`${availableSportsData.length} spor dalı başarıyla yüklendi`);
      setAvailableSports(availableSportsData);

      // Kullanıcının seçili sporlarını ayarla - API endpointi: GET /api/profile/sports
      // ile önceden çekilmiş sporları kullan
      const userSportIds = sports.map((s) => s.sport.id);
      setSelectedSports(userSportIds);

      console.log(
        `Kullanıcının mevcut ${userSportIds.length} ilgi alanı seçildi`
      );
      setIsSportsModalVisible(true);
    } catch (error) {
      console.error("İlgi alanları yüklenirken hata oluştu:", error);
      Alert.alert("Hata", "İlgi alanları yüklenirken bir sorun oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {loading && !userProfile ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Profil bilgileri yükleniyor...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchProfileData}
          >
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Profil</Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() =>
                  router.push("/(tabs)/profile/find-friends" as any)
                }
              >
                <Users size={24} color="#4e54c8" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => setIsSettingsVisible(true)}
              >
                <Settings size={24} color="#4e54c8" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Profil Bilgileri */}
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 20,
              marginHorizontal: 15,
              marginBottom: 20,
              paddingBottom: 15,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.1,
              shadowRadius: 15,
              elevation: 10,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <LinearGradient
              colors={["#4e54c8", "#8f94fb"]}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 120,
              }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />

            <View
              style={{
                paddingHorizontal: 15,
                paddingTop: 15,
                flexDirection: "row",
              }}
            >
              <View style={{ position: "relative", marginRight: 15 }}>
                <Image
                  source={{ uri: userProfile?.avatar || DEFAULT_PROFILE_IMAGE }}
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: 45,
                    borderWidth: 4,
                    borderColor: "#ffffff",
                  }}
                />
                <TouchableOpacity
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    backgroundColor: "#4e54c8",
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    justifyContent: "center",
                    alignItems: "center",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 3,
                    elevation: 3,
                  }}
                  onPress={handleEditProfile}
                >
                  <Edit3 size={16} color="#fff" />
                </TouchableOpacity>
              </View>

              <View style={{ flex: 1, paddingTop: 10 }}>
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: "bold",
                    color: "#ffffff",
                    marginBottom: 8,
                    textShadowColor: "rgba(0, 0, 0, 0.2)",
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2,
                  }}
                >
                  {userProfile?.name || "Kullanıcı Adı"}
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 6,
                  }}
                >
                  <Mail size={14} color="#ffffff" />
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#ffffff",
                      marginLeft: 8,
                      opacity: 0.9,
                    }}
                  >
                    {userProfile?.email || "Belirtilmemiş"}
                  </Text>
                </View>

                {userProfile?.birthday_date && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 15,
                    }}
                  >
                    <Cake size={14} color="#ffffff" />
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#ffffff",
                        marginLeft: 8,
                        opacity: 0.9,
                      }}
                    >
                      {calculateAge(userProfile.birthday_date)} Yaşında
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {userProfile?.bio && (
              <View
                style={{
                  marginTop: 20,
                  marginHorizontal: 15,
                  padding: 15,
                  backgroundColor: "#f8f9fa",
                  borderRadius: 10,
                }}
              >
                <Text
                  style={{ fontSize: 14, color: "#636e72", lineHeight: 20 }}
                >
                  {userProfile.bio}
                </Text>
              </View>
            )}

            {/* İstatistikler */}
            <View
              style={{
                flexDirection: "row",
                marginTop: 20,
                paddingHorizontal: 15,
              }}
            >
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#f5f6fa",
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderRadius: 50,
                }}
                onPress={() =>
                  router.push("/(tabs)/profile/friends-list" as any)
                }
              >
                <Users size={16} color="#4e54c8" style={{ marginRight: 5 }} />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    color: "#4e54c8",
                    marginRight: 5,
                  }}
                >
                  {userProfile?.friend_count || 0}
                </Text>
                <Text style={{ fontSize: 14, color: "#636e72" }}>Arkadaş</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* İlgi Alanları */}
          <View style={styles.interestsSection}>
            <LinearGradient
              colors={["#f8f9fa", "#e9ecef"]}
              style={styles.interestsBackground}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />

            <View style={styles.sectionHeaderWithAction}>
              <View style={styles.interestsTitleContainer}>
                <Text style={styles.interestsTitle}>İlgi Alanları</Text>
              </View>
              <TouchableOpacity
                style={styles.editInterestsButton}
                onPress={openSportsModal}
              >
                <Edit3 size={18} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <View style={styles.interestsContainer}>
              {sports.length > 0 ? (
                sports.map((sportItem) => (
                  <View key={sportItem.sport_id} style={styles.interestTag}>
                    <Text style={styles.sportIconText}>
                      {sportItem.sport.icon}
                    </Text>
                    <Text style={styles.interestTagText}>
                      {sportItem.sport.name}
                    </Text>
                  </View>
                ))
              ) : (
                <View style={styles.noInterestsContainer}>
                  <Text style={styles.noInterestsText}>
                    Henüz ilgi alanı eklenmemiş
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Raporlarım */}
          <View style={styles.reportsSection}>
            <LinearGradient
              colors={["#fff0f0", "#ffe9e9"]}
              style={styles.reportsBackground}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />

            <View style={styles.sectionHeaderWithAction}>
              <View style={styles.reportsTitleContainer}>
                <Text style={styles.reportsTitle}>Raporlarım</Text>
              </View>
              <TouchableOpacity
                style={styles.reportsActionButton}
                onPress={() => router.push("/(tabs)/profile/user-reports")}
              >
                <ChevronRight size={18} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.reportsCard}
              onPress={() => router.push("/(tabs)/profile/user-reports")}
            >
              <View style={styles.reportsInfoContainer}>
                <AlertCircle size={24} color="#e74c3c" />
                <Text style={styles.reportsText}>
                  Gönderdiğiniz raporları görüntülemek için tıklayın
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Katıldığım Etkinlikler */}
          <View style={styles.eventsSection}>
            <LinearGradient
              colors={["#e6f7ff", "#e1f5fe"]}
              style={styles.eventsBackground}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />

            <View style={styles.eventsSectionHeader}>
              <View style={styles.eventsTitleContainer}>
                <Text style={styles.eventsTitle}>Katıldığım Etkinlikler</Text>
              </View>
              <View style={styles.eventHeaderActions}>
                <TouchableOpacity
                  style={styles.eventsRefreshButton}
                  onPress={fetchParticipatedEvents}
                  disabled={eventsLoading}
                >
                  <RefreshCw size={18} color="#ffffff" />
                </TouchableOpacity>
                <View style={styles.eventsCountBadge}>
                  <Text style={styles.eventsCountText}>
                    {participatedEvents.length}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.eventsContent}>
              {eventsLoading ? (
                <View style={styles.loadingEventsContainer}>
                  <ActivityIndicator size="small" color="#3498db" />
                  <Text style={styles.loadingEventsText}>
                    Etkinlikler yükleniyor...
                  </Text>
                </View>
              ) : eventsError ? (
                <View style={styles.eventsErrorContainer}>
                  <Text style={styles.errorText}>{eventsError}</Text>
                  <TouchableOpacity
                    style={styles.eventsRetryButton}
                    onPress={fetchParticipatedEvents}
                  >
                    <Text style={styles.eventsRetryButtonText}>
                      Tekrar Dene
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : participatedEvents.length > 0 ? (
                participatedEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event as any}
                    onPress={handleEventPress}
                    onJoin={handleJoinEvent}
                  />
                ))
              ) : (
                <View style={styles.noEventsContainer}>
                  <Text style={styles.noEventsText}>
                    Henüz katıldığın bir etkinlik bulunmuyor.
                  </Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.footer}>
            <Text style={styles.versionText}>Uygulama Sürümü: 1.0.0</Text>
          </View>
        </ScrollView>
      )}

      {/* Ayarlar Modal - Modern Tasarım */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isSettingsVisible}
        onRequestClose={() => setIsSettingsVisible(false)}
        statusBarTranslucent={true}
      >
        <View style={styles.modernModalOverlay}>
          <LinearGradient
            colors={["rgba(0,0,0,0.7)", "rgba(0,0,0,0.5)"]}
            style={styles.modernModalBackground}
          />
          <TouchableOpacity
            style={styles.modernModalDismissArea}
            activeOpacity={1}
            onPress={() => setIsSettingsVisible(false)}
          />
          <View style={styles.modernModalContent}>
            <View style={styles.modernModalHandle} />

            <View style={styles.modernModalHeader}>
              <Text style={styles.modernModalTitle}>Ayarlar</Text>
              <TouchableOpacity
                style={styles.modernCloseButton}
                onPress={() => setIsSettingsVisible(false)}
              >
                <X size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.modernMenuItems}>
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.modernMenuItem}
                  onPress={() => {
                    setIsSettingsVisible(false);
                    handleMenuItemPress(item.id);
                  }}
                >
                  <View
                    style={[
                      styles.modernMenuIconContainer,
                      item.id === "logout" && styles.logoutIconContainer,
                    ]}
                  >
                    {item.icon}
                  </View>
                  <Text
                    style={[
                      styles.modernMenuItemText,
                      item.id === "logout" && styles.logoutText,
                    ]}
                  >
                    {item.title}
                  </Text>
                  <ChevronRight
                    size={18}
                    color={item.id === "logout" ? "#e74c3c" : "#4e54c8"}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modernAppVersionContainer}>
              <Text style={styles.modernVersionText}>
                Uygulama Sürümü: 1.0.0
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* Profil Düzenleme Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isEditProfileModalVisible}
        onRequestClose={() => setIsEditProfileModalVisible(false)}
      >
        <View style={styles.editProfileModalOverlay}>
          <View style={styles.editProfileModalContent}>
            <View style={styles.editProfileModalHeader}>
              <Text style={styles.editProfileModalTitle}>Profili Düzenle</Text>
              <TouchableOpacity
                style={styles.editProfileCloseButton}
                onPress={() => setIsEditProfileModalVisible(false)}
              >
                <X size={22} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.editProfileModalBody}>
              {/* Profile Picture Section */}
              <View style={styles.editProfilePictureSection}>
                <View style={styles.editProfileImageContainer}>
                  <Image
                    source={{ uri: editedProfile.profileImage }}
                    style={styles.editProfileImageStyle}
                  />
                </View>
                <View style={styles.editProfilePhotoButtonsContainer}>
                  <TouchableOpacity
                    style={styles.editChangePhotoButton}
                    onPress={handleChangeProfilePicture}
                  >
                    <Camera size={18} color="#fff" style={{ marginRight: 6 }} />
                    <Text style={styles.editChangePhotoText}>
                      Fotoğrafı Değiştir
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.editDeletePhotoButton,
                      editedProfile.profileImage === DEFAULT_PROFILE_IMAGE &&
                        styles.editDeletePhotoButtonDisabled,
                    ]}
                    onPress={handleDeleteProfilePicture}
                    disabled={
                      editedProfile.profileImage === DEFAULT_PROFILE_IMAGE
                    }
                  >
                    <X size={18} color="#fff" style={{ marginRight: 6 }} />
                    <Text
                      style={[
                        styles.editDeletePhotoText,
                        editedProfile.profileImage === DEFAULT_PROFILE_IMAGE &&
                          styles.editDeletePhotoTextDisabled,
                      ]}
                    >
                      Fotoğrafı Sil
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.editProfileFieldsContainer}>
                <View style={styles.editProfileInputGroup}>
                  <Text style={styles.editProfileInputLabel}>Ad</Text>
                  <TextInput
                    style={styles.editProfileTextInput}
                    value={editedProfile.firstName}
                    onChangeText={(text) =>
                      handleProfileChange("firstName", text)
                    }
                    placeholder="Adınız"
                    placeholderTextColor="#aaa"
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.editProfileInputGroup}>
                  <Text style={styles.editProfileInputLabel}>Soyad</Text>
                  <TextInput
                    style={styles.editProfileTextInput}
                    value={editedProfile.lastName}
                    onChangeText={(text) =>
                      handleProfileChange("lastName", text)
                    }
                    placeholder="Soyadınız"
                    placeholderTextColor="#aaa"
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.editProfileInputGroup}>
                  <Text style={styles.editProfileInputLabel}>Doğum Tarihi</Text>
                  <View style={styles.editProfileDateInputContainer}>
                    <TextInput
                      style={styles.editProfileTextInput}
                      value={editedProfile.birthDate}
                      onChangeText={(text) => {
                        const formattedDate = formatBirthDate(text);
                        handleProfileChange("birthDate", formattedDate);
                      }}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#aaa"
                      keyboardType="numbers-and-punctuation"
                      maxLength={10}
                    />
                    <Calendar
                      size={18}
                      color="#777"
                      style={{ position: "absolute", right: 12, bottom: 10 }}
                    />
                  </View>
                </View>

                <View style={styles.editProfileInputGroup}>
                  <Text style={styles.editProfileInputLabel}>Biyografi</Text>
                  <TextInput
                    style={[
                      styles.editProfileTextInput,
                      styles.editProfileBiographyInput,
                    ]}
                    value={editedProfile.biography}
                    onChangeText={(text) =>
                      handleProfileChange("biography", text)
                    }
                    placeholder="Kendinizi kısaca tanıtın..."
                    placeholderTextColor="#aaa"
                    multiline={true}
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.editProfileSaveButton,
                  !isProfileChanged && styles.editProfileSaveButtonDisabled,
                ]}
                onPress={handleSaveProfile}
                disabled={loading || !isProfileChanged}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.editProfileSaveButtonText}>Kaydet</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Bildirim Ayarları Modal - Modern Tasarım */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isNotificationsModalVisible}
        onRequestClose={() => setIsNotificationsModalVisible(false)}
        statusBarTranslucent={true}
      >
        <View style={styles.modernModalOverlay}>
          <LinearGradient
            colors={["rgba(0,0,0,0.7)", "rgba(0,0,0,0.5)"]}
            style={styles.modernModalBackground}
          />
          <TouchableOpacity
            style={styles.modernModalDismissArea}
            activeOpacity={1}
            onPress={() => setIsNotificationsModalVisible(false)}
          />
          <View style={styles.modernModalContent}>
            <View style={styles.modernModalHandle} />

            <View style={styles.modernModalHeader}>
              <Text style={styles.modernModalTitle}>Bildirim Ayarları</Text>
              <TouchableOpacity
                style={styles.modernCloseButton}
                onPress={() => setIsNotificationsModalVisible(false)}
              >
                <X size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modernNotificationBody}>
              {/* Ana bildirim açma/kapatma düğmesi */}
              <View style={styles.modernMainToggleContainer}>
                <View style={styles.modernToggleInfo}>
                  <View style={styles.modernNotificationIconContainer}>
                    <Bell size={20} color="#fff" />
                  </View>
                  <View>
                    <Text style={styles.modernToggleTitle}>
                      Tüm Bildirimleri Etkinleştir
                    </Text>
                    <Text style={styles.modernToggleDescription}>
                      Tüm bildirimleri açıp kapatın
                    </Text>
                  </View>
                </View>
                <Switch
                  trackColor={{ false: "#e0e0e0", true: "#8f94fb" }}
                  thumbColor={notificationsEnabled ? "#4e54c8" : "#f4f3f4"}
                  ios_backgroundColor="#e0e0e0"
                  onValueChange={toggleNotifications}
                  value={notificationsEnabled}
                />
              </View>

              <View style={styles.modernCategoryHeaderContainer}>
                <Text style={styles.modernCategoryHeaderTitle}>
                  Bildirim Tercihleri
                </Text>
              </View>

              {/* Bildirim kategorileri */}
              <View style={styles.modernCategoryContainer}>
                {notificationCategories.map((category) => (
                  <View key={category.id} style={styles.modernCategoryItem}>
                    <View style={styles.modernCategoryItemInfo}>
                      <Text style={styles.modernCategoryTitle}>
                        {category.title}
                      </Text>
                      <Text style={styles.modernCategoryDescription}>
                        {category.description}
                      </Text>
                    </View>
                    <Switch
                      trackColor={{ false: "#e0e0e0", true: "#8f94fb" }}
                      thumbColor={category.enabled ? "#4e54c8" : "#f4f3f4"}
                      ios_backgroundColor="#e0e0e0"
                      onValueChange={(value) =>
                        toggleNotificationCategory(category.id, value)
                      }
                      value={category.enabled}
                      disabled={!notificationsEnabled}
                    />
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={styles.modernSaveButton}
                onPress={handleSaveNotificationSettings}
              >
                <Text style={styles.modernSaveButtonText}>Kaydet</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Gizlilik ve Güvenlik Modal - Modern Tasarım */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isPrivacyModalVisible}
        onRequestClose={() => {
          setActivePrivacySection(null);
          setIsPrivacyModalVisible(false);
        }}
        statusBarTranslucent={true}
      >
        <View style={styles.modernModalOverlay}>
          <LinearGradient
            colors={["rgba(0,0,0,0.7)", "rgba(0,0,0,0.5)"]}
            style={styles.modernModalBackground}
          />
          <TouchableOpacity
            style={styles.modernModalDismissArea}
            activeOpacity={1}
            onPress={() => {
              setActivePrivacySection(null);
              setIsPrivacyModalVisible(false);
            }}
          />
          <View style={styles.modernModalContent}>
            <View style={styles.modernModalHandle} />

            <View style={styles.modernModalHeader}>
              <Text style={styles.modernModalTitle}>
                {activePrivacySection === null
                  ? "Gizlilik ve Güvenlik"
                  : activePrivacySection === "password"
                  ? "Şifre Değiştir"
                  : activePrivacySection === "freeze"
                  ? "Hesabı Dondur"
                  : "Hesabı Sil"}
              </Text>
              {activePrivacySection !== null ? (
                <TouchableOpacity
                  style={styles.modernCloseButton}
                  onPress={handleBackToPrivacyMenu}
                >
                  <ArrowLeft size={20} color="#fff" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.modernCloseButton}
                  onPress={() => setIsPrivacyModalVisible(false)}
                >
                  <X size={20} color="#fff" />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView style={styles.modernNotificationBody}>
              {activePrivacySection === null ? (
                // Main Privacy and Security Menu
                <View>
                  <TouchableOpacity
                    style={styles.privacyMenuItem}
                    onPress={() => setActivePrivacySection("password")}
                  >
                    <View style={styles.privacyMenuIconContainer}>
                      <Shield size={22} color="#3498db" />
                    </View>
                    <View style={styles.privacyMenuTextContainer}>
                      <Text style={styles.privacyMenuTitle}>
                        Şifre Değiştirme
                      </Text>
                      <Text style={styles.privacyMenuDescription}>
                        Hesap şifrenizi değiştirin
                      </Text>
                    </View>
                    <ChevronRight size={18} color="#ccc" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.privacyMenuItem}
                    onPress={() => setActivePrivacySection("permissions")}
                  >
                    <View style={styles.privacyMenuIconContainer}>
                      <BookOpen size={22} color="#27ae60" />
                    </View>
                    <View style={styles.privacyMenuTextContainer}>
                      <Text style={styles.privacyMenuTitle}>İzinler</Text>
                      <Text style={styles.privacyMenuDescription}>
                        Uygulama izinlerini yönet
                      </Text>
                    </View>
                    <ChevronRight size={18} color="#ccc" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.privacyMenuItem}
                    onPress={() => setActivePrivacySection("freeze")}
                  >
                    <View style={styles.privacyMenuIconContainer}>
                      <Clock size={22} color="#f39c12" />
                    </View>
                    <View style={styles.privacyMenuTextContainer}>
                      <Text style={styles.privacyMenuTitle}>
                        Hesabı Dondurma
                      </Text>
                      <Text style={styles.privacyMenuDescription}>
                        Hesabınızı geçici olarak askıya alın
                      </Text>
                    </View>
                    <ChevronRight size={18} color="#ccc" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.privacyMenuItem}
                    onPress={() => setActivePrivacySection("delete")}
                  >
                    <View style={styles.privacyMenuIconContainer}>
                      <X size={22} color="#e74c3c" />
                    </View>
                    <View style={styles.privacyMenuTextContainer}>
                      <Text style={styles.privacyMenuTitle}>Hesabı Silme</Text>
                      <Text style={styles.privacyMenuDescription}>
                        Hesabınızı ve tüm verilerinizi kalıcı olarak silin
                      </Text>
                    </View>
                    <ChevronRight size={18} color="#ccc" />
                  </TouchableOpacity>
                </View>
              ) : activePrivacySection === "password" ? (
                // Password Change Form
                <View style={styles.securitySection}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Mevcut Şifre</Text>
                    <TextInput
                      style={styles.textInput}
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                      placeholder="Mevcut şifrenizi girin"
                      secureTextEntry={true}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Yeni Şifre</Text>
                    <TextInput
                      style={styles.textInput}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      placeholder="Yeni şifrenizi girin"
                      secureTextEntry={true}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Yeni Şifre Tekrar</Text>
                    <TextInput
                      style={styles.textInput}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Yeni şifrenizi tekrar girin"
                      secureTextEntry={true}
                    />
                  </View>

                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handlePasswordChange}
                  >
                    <Text style={styles.primaryButtonText}>
                      Şifreyi Değiştir
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : activePrivacySection === "permissions" ? (
                // Permissions Section
                <View style={styles.securitySection}>
                  <Text style={styles.securityDescription}>
                    Uygulama özelliklerini kullanmak için aşağıdaki izinlere
                    erişim vermeniz gerekiyor. İzin durumunu değiştirmek için
                    ilgili butona tıklayın.
                  </Text>

                  {permissions.map((permission) => (
                    <TouchableOpacity
                      key={permission.id}
                      style={styles.permissionItem}
                      onPress={() => requestPermission(permission.id)}
                    >
                      <View style={styles.permissionIconContainer}>
                        {permission.icon}
                      </View>
                      <View style={styles.permissionContent}>
                        <View style={styles.permissionHeader}>
                          <Text style={styles.permissionTitle}>
                            {permission.title}
                          </Text>
                          {permission.status === "granted" && (
                            <View style={styles.permissionGrantedBadge}>
                              <Check size={14} color="#fff" />
                            </View>
                          )}
                        </View>
                        <Text style={styles.permissionDescription}>
                          {permission.description}
                        </Text>
                        <View style={styles.permissionStatus}>
                          <View
                            style={[
                              styles.permissionStatusIndicator,
                              permission.status === "granted"
                                ? styles.permissionGranted
                                : permission.status === "denied"
                                ? styles.permissionDenied
                                : styles.permissionUnknown,
                            ]}
                          />
                          <Text style={styles.permissionStatusText}>
                            {permission.status === "granted"
                              ? "İzin Verildi"
                              : permission.status === "denied"
                              ? "İzin Reddedildi"
                              : "İzin Belirlenmedi"}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}

                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => Linking.openSettings()}
                  >
                    <Text style={styles.secondaryButtonText}>
                      Tüm İzinleri Uygulama Ayarlarında Yönet
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : activePrivacySection === "freeze" ? (
                // Account Freeze Section
                <View style={styles.securitySection}>
                  <Text style={styles.securityDescription}>
                    Hesabınızı dondurduğunuzda, profiliniz diğer kullanıcılara
                    görünmez olacak ve etkinliklere katılamazsınız. İstediğiniz
                    zaman tekrar giriş yaparak hesabınızı
                    aktifleştirebilirsiniz.
                  </Text>

                  <TouchableOpacity
                    style={styles.accountActionButton}
                    onPress={handleFreezeAccount}
                  >
                    <Text style={styles.accountActionButtonText}>
                      Hesabımı Dondur
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                // Account Deletion Section
                <View style={styles.securitySection}>
                  <Text style={styles.securityDescription}>
                    Hesabınızı sildiğinizde, tüm kişisel bilgileriniz,
                    etkinlikleriniz, mesajlarınız ve değerlendirmeleriniz kalıcı
                    olarak silinecektir. Bu işlem geri alınamaz.
                  </Text>

                  <TouchableOpacity
                    style={styles.dangerButton}
                    onPress={handleDeleteAccount}
                  >
                    <Text style={styles.dangerButtonText}>
                      Hesabımı Kalıcı Olarak Sil
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* İlgi Alanları Düzenleme Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isSportsModalVisible}
        onRequestClose={() => setIsSportsModalVisible(false)}
      >
        <View style={styles.editProfileModalOverlay}>
          <View style={styles.editProfileModalContent}>
            <View style={styles.editProfileModalHeader}>
              <Text style={styles.editProfileModalTitle}>
                İlgi Alanlarını Düzenle
              </Text>
              <TouchableOpacity
                style={styles.editProfileCloseButton}
                onPress={() => setIsSportsModalVisible(false)}
              >
                <X size={22} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.editProfileModalBody}>
              <Text style={styles.sportsModalDescription}>
                İlgilendiğiniz spor dallarını seçin. Birden fazla seçim
                yapabilirsiniz.
              </Text>

              <View style={styles.sportsGrid}>
                {availableSports.map((sport) => (
                  <TouchableOpacity
                    key={sport.id}
                    style={[
                      styles.modernSportItem,
                      selectedSports.includes(sport.id) &&
                        styles.modernSelectedSportItem,
                    ]}
                    onPress={() => toggleSportSelection(sport.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.modernSportEmoji}>{sport.icon}</Text>
                    <Text
                      style={[
                        styles.modernSportItemText,
                        selectedSports.includes(sport.id) &&
                          styles.modernSelectedSportItemText,
                      ]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {sport.name}
                    </Text>
                    {selectedSports.includes(sport.id) && (
                      <View style={styles.modernCheckmarkContainer}>
                        <Check size={16} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.editProfileSaveButton,
                  (!isUserSportsChanged() || loading) &&
                    styles.editProfileSaveButtonDisabled,
                ]}
                onPress={updateUserSports}
                disabled={!isUserSportsChanged() || loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.editProfileSaveButtonText}>Kaydet</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Hesap Ayarları Modal */}
      <Modal
        visible={isAccountSettingsVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAccountSettingsVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.accountModalContent}>
            <AccountSettings
              onClose={() => setIsAccountSettingsVisible(false)}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  // Modern Ayarlar Modal Stilleri
  modernModalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modernModalBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modernModalDismissArea: {
    flex: 1,
  },
  modernModalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  modernModalHandle: {
    alignSelf: "center",
    width: 40,
    height: 5,
    backgroundColor: "#ddd",
    borderRadius: 3,
    marginTop: 10,
    marginBottom: 15,
  },
  modernModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modernModalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  modernCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#4e54c8",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  modernMenuItems: {
    marginBottom: 20,
  },
  modernMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  modernMenuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f4ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  logoutIconContainer: {
    backgroundColor: "#ffeaea",
  },
  modernMenuItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  logoutText: {
    color: "#e74c3c",
    fontWeight: "600",
  },
  modernAppVersionContainer: {
    alignItems: "center",
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  modernVersionText: {
    fontSize: 14,
    color: "#95a5a6",
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 14,
    color: "#e74c3c",
    textAlign: "center",
    marginBottom: 10,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#3498db",
    borderRadius: 20,
    marginTop: 10,
  },
  retryButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  headerTitle: {
    lineHeight: 0,
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    marginLeft: 16,
  },
  profileSection: {
    position: "relative",
    backgroundColor: "#fff",
    borderRadius: 20,
    marginHorizontal: 15,
    marginBottom: 20,
    paddingBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
    overflow: "hidden",
  },
  profileBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 110,
  },
  profileContent: {
    flexDirection: "row",
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  profileImageContainer: {
    position: "relative",
    marginRight: 15,
  },
  profileImage: {
    width: 85,
    height: 85,
    borderRadius: 42.5,
    borderWidth: 4,
    borderColor: "#ffffff",
  },
  profileDetails: {
    flex: 1,
    paddingTop: 10,
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: "#ffffff",
    marginLeft: 8,
    opacity: 0.9,
  },
  bioContainer: {
    marginTop: 12,
    marginHorizontal: 20,
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
  },
  bioText: {
    fontSize: 14,
    color: "#636e72",
    lineHeight: 20,
  },
  statIcon: {
    marginRight: 5,
  },
  profileSection_old: {
    backgroundColor: "#fff",
    borderRadius: 15,
    marginHorizontal: 15,
    marginBottom: 20,
    paddingVertical: 20,
    paddingHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  profileImage_old: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: "#f0f0f0",
  },
  profileInfo: {
    flex: 1,
    marginLeft: 15,
  },
  userName_old: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  proBadge: {
    backgroundColor: "#f1c40f",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  proBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: "#7f8c8d",
    marginLeft: 4,
  },
  ageContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  ageText: {
    fontSize: 14,
    color: "#7f8c8d",
    marginLeft: 4,
  },
  joinDateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  joinDateText: {
    fontSize: 14,
    color: "#7f8c8d",
    marginLeft: 4,
  },
  editButton: {
    backgroundColor: "#3498db",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    borderRightWidth: 1,
    borderRightColor: "#f0f0f0",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 15,
    marginHorizontal: 15,
    marginBottom: 20,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 0,
  },
  eventCountBadge: {
    backgroundColor: "#3498db",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  eventCountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 15,
    paddingTop: 5,
  },
  interestTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e9e9ef",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  interestTagText: {
    color: "#333",
    fontSize: 13,
    fontWeight: "500",
  },
  sportIconText: {
    fontSize: 16,
    marginRight: 8,
  },
  menuContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    marginHorizontal: 15,
    marginBottom: 20,
    paddingVertical: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  menuIconContainer: {
    width: 35,
    alignItems: "center",
    marginRight: 15,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  footer: {
    alignItems: "center",
    marginVertical: 20,
  },
  versionText: {
    fontSize: 14,
    color: "#95a5a6",
  },
  eventCard: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 0,
  },
  activeEventCard: {
    borderWidth: 2,
    borderColor: "#22C55E80", // Daha görünür yeşil çerçeve
    // Çok açık yeşil arka plan
  },
  completedEventCard: {
    borderWidth: 2,
    borderColor: "#EAB30880", // Yumuşak sarı border
  },
  eventHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  dateBox: {
    width: 50,
    height: 50,
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  dateNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
  },
  dateMonth: {
    fontSize: 12,
    color: "#ffffff",
    textTransform: "uppercase",
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#333",
    marginBottom: 6,
  },
  eventMetaInfo: {
    flexDirection: "column",
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  metaText: {
    fontSize: 14,
    color: "#666",
  },
  purposeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  workTag: {
    backgroundColor: "#ffebee",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  meetingTag: {
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  tagText: {
    fontSize: 12,
    color: "#333",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  ratingInfo: {
    backgroundColor: "#fff9e6",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 12,
  },
  ratingText: {
    fontSize: 12,
    color: "#f59e0b",
  },
  rateButton: {
    backgroundColor: "#fff9e6",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f59e0b",
  },
  rateButtonText: {
    color: "#f59e0b",
    fontSize: 11,
    fontWeight: "500",
  },
  moreButton: {
    padding: 5,
    height: 30,
  },
  noEventsMessage: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  noEventsText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "80%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  modalBody: {
    maxHeight: "90%",
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  interestsEditContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  interestEditTag: {
    backgroundColor: "#e8f4fc",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  interestEditTagText: {
    color: "#3498db",
    fontSize: 14,
    fontWeight: "500",
    marginRight: 6,
  },
  removeInterestButton: {
    backgroundColor: "#3498db",
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  addInterestContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  interestInput: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginRight: 10,
  },
  addInterestButton: {
    backgroundColor: "#3498db",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  addInterestButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: "#2ecc71",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  saveButtonDisabled: {
    backgroundColor: "#a5d6a7",
    opacity: 0.7,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  biographyContainer: {
    padding: 16,
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 16,
  },
  biographyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  biographyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3498db",
    marginLeft: 6,
  },
  biographyText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  biographyInput: {
    height: 100,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  profilePictureSection: {
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  editProfileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: "#f0f0f0",
  },
  photoButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    gap: 10,
  },
  changePhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3498db",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  deletePhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e74c3c",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  deletePhotoButtonDisabled: {
    backgroundColor: "#f1c1bd",
    opacity: 0.7,
  },
  photoButtonIcon: {
    marginRight: 8,
  },
  changePhotoText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  deletePhotoText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  deletePhotoTextDisabled: {
    color: "#f8e8e7",
  },
  // Edit Profile Modal Styles
  editProfileModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  editProfileModalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: "92%",
    minHeight: "50%",
    paddingBottom: 30,
  },
  editProfileModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
    backgroundColor: "#4e54c8",
  },
  editProfileModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  editProfileCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  editProfileModalBody: {
    padding: 20,
  },
  editProfilePictureSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  editProfileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    marginBottom: 20,
    borderWidth: 3,
    borderColor: "#4e54c8",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  editProfileImageStyle: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editProfilePhotoButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    gap: 15,
  },
  editChangePhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4e54c8",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  editDeletePhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e74c3c",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  editDeletePhotoButtonDisabled: {
    backgroundColor: "#f1c1bd",
    opacity: 0.7,
  },
  editChangePhotoText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  editDeletePhotoText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  editDeletePhotoTextDisabled: {
    color: "#f8e8e7",
  },
  editProfileFieldsContainer: {
    marginBottom: 20,
  },
  editProfileInputGroup: {
    marginBottom: 20,
  },
  editProfileInputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  editProfileTextInput: {
    backgroundColor: "#f5f7fa",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e6ed",
    color: "#333",
  },
  editProfileDateInputContainer: {
    position: "relative",
  },
  editProfileBiographyInput: {
    height: 120,
    textAlignVertical: "top",
    paddingTop: 15,
  },
  editProfileSaveButton: {
    backgroundColor: "#4e54c8",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  editProfileSaveButtonDisabled: {
    backgroundColor: "#a0a3db",
    opacity: 0.7,
  },
  editProfileSaveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  sportSelectionLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    marginTop: 15,
    marginBottom: 10,
  },
  sportCategoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
  },
  sportCategoryItem: {
    backgroundColor: "#f1f3f5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedSportCategory: {
    backgroundColor: "#e3f2fd",
    borderWidth: 1,
    borderColor: "#1c7ed6",
  },
  sportCategoryText: {
    fontSize: 14,
    color: "#666",
  },
  selectedSportCategoryText: {
    color: "#1c7ed6",
    fontWeight: "500",
  },
  notificationToggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  notificationToggleInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  notificationToggleTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  notificationToggleDesc: {
    fontSize: 13,
    color: "#777",
  },
  notificationCategoriesHeader: {
    marginTop: 15,
    marginBottom: 10,
  },
  notificationCategoriesTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  notificationCategoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  notificationCategoryInfo: {
    flex: 1,
    paddingRight: 15,
  },
  notificationCategoryTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  notificationCategoryDesc: {
    fontSize: 12,
    color: "#777",
    lineHeight: 16,
  },
  securitySection: {
    padding: 10,
  },
  securityDescription: {
    fontSize: 15,
    color: "#555",
    lineHeight: 22,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: "#3498db",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  accountActionButton: {
    backgroundColor: "#f39c12",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  accountActionButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  dangerButton: {
    backgroundColor: "#e74c3c",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  dangerButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  accountActionDescription: {
    fontSize: 14,
    color: "#777",
    lineHeight: 20,
    marginTop: 8,
  },
  privacyMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  privacyMenuIconContainer: {
    width: 35,
    alignItems: "center",
    marginRight: 15,
  },
  privacyMenuTextContainer: {
    flex: 1,
  },
  privacyMenuTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  privacyMenuDescription: {
    fontSize: 14,
    color: "#777",
  },
  permissionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  permissionIconContainer: {
    width: 35,
    alignItems: "center",
    marginRight: 15,
  },
  permissionContent: {
    flex: 1,
  },
  permissionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  permissionGrantedBadge: {
    backgroundColor: "#2ecc71",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  permissionDescription: {
    fontSize: 14,
    color: "#777",
  },
  permissionStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  permissionStatusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  permissionGranted: {
    backgroundColor: "#2ecc71",
  },
  permissionDenied: {
    backgroundColor: "#e74c3c",
  },
  permissionUnknown: {
    backgroundColor: "#f39c12",
  },
  permissionStatusText: {
    fontSize: 12,
    color: "#777",
  },
  secondaryButton: {
    backgroundColor: "#3498db",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  secondaryButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  ageCalculationText: {
    fontSize: 14,
    color: "#7f8c8d",
    marginTop: 5,
  },
  dateInputContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  invalidDateInput: {
    borderColor: "#e74c3c",
    backgroundColor: "#fdf1f0",
  },
  validDateIcon: {
    position: "absolute",
    right: 12,
  },
  invalidAgeText: {
    color: "#e74c3c",
  },
  settingsButton: {
    marginLeft: 16,
  },
  profileImageContainer_old: {
    flexDirection: "row",
    alignItems: "center",
  },
  editProfilePicButton: {
    marginLeft: 10,
  },
  memberSince: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 4,
  },
  memberIcon: {
    marginRight: 4,
  },
  bioText_old: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
  },
  editProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  editProfileText: {
    color: "#3498db",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 5,
  },
  loadingEventsContainer: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingEventsText: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
  },
  sportInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sportEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  sportName: {
    fontSize: 14,
    color: "#444444",
    fontWeight: "500",
  },
  eventInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  statusActiveText: {
    backgroundColor: "#e8f4fc",
    color: "#3498db",
  },
  statusPendingText: {
    backgroundColor: "#fff9e6",
    color: "#f59e0b",
  },
  statusCompletedText: {
    backgroundColor: "#e8f5e9",
    color: "#22c55e",
  },
  eventTime: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  timeText: {
    fontSize: 12,
    color: "#666666",
    marginLeft: 4,
  },
  eventLocation: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  noInterestsText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginVertical: 15,
    fontStyle: "italic",
  },
  sectionHeaderWithAction: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  editInterestsButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "#786cff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  interestsSection: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginHorizontal: 15,
    marginBottom: 20,
    overflow: "hidden",
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    position: "relative",
  },
  interestsBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 70,
  },
  interestsTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  interestsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 4,
  },
  sportIconText_old: {
    fontSize: 18,
    marginRight: 8,
  },
  noInterestsContainer: {
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  modalDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    lineHeight: 20,
  },
  sportsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  sportItem: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  selectedSportItem: {
    backgroundColor: "#e3f2fd",
    borderColor: "#1c7ed6",
  },
  sportItemText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  selectedSportItemText: {
    color: "#1c7ed6",
    fontWeight: "500",
  },
  checkmarkContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#1c7ed6",
    justifyContent: "center",
    alignItems: "center",
  },
  refreshButton: {
    marginRight: 10,
    padding: 5,
  },
  eventHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  eventsSection: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginHorizontal: 15,
    marginBottom: 20,
    overflow: "hidden",
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    position: "relative",
  },
  eventsBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 70,
  },
  eventsSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 15,
    marginBottom: 15,
  },
  eventsTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 4,
  },
  eventsRefreshButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "#3498db",
    marginRight: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  eventsCountBadge: {
    backgroundColor: "#3498db",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 2,
    borderColor: "#fff",
  },
  eventsCountText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  eventsContent: {
    paddingHorizontal: 15,
  },
  eventsErrorContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff8f8",
    borderRadius: 12,
    marginBottom: 15,
  },
  eventsRetryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#3498db",
    borderRadius: 20,
    marginTop: 10,
  },
  eventsRetryButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  noEventsContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  accountModalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "80%",
    paddingBottom: 20,
  },
  reportsContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#e74c3c",
  },
  reportsSection: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginHorizontal: 15,
    marginBottom: 20,
    overflow: "hidden",
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    position: "relative",
  },
  reportsBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 70,
  },
  reportsTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  reportsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 4,
  },
  reportsActionButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "#e74c3c",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  reportsCard: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginTop: 10,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportsInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  reportsText: {
    fontSize: 14,
    color: "#e74c3c",
    marginLeft: 12,
    flex: 1,
  },
  sportsModalDescription: {
    fontSize: 15,
    color: "#555",
    lineHeight: 20,
    marginBottom: 20,
    textAlign: "center",
  },
  modernSportItem: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#f5f7fa",
    borderWidth: 1,
    borderColor: "#e0e6ed",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  modernSelectedSportItem: {
    backgroundColor: "#e3effd",
    borderColor: "#4e54c8",
  },
  modernSportEmoji: {
    fontSize: 22,
    marginRight: 8,
  },
  modernSportItemText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
    fontWeight: "500",
  },
  modernSelectedSportItemText: {
    color: "#4e54c8",
    fontWeight: "600",
  },
  modernCheckmarkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#4e54c8",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  // Modern Bildirim Ayarları Stilleri
  modernNotificationBody: {
    paddingHorizontal: 5,
  },
  modernMainToggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    marginVertical: 10,
    backgroundColor: "#f8f9fa",
    borderRadius: 16,
    paddingHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  modernToggleInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  modernNotificationIconContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4e54c8",
    borderRadius: 20,
    marginRight: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  modernToggleTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  modernToggleDescription: {
    fontSize: 13,
    color: "#777",
  },
  modernCategoryHeaderContainer: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    marginBottom: 10,
  },
  modernCategoryHeaderTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4e54c8",
  },
  modernCategoryContainer: {
    marginBottom: 15,
  },
  modernCategoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: "#f8f9fa",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  modernCategoryItemInfo: {
    flex: 1,
    paddingRight: 15,
  },
  modernCategoryTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  modernCategoryDescription: {
    fontSize: 13,
    color: "#777",
    lineHeight: 18,
  },
  modernSaveButton: {
    backgroundColor: "#4e54c8",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  modernSaveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
