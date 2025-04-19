import React from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Box } from "@/components/ui/box";
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
  MessageCircle,
} from "lucide-react-native";

// Menü öğesi tipi tanımlama
interface MenuItem {
  id: string;
  title: string;
  icon: React.ReactNode;
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
  const handleEditProfile = () => {
    console.log("Profil düzenleme sayfasına yönlendirilecek");
    // navigation.navigate('EditProfile');
  };

  const handleMenuItemPress = (itemId: string) => {
    console.log(`Menü öğesi tıklandı: ${itemId}`);
    // İlgili sayfaya yönlendirme yapılacak
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profil</Text>
          <TouchableOpacity onPress={() => console.log("Ayarlar açılacak")}>
            <Settings size={24} color="#333" />
          </TouchableOpacity>
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

        {/* Menü */}
        <View style={styles.menuContainer}>
          {menuItems.map(renderMenuItem)}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
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
});
