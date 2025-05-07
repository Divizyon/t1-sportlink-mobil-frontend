import { Text } from "@/components/ui/text";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
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
} from "lucide-react-native";
import React, { useState, useEffect } from "react";
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
import apiClient from "../../../src/api";
import profileService from "@/src/api/profileService";
import { UserProfile } from "@/src/types";
import eventService from "@/src/api/eventService";
import EventCard from "@/components/profile/EventCard";

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

// Örnek kullanıcı bilgileri
const userData = {
  firstName: "Özgür",
  lastName: "Eren",
  name: "Özgür Eren",
  email: "ozgur.eren@example.com",
  memberSince: "Nisan 2023",
  profileImage: "https://randomuser.me/api/portraits/men/32.jpg",
  birthDate: "1995-06-15",
  biography:
    "Spor tutkunu, aktif yaşam tarzını seven ve yeni insanlar tanımayı seven biriyim. Haftada en az 3 kez koşu ve fitness yapıyorum. Özellikle takım sporlarına ilgi duyuyorum.",
  stats: {
    events: 12,
    friends: 28,
  },
  interests: ["Basketbol", "Futbol", "Yüzme", "Koşu", "Tenis"],
};

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

  const [editedProfile, setEditedProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    birthDate: "",
    biography: "",
    profileImage: DEFAULT_PROFILE_IMAGE,
    interests: [] as string[],
  });

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

      const profileData = await profileService.getProfile();
      console.log("Alınan profil verileri:", profileData);

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
        interests: userData.interests || [], // Şimdilik userData'dan al
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
      interests: userData.interests || [],
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

      // Backende güncelleme isteği gönder
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

  const handleMenuItemPress = (itemId: string) => {
    console.log(`Menü öğesi tıklandı: ${itemId}`);
    setIsSettingsVisible(false);

    if (itemId === "notifications") {
      setIsNotificationsModalVisible(true);
    } else if (itemId === "privacy") {
      setIsPrivacyModalVisible(true);
      // Check permissions when privacy menu is opened
      checkPermissions();
    } else if (itemId === "logout") {
      handleLogout();
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

    // // Doğru rotaya yönlendir
    // router.push({
    //   pathname: "/(tabs)/events/[id]",
    //   params: { id: eventId.toString() },
    // });
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
          // Avatar yükle
          const avatarUrl = await profileService.uploadAvatar(
            result.assets[0].uri
          );

          // Düzenleme modalında görüntüyü güncelle
          setEditedProfile({
            ...editedProfile,
            profileImage: avatarUrl || result.assets[0].uri,
          });

          // Profil verilerini yeniden yükle
          await fetchProfileData();
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
          // Avatar yükle
          const avatarUrl = await profileService.uploadAvatar(
            result.assets[0].uri
          );

          // Düzenleme modalında görüntüyü güncelle
          setEditedProfile({
            ...editedProfile,
            profileImage: avatarUrl || result.assets[0].uri,
          });

          // Profil verilerini yeniden yükle
          await fetchProfileData();
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

    // Doğrudan şifre değiştirme isteği gönder, önce profil kontrolü yapma
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

  const handleFreezeAccount = () => {
    Alert.alert(
      "Hesap Dondurma",
      "Hesabınızı dondurmak istediğinize emin misiniz? Bu işlem gerçekleştiğinde hesabınız gizlenecek ve yeniden aktifleştirene kadar erişilemez olacaktır.",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Hesabı Dondur",
          style: "destructive",
          onPress: () => {
            // Here you would implement actual account freezing logic
            Alert.alert(
              "Hesap Donduruldu",
              "Hesabınız başarıyla donduruldu. Tekrar giriş yaparak hesabınızı aktifleştirebilirsiniz."
            );
            setActivePrivacySection(null);
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Hesap Silme",
      "Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve tüm verileriniz kalıcı olarak silinecektir.",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Hesabı Sil",
          style: "destructive",
          onPress: () => {
            // Here you would implement actual account deletion logic
            Alert.alert(
              "Hesap Silindi",
              "Hesabınız başarıyla silindi. Uygulama kapanacak."
            );
            setActivePrivacySection(null);
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

              // Backend'den avatarı sil
              await profileService.deleteAvatar();

              // Yerel profil resmini varsayılana ayarla
              setEditedProfile({
                ...editedProfile,
                profileImage: DEFAULT_PROFILE_IMAGE,
              });

              // Profil verilerini yeniden yükle
              await fetchProfileData();

              Alert.alert("Başarılı", "Profil fotoğrafınız başarıyla silindi.");
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
                <Users size={24} color="#333" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => setIsSettingsVisible(true)}
              >
                <Settings size={24} color="#333" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Profil Bilgileri */}
          <View style={styles.profileSection}>
            <View style={styles.profileHeader}>
              <Image
                source={{ uri: userProfile?.avatar || DEFAULT_PROFILE_IMAGE }}
                style={styles.profileImage}
              />
              <View style={styles.profileInfo}>
                <Text style={styles.userName}>
                  {userProfile?.name || "Kullanıcı Adı"}
                </Text>

                <View style={styles.joinDateContainer}>
                  <Mail size={14} color="#7f8c8d" />
                  <Text> {userProfile?.email || "Belirtilmemiş"}</Text>
                </View>

                {userProfile?.birthday_date && (
                  <View style={styles.ageContainer}>
                    <Cake size={14} color="#7f8c8d" />
                    <Text style={styles.ageText}>
                      {calculateAge(userProfile.birthday_date)} Yaşında
                    </Text>
                  </View>
                )}
              </View>
              <TouchableOpacity
                style={styles.editButton}
                onPress={handleEditProfile}
              >
                <Edit3 size={18} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Biyografi */}
            {userProfile?.bio && (
              <View style={styles.biographyContainer}>
                <Text style={styles.biographyText}>{userProfile.bio}</Text>
              </View>
            )}

            {/* İstatistikler */}
            <View style={styles.statsContainer}>
              <View style={[styles.statItem, styles.statDivider]}>
                <Text style={styles.statNumber}>
                  {userProfile?.total_events || 0}
                </Text>
                <Text style={styles.statLabel}>Etkinlik</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {userProfile?.friend_count || 0}
                </Text>
                <Text style={styles.statLabel}>Arkadaş</Text>
              </View>
            </View>
          </View>

          {/* İlgi Alanları */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>İlgi Alanları</Text>
            <View style={styles.interestsContainer}>
              {userData.interests.map((interest, index) => (
                <View key={index} style={styles.interestTag}>
                  <Text style={styles.interestTagText}>{interest}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Katıldığım Etkinlikler */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderContainer}>
              <Text style={styles.sectionTitle}>Katıldığım Etkinlikler</Text>
              <View style={styles.eventCountBadge}>
                <Text style={styles.eventCountText}>
                  {participatedEvents.length}
                </Text>
              </View>
            </View>

            {eventsLoading ? (
              <View style={styles.loadingEventsContainer}>
                <ActivityIndicator size="small" color="#3498db" />
                <Text style={styles.loadingEventsText}>
                  Etkinlikler yükleniyor...
                </Text>
              </View>
            ) : eventsError ? (
              <View style={styles.noEventsMessage}>
                <Text style={styles.errorText}>{eventsError}</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={fetchParticipatedEvents}
                >
                  <Text style={styles.retryButtonText}>Tekrar Dene</Text>
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
              <View style={styles.noEventsMessage}>
                <Text style={styles.noEventsText}>
                  Henüz katıldığın bir etkinlik bulunmuyor.
                </Text>
              </View>
            )}
          </View>
          <View style={styles.footer}>
            <Text style={styles.versionText}>Uygulama Sürümü: 1.0.0</Text>
          </View>
        </ScrollView>
      )}

      {/* Ayarlar Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isSettingsVisible}
        onRequestClose={() => setIsSettingsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ayarlar</Text>
              <TouchableOpacity onPress={() => setIsSettingsVisible(false)}>
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {menuItems.map(renderMenuItem)}
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Profili Düzenle</Text>
              <TouchableOpacity
                onPress={() => setIsEditProfileModalVisible(false)}
              >
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Profile Picture Section */}
              <View style={styles.profilePictureSection}>
                <Image
                  source={{ uri: editedProfile.profileImage }}
                  style={styles.editProfileImage}
                />
                <View style={styles.photoButtonsContainer}>
                  <TouchableOpacity
                    style={styles.changePhotoButton}
                    onPress={handleChangeProfilePicture}
                  >
                    <Text style={styles.changePhotoText}>
                      Fotoğrafı Değiştir
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.deletePhotoButton,
                      editedProfile.profileImage === DEFAULT_PROFILE_IMAGE &&
                        styles.deletePhotoButtonDisabled,
                    ]}
                    onPress={handleDeleteProfilePicture}
                    disabled={
                      editedProfile.profileImage === DEFAULT_PROFILE_IMAGE
                    }
                  >
                    <Text
                      style={[
                        styles.deletePhotoText,
                        editedProfile.profileImage === DEFAULT_PROFILE_IMAGE &&
                          styles.deletePhotoTextDisabled,
                      ]}
                    >
                      Fotoğrafı Sil
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Ad</Text>
                <TextInput
                  style={styles.textInput}
                  value={editedProfile.firstName}
                  onChangeText={(text) =>
                    handleProfileChange("firstName", text)
                  }
                  placeholder="Adınız"
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Soyad</Text>
                <TextInput
                  style={styles.textInput}
                  value={editedProfile.lastName}
                  onChangeText={(text) => handleProfileChange("lastName", text)}
                  placeholder="Soyadınız"
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>E-posta</Text>
                <TextInput
                  style={styles.textInput}
                  value={editedProfile.email}
                  onChangeText={(text) => handleProfileChange("email", text)}
                  placeholder="E-posta adresiniz"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Doğum Tarihi</Text>
                <TextInput
                  style={styles.textInput}
                  value={editedProfile.birthDate}
                  onChangeText={(text) => {
                    const formattedDate = formatBirthDate(text);
                    handleProfileChange("birthDate", formattedDate);
                  }}
                  placeholder="YYYY-MM-DD"
                  keyboardType="numbers-and-punctuation"
                  maxLength={10}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Biyografi</Text>
                <TextInput
                  style={[styles.textInput, styles.biographyInput]}
                  value={editedProfile.biography}
                  onChangeText={(text) =>
                    handleProfileChange("biography", text)
                  }
                  placeholder="Kendinizi kısaca tanıtın..."
                  multiline={true}
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.saveButton,
                  !isProfileChanged && styles.saveButtonDisabled,
                ]}
                onPress={handleSaveProfile}
                disabled={loading || !isProfileChanged}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Kaydet</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Diğer modallar ve UI bileşenleri (gerekiyorsa) */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
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
  profileImage: {
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
  userName: {
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
    marginBottom: 4,
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
    backgroundColor: "#e6f7f4",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  eventCountText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#047857",
  },
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  interestTag: {
    backgroundColor: "#e8f4fc",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  interestTagText: {
    color: "#3498db",
    fontSize: 14,
    fontWeight: "500",
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
    paddingVertical: 20,
    paddingHorizontal: 15,
    maxHeight: "70%",
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
  profileImageContainer: {
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
  bioText: {
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
});
