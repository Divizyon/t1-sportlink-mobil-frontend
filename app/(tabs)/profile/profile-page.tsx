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
  Map,
  MapPin,
  Mic,
  MoreVertical,
  Settings,
  Shield,
  Star,
  Users,
  X,
} from "lucide-react-native";
import React, { useState } from "react";
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
} from "react-native";
import { useAuth } from "@/src/store/AuthContext";
import apiClient from "@/src/api";

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
const profileService = {
  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }) => {
    return apiClient.put("/profile/password", data);
  },
};

export default function ProfileScreen() {
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
  const [editedProfile, setEditedProfile] = useState({
    firstName: userData.firstName || "",
    lastName: userData.lastName || "",
    email: userData.email,
    birthDate: userData.birthDate,
    biography: userData.biography,
    profileImage: userData.profileImage,
  });

  const handleEditProfile = () => {
    setIsEditProfileModalVisible(true);
  };

  const handleSaveProfile = () => {
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

    // Here we would typically update the user data in a real app
    // For this demo, we'll just update our local userData object
    userData.firstName = editedProfile.firstName;
    userData.lastName = editedProfile.lastName;
    userData.name = `${editedProfile.firstName} ${editedProfile.lastName}`;
    userData.email = editedProfile.email;
    userData.birthDate = editedProfile.birthDate;
    userData.biography = editedProfile.biography;
    userData.profileImage = editedProfile.profileImage;

    setIsEditProfileModalVisible(false);
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

  // Logout handler
  const { logout } = useAuth();
  const handleLogout = async () => {
    try {
      Alert.alert(
        "Çıkış Yap",
        "Hesabınızdan çıkış yapmak istediğinize emin misiniz?",
        [
          { text: "İptal", style: "cancel" },
          {
            text: "Çıkış Yap",
            style: "destructive",
            onPress: async () => {
              // Çıkış işlemi başlatılıyor
              Alert.alert(
                "Çıkış İşlemi",
                "Çıkış yapılıyor, lütfen bekleyin...",
                [],
                { cancelable: false }
              );

              try {
                await logout();
                console.log("Başarıyla çıkış yapıldı");

                // Başarı mesajı
                Alert.alert("Başarılı", "Çıkış işlemi başarıyla tamamlandı.", [
                  {
                    text: "Tamam",
                    onPress: () => {
                      // Giriş sayfasına yönlendir
                      router.replace("/");
                    },
                  },
                ]);
              } catch (error) {
                console.error("Çıkış yaparken hata:", error);

                // Hata durumunda detaylı bilgi ver
                let errorMessage =
                  "Çıkış yapılırken bir sorun oluştu. Lütfen tekrar deneyin.";
                if (error instanceof Error) {
                  errorMessage = `Hata: ${error.message}`;
                }

                Alert.alert("Çıkış Hatası", errorMessage, [
                  {
                    text: "Tekrar Dene",
                    onPress: () => handleLogout(),
                  },
                  {
                    text: "İptal",
                  },
                ]);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Çıkış yaparken genel hata:", error);
      Alert.alert(
        "Hata",
        "Çıkış işlemi başlatılamadı. Lütfen uygulamayı yeniden başlatın."
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
  };

  const handleEventPress = (eventId: number) => {
    router.push({
      pathname: "/(tabs)/dashboard/event-details",
      params: { id: eventId },
    });
  };

  // Kullanıcının katıldığı etkinlikleri filtreleme
  const joinedEvents = eventData.filter((event) => event.isJoined);

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
        setEditedProfile({
          ...editedProfile,
          profileImage: result.assets[0].uri,
        });
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
        setEditedProfile({
          ...editedProfile,
          profileImage: result.assets[0].uri,
        });
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
    apiClient
      .put("/profile/password", {
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
      .catch((error) => {
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
    Alert.alert(
      "Profil Fotoğrafı Silme",
      "Profil fotoğrafınızı silmek istediğinize emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: () => {
            setEditedProfile({
              ...editedProfile,
              profileImage: DEFAULT_PROFILE_IMAGE,
            });
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

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
                    <Camera
                      size={18}
                      color="#fff"
                      style={styles.photoButtonIcon}
                    />
                    <Text style={styles.changePhotoText}>
                      Fotoğrafı Değiştir
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deletePhotoButton}
                    onPress={handleDeleteProfilePicture}
                  >
                    <X size={18} color="#fff" style={styles.photoButtonIcon} />
                    <Text style={styles.deletePhotoText}>Fotoğrafı Sil</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Ad</Text>
                <TextInput
                  style={styles.textInput}
                  value={editedProfile.firstName}
                  onChangeText={(text) =>
                    setEditedProfile({ ...editedProfile, firstName: text })
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
                  onChangeText={(text) =>
                    setEditedProfile({ ...editedProfile, lastName: text })
                  }
                  placeholder="Soyadınız"
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>E-posta</Text>
                <TextInput
                  style={styles.textInput}
                  value={editedProfile.email}
                  onChangeText={(text) =>
                    setEditedProfile({ ...editedProfile, email: text })
                  }
                  placeholder="E-posta adresiniz"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Doğum Tarihi</Text>
                <View style={styles.dateInputContainer}>
                  <TextInput
                    style={[
                      styles.textInput,
                      !isValidBirthDate(editedProfile.birthDate) &&
                      editedProfile.birthDate.length === 10
                        ? styles.invalidDateInput
                        : {},
                    ]}
                    value={editedProfile.birthDate}
                    onChangeText={(text) => {
                      const formattedDate = formatBirthDate(text);
                      setEditedProfile({
                        ...editedProfile,
                        birthDate: formattedDate,
                      });
                    }}
                    placeholder="YYYY-MM-DD"
                    keyboardType="numbers-and-punctuation"
                    maxLength={10}
                  />
                  {isValidBirthDate(editedProfile.birthDate) && (
                    <View style={styles.validDateIcon}>
                      <Check size={16} color="#2ecc71" />
                    </View>
                  )}
                </View>
                {editedProfile.birthDate.length > 0 && (
                  <Text
                    style={[
                      styles.ageCalculationText,
                      !isValidBirthDate(editedProfile.birthDate) &&
                      editedProfile.birthDate.length === 10
                        ? styles.invalidAgeText
                        : {},
                    ]}
                  >
                    {isValidBirthDate(editedProfile.birthDate)
                      ? `Yaş: ${calculateAge(editedProfile.birthDate)}`
                      : editedProfile.birthDate.length === 10
                      ? "Geçersiz tarih formatı. YYYY-MM-DD şeklinde giriniz."
                      : "Tarih formatı: YYYY-MM-DD (Örn: 1995-06-15)"}
                  </Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Biyografi</Text>
                <TextInput
                  style={[styles.textInput, styles.biographyInput]}
                  value={editedProfile.biography}
                  onChangeText={(text) =>
                    setEditedProfile({ ...editedProfile, biography: text })
                  }
                  placeholder="Kendinizi kısaca tanıtın..."
                  multiline={true}
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveProfile}
              >
                <Text style={styles.saveButtonText}>Kaydet</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Bildirim Ayarları Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isNotificationsModalVisible}
        onRequestClose={() => setIsNotificationsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bildirim Ayarları</Text>
              <TouchableOpacity
                onPress={() => setIsNotificationsModalVisible(false)}
              >
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Main notification toggle */}
              <View style={styles.notificationToggleContainer}>
                <View style={styles.notificationToggleInfo}>
                  <Bell size={22} color="#f39c12" style={{ marginRight: 12 }} />
                  <View>
                    <Text style={styles.notificationToggleTitle}>
                      Tüm Bildirimleri Etkinleştir
                    </Text>
                    <Text style={styles.notificationToggleDesc}>
                      Tüm bildirimleri açıp kapatın
                    </Text>
                  </View>
                </View>
                <Switch
                  trackColor={{ false: "#e0e0e0", true: "#bde0fe" }}
                  thumbColor={notificationsEnabled ? "#3498db" : "#f4f3f4"}
                  ios_backgroundColor="#e0e0e0"
                  onValueChange={toggleNotifications}
                  value={notificationsEnabled}
                />
              </View>

              <View style={styles.notificationCategoriesHeader}>
                <Text style={styles.notificationCategoriesTitle}>
                  Bildirim Tercihleri
                </Text>
              </View>

              {/* Notification category toggles */}
              {notificationCategories.map((category) => (
                <View key={category.id} style={styles.notificationCategoryItem}>
                  <View style={styles.notificationCategoryInfo}>
                    <Text style={styles.notificationCategoryTitle}>
                      {category.title}
                    </Text>
                    <Text style={styles.notificationCategoryDesc}>
                      {category.description}
                    </Text>
                  </View>
                  <Switch
                    trackColor={{ false: "#e0e0e0", true: "#bde0fe" }}
                    thumbColor={category.enabled ? "#3498db" : "#f4f3f4"}
                    ios_backgroundColor="#e0e0e0"
                    onValueChange={(value) =>
                      toggleNotificationCategory(category.id, value)
                    }
                    value={category.enabled}
                    disabled={!notificationsEnabled}
                  />
                </View>
              ))}

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveNotificationSettings}
              >
                <Text style={styles.saveButtonText}>Kaydet</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Gizlilik ve Güvenlik Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isPrivacyModalVisible}
        onRequestClose={() => {
          setActivePrivacySection(null);
          setIsPrivacyModalVisible(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {activePrivacySection === null
                  ? "Gizlilik ve Güvenlik"
                  : activePrivacySection === "password"
                  ? "Şifre Değiştir"
                  : activePrivacySection === "freeze"
                  ? "Hesabı Dondur"
                  : "Hesabı Sil"}
              </Text>
              {activePrivacySection !== null ? (
                <TouchableOpacity onPress={handleBackToPrivacyMenu}>
                  <ArrowLeft size={24} color="#333" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => setIsPrivacyModalVisible(false)}
                >
                  <X size={24} color="#333" />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView style={styles.modalBody}>
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

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profil</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.push("/(tabs)/profile/find-friends" as any)}
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
              source={{ uri: userData.profileImage }}
              style={styles.profileImage}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{userData.name}</Text>

              <View style={styles.ageContainer}>
                <Cake size={14} color="#7f8c8d" />
                <Text style={styles.ageText}>
                  {calculateAge(userData.birthDate)} Yaşında
                </Text>
              </View>
              <View style={styles.joinDateContainer}>
                <Calendar size={14} color="#7f8c8d" />
                <Text style={styles.joinDateText}>
                  Üyelik: {userData.memberSince}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditProfile}
            >
              <Edit3 size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Biyografi */}
          {userData.biography && (
            <View style={styles.biographyContainer}>
              <Text style={styles.biographyText}>{userData.biography}</Text>
            </View>
          )}

          {/* İstatistikler */}
          <View style={styles.statsContainer}>
            <View style={[styles.statItem, styles.statDivider]}>
              <Text style={styles.statNumber}>{userData.stats.events}</Text>
              <Text style={styles.statLabel}>Etkinlik</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userData.stats.friends}</Text>
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
              <Text style={styles.eventCountText}>{joinedEvents.length}</Text>
            </View>
          </View>

          {joinedEvents.length > 0 ? (
            joinedEvents.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={styles.eventCard}
                onPress={() => handleEventPress(event.id)}
              >
                <View style={styles.eventHeader}>
                  <View style={styles.dateBox}>
                    <Text style={styles.dateNumber}>
                      {event.date.split(" ")[0]}
                    </Text>
                    <Text style={styles.dateMonth}>Eki</Text>
                  </View>
                  <View style={styles.eventDetails}>
                    <Text style={styles.eventTitle}>{event.title}</Text>

                    <View style={styles.eventMetaInfo}>
                      <View style={styles.metaRow}>
                        <Clock
                          size={14}
                          color="#666"
                          style={{ marginRight: 4 }}
                        />
                        <Text style={styles.metaText}>
                          {event.startTime} - {event.endTime}
                        </Text>
                      </View>

                      <View style={styles.metaRow}>
                        <MapPin
                          size={14}
                          color="#666"
                          style={{ marginRight: 4 }}
                        />
                        <Text
                          style={styles.metaText}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {event.location}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.ratingContainer}>
                      <View style={styles.ratingInfo}>
                        <Text style={styles.ratingText}>⭐ {event.rating}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.rateButton}
                        onPress={() => handleRateEvent(event.id)}
                      >
                        <Text style={styles.rateButtonText}>Değerlendir</Text>
                        <Star
                          size={14}
                          color="#f59e0b"
                          style={{ marginLeft: 4 }}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.moreButton}>
                    <MoreVertical size={20} color="#666" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f8fa",
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
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  eventHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  dateBox: {
    width: 50,
    height: 50,
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  dateNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  dateMonth: {
    fontSize: 14,
    color: "#fff",
  },
  eventDetails: {
    flex: 1,
    marginLeft: 15,
    marginRight: 10,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
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
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  biographyContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
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
    lineHeight: 20,
    color: "#666",
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
});
