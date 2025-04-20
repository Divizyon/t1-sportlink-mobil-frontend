import React, { useState } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Text } from "@/components/ui/text";
import {
  Settings,
  User,
  LogOut,
  ChevronRight,
  Heart,
  Shield,
  Bell,
  HelpCircle,
  Award,
  Edit3,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  Star,
  UserCheck,
  MoreVertical,
  Building,
  X,
  Users,
} from "lucide-react-native";
import { router } from "expo-router";

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
  time: string;
  location: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  distance: string;
  participants: string[];
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

// Örnek kullanıcı bilgileri
const userData = {
  name: "Özgür Eren",
  email: "ozgur.eren@example.com",
  location: "Konya, Türkiye",
  memberSince: "Nisan 2023",
  profileImage: "https://randomuser.me/api/portraits/men/32.jpg",
  isPro: true,
  stats: {
    events: 12,
    friends: 28,
    reviews: 8,
  },
  achievements: [
    {
      id: 1,
      name: "Spor Tutkunu",
      description: "10 etkinliğe katıldın",
      icon: "🏆",
    },
    {
      id: 2,
      name: "Sosyal Sporcu",
      description: "5 farklı kişiyle etkinlik gerçekleştirdin",
      icon: "🤝",
    },
    {
      id: 3,
      name: "Erken Kuş",
      description: "5 sabah etkinliğine katıldın",
      icon: "🌅",
    },
  ],
  interests: ["Basketbol", "Futbol", "Yüzme", "Koşu", "Tenis"],
};

// Geçici etkinlik verileri - Sadece katıldığım etkinlikler
const eventData = [
  {
    id: 2,
    title: "Futbol Turnuvası",
    type: "Buluşma",
    category: "Futbol",
    date: "23 Ekim",
    time: "14:00-17:00",
    location: "Meram Futbol Sahası",
    coordinates: {
      latitude: 37.8599,
      longitude: 32.4522,
    },
    distance: "2.5 km",
    participants: [
      "https://randomuser.me/api/portraits/women/65.jpg",
      "https://randomuser.me/api/portraits/men/22.jpg",
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
    type: "Spor",
    category: "Yüzme",
    date: "24 Ekim",
    time: "10:00-11:30",
    location: "Olimpik Yüzme Havuzu",
    coordinates: {
      latitude: 37.851,
      longitude: 32.4726,
    },
    distance: "3.7 km",
    participants: [
      "https://randomuser.me/api/portraits/women/33.jpg",
      "https://randomuser.me/api/portraits/men/45.jpg",
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
    id: "account",
    title: "Hesap Bilgileri",
    icon: <User size={22} color="#3498db" />,
  },
  {
    id: "favorites",
    title: "Favoriler",
    icon: <Heart size={22} color="#e74c3c" />,
  },
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

export default function ProfileScreen() {
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  
  const handleEditProfile = () => {
    console.log("Profil düzenleme sayfasına yönlendirilecek");
  };

  const handleMenuItemPress = (itemId: string) => {
    console.log(`Menü öğesi tıklandı: ${itemId}`);
    setIsSettingsVisible(false);
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
              {userData.isPro && (
                <View style={styles.proBadge}>
                  <Text style={styles.proBadgeText}>PRO</Text>
                </View>
              )}
              <View style={styles.locationContainer}>
                <MapPin size={14} color="#7f8c8d" />
                <Text style={styles.locationText}>{userData.location}</Text>
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

          {/* İstatistikler */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userData.stats.events}</Text>
              <Text style={styles.statLabel}>Etkinlik</Text>
            </View>
            <View style={[styles.statItem, styles.statDivider]}>
              <Text style={styles.statNumber}>{userData.stats.friends}</Text>
              <Text style={styles.statLabel}>Arkadaş</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userData.stats.reviews}</Text>
              <Text style={styles.statLabel}>Değerlendirme</Text>
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

        {/* Başarılar */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Başarılar</Text>
          <View style={styles.achievementsContainer}>
            {userData.achievements.map((achievement) => (
              <View key={achievement.id} style={styles.achievementCard}>
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                <Text style={styles.achievementName}>{achievement.name}</Text>
                <Text style={styles.achievementDesc}>
                  {achievement.description}
                </Text>
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
                        <Clock size={14} color="#666" style={{ marginRight: 4 }} />
                        <Text style={styles.metaText}>{event.time}</Text>
                      </View>
                      
                      <View style={styles.metaRow}>
                        <MapPin size={14} color="#666" style={{ marginRight: 4 }} />
                        <Text style={styles.metaText} numberOfLines={1} ellipsizeMode="tail">
                          {event.location}
                        </Text>
                      </View>
                      
                      <View style={styles.purposeContainer}>
                        <View
                          style={
                            event.type === "Spor"
                              ? styles.workTag
                              : styles.meetingTag
                          }
                        >
                          <Text style={styles.tagText}>{event.type}</Text>
                        </View>
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
                        <Star size={14} color="#f59e0b" style={{ marginLeft: 4 }} />
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
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderLeftColor: "#f0f0f0",
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
  achievementsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  achievementCard: {
    width: "31%",
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  achievementIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  achievementName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 12,
    color: "#7f8c8d",
    textAlign: "center",
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
  // Etkinlik kartı stilleri
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 15,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    maxHeight: '90%',
  },
}); 