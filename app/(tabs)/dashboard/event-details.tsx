import React, { useState, useEffect } from "react";
import {
  View,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  Image,
  TouchableOpacity,
  Dimensions,
  Modal,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  EventDetailHeader,
  EventInfo,
  EventParticipants,
  EventReviews,
} from "@/components/dashboard";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  ChevronRight,
  MessageSquare,
  Info,
  Map,
  Share2,
  Navigation,
  MessageCircle,
  X,
} from "lucide-react-native";
import MapView, { Marker } from "react-native-maps";

// Tema renkleri
const theme = {
  primary: "#10B981", // Koyu yeşil
  primaryLight: "#D1FAE5", // Açık yeşil
  primaryPale: "#ECFDF5", // En açık yeşil
  background: "#F8FAFC", // Arka plan rengi
  surface: "#FFFFFF", // Kart arka planı
  text: "#0F172A", // Ana metin rengi
  textSecondary: "#64748B", // İkincil metin rengi
  border: "#E2E8F0", // Kenar çizgisi rengi
  shadow: "rgba(0, 0, 0, 0.05)", // Gölge rengi
  error: "#EF4444", // Hata rengi (kırmızı)
  success: "#10B981", // Başarı rengi (yeşil)
  warn: "#F59E0B", // Uyarı rengi (turuncu/amber)
  categoryColors: {
    Basketbol: "#F97316", // Turuncu
    Futbol: "#22C55E", // Yeşil
    Yüzme: "#3B82F6", // Mavi
    Tenis: "#EAB308", // Sarı
    Voleybol: "#EC4899", // Pembe
    Koşu: "#8B5CF6", // Mor
    Yoga: "#14B8A6", // Turkuaz
    Bisiklet: "#EF4444", // Kırmızı
    Okçuluk: "#6366F1", // İndigo
    "Akıl Oyunları": "#8B5CF6", // Mor
  } as Record<string, string>,
};

// Etkinlik tipi tanımla
interface Review {
  id: number;
  user: {
    name: string;
    avatar: string;
  };
  rating: number;
  content: string;
  date: string;
}

// Katılımcı verisi için interface
interface Participant {
  id: number;
  name: string;
  profileImage: string;
}

// EventDetail arayüzüne participants ekle
interface EventDetail {
  id: number;
  title: string;
  category: string;
  date: string;
  time: string;
  location: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  distance: string;
  participantCount: number;
  maxParticipants: number;
  isJoined: boolean;
  organizer: {
    id: number;
    name: string;
    isVerified: boolean;
    logoUrl: string;
  };
  description: string;
  requirements: string;
  notes: string;
  imageUrl: string;
  reviews?: Review[];
  participants: Participant[]; // Katılımcılar listesi eklendi
}

// Örnek etkinlik verileri
const sampleEvents = [
  {
    id: 1,
    title: "Basketbol Maçı",
    category: "Basketbol",
    date: "23 Ekim",
    time: "11:00-13:00",
    location: "Konya Basket Sahası",
    coordinates: {
      latitude: 37.8651,
      longitude: 32.4932,
    },
    distance: "1.2 km",
    participantCount: 10,
    maxParticipants: 12,
    isJoined: false,
    organizer: {
      id: 1,
      name: "Konya Spor Kulübü",
      isVerified: true,
      logoUrl: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    description:
      "Basketbol severler için haftalık dostluk maçı. Her seviyeden oyuncular katılabilir. Bu etkinlikte rekabetten çok eğlence ön plandadır ve yeni arkadaşlar edinebilirsiniz. Maç sonrası katılımcılarla sosyal etkinlik planlanmaktadır.",
    requirements: "Spor ayakkabı ve rahat kıyafet getirmeniz yeterli.",
    notes: "Maç bitiminde sosyal bir etkinlik düzenlenecektir.",
    imageUrl:
      "https://images.unsplash.com/photo-1518063319789-7217e6706b04?q=80&w=2069&auto=format&fit=crop",
    participants: [
      {
        id: 1,
        name: "Ahmet Yılmaz",
        profileImage: "https://randomuser.me/api/portraits/men/75.jpg",
      },
      {
        id: 2,
        name: "Zeynep Kaya",
        profileImage: "https://randomuser.me/api/portraits/women/62.jpg",
      },
      {
        id: 3,
        name: "Mehmet Demir",
        profileImage: "https://randomuser.me/api/portraits/men/22.jpg",
      },
      {
        id: 4,
        name: "Ebru Şahin",
        profileImage: "https://randomuser.me/api/portraits/women/45.jpg",
      },
      {
        id: 5,
        name: "Oğuz Yılmaz",
        profileImage: "https://randomuser.me/api/portraits/men/36.jpg",
      },
      {
        id: 6,
        name: "Selma Korkut",
        profileImage: "https://randomuser.me/api/portraits/women/28.jpg",
      },
      {
        id: 7,
        name: "Özgür Aydın",
        profileImage: "https://randomuser.me/api/portraits/men/41.jpg",
      },
      {
        id: 8,
        name: "Ezgi Şen",
        profileImage: "https://randomuser.me/api/portraits/women/17.jpg",
      },
      {
        id: 9,
        name: "Tolga Kara",
        profileImage: "https://randomuser.me/api/portraits/men/54.jpg",
      },
      {
        id: 10,
        name: "Ceyda Yurt",
        profileImage: "https://randomuser.me/api/portraits/women/33.jpg",
      },
    ],
    reviews: [
      {
        id: 1,
        user: {
          name: "Ahmet Yılmaz",
          avatar: "https://randomuser.me/api/portraits/men/75.jpg",
        },
        rating: 5,
        content:
          "Çok keyifli bir etkinlikti. Herkes çok samimiydi ve iyi vakit geçirdik. Kesinlikle tekrar katılacağım.",
        date: "20 Ekim 2023",
      },
      {
        id: 2,
        user: {
          name: "Zeynep Kaya",
          avatar: "https://randomuser.me/api/portraits/women/62.jpg",
        },
        rating: 4,
        content:
          "Organizasyon gayet iyiydi. Tek eksik su ikramı olmamasıydı. Onun dışında her şey harikaydı.",
        date: "18 Ekim 2023",
      },
    ],
  },
  {
    id: 2,
    title: "Futbol Turnuvası",
    category: "Futbol",
    date: "25 Ekim",
    time: "15:00-18:00",
    location: "Selçuklu Stadyumu",
    coordinates: {
      latitude: 37.8751,
      longitude: 32.4832,
    },
    distance: "2.5 km",
    participantCount: 22,
    maxParticipants: 24,
    isJoined: false,
    organizer: {
      id: 2,
      name: "Selçuklu Spor",
      isVerified: true,
      logoUrl: "https://randomuser.me/api/portraits/men/45.jpg",
    },
    description:
      "Amatör futbol takımları arasında dostluk turnuvası. Toplam 8 takım ve yaklaşık 90 dakikalık bir etkinlik olacaktır. Maçlar 20'şer dakika olacak şekilde planlanmıştır. Tüm katılımcılara katılım sertifikası verilecektir.",
    requirements:
      "Forma, futbol ayakkabıları ve tekmelik getirmeniz gerekmektedir.",
    notes: "Turnuva sonunda ödül töreni yapılacaktır.",
    imageUrl:
      "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=2070&auto=format&fit=crop",
    participants: [
      {
        id: 1,
        name: "Ali Yıldız",
        profileImage: "https://randomuser.me/api/portraits/men/22.jpg",
      },
      {
        id: 2,
        name: "Selin Doğan",
        profileImage: "https://randomuser.me/api/portraits/women/28.jpg",
      },
      {
        id: 3,
        name: "Kerem Demir",
        profileImage: "https://randomuser.me/api/portraits/men/36.jpg",
      },
      // Diğer katılımcılar da benzer şekilde eklenir
      {
        id: 22,
        name: "Engin Arslan",
        profileImage: "https://randomuser.me/api/portraits/men/90.jpg",
      },
    ],
    reviews: [
      {
        id: 1,
        user: {
          name: "Mehmet Demir",
          avatar: "https://randomuser.me/api/portraits/men/22.jpg",
        },
        rating: 5,
        content:
          "Mükemmel bir turnuvaydı! Hakem kararları adildi ve herkes centilmence oynadı. Organizasyon için teşekkürler.",
        date: "15 Ekim 2023",
      },
      {
        id: 2,
        user: {
          name: "Ali Yıldız",
          avatar: "https://randomuser.me/api/portraits/men/36.jpg",
        },
        rating: 3,
        content:
          "Turnuva iyiydi ama saha zemini biraz kötüydü. Bir dahaki sefere daha iyi bir sahada olabilir.",
        date: "14 Ekim 2023",
      },
      {
        id: 3,
        user: {
          name: "Burak Özdemir",
          avatar: "https://randomuser.me/api/portraits/men/54.jpg",
        },
        rating: 4,
        content:
          "Çok eğlendik, güzel bir rekabet ortamı vardı. Tekrar katılmak isterim.",
        date: "13 Ekim 2023",
      },
    ],
  },
  {
    id: 3,
    title: "Yoga Seansı",
    type: "Sağlık",
    category: "Yoga",
    date: "26 Ekim",
    time: "08:00-09:30",
    location: "Meram Yoga Merkezi",
    coordinates: {
      latitude: 37.8551,
      longitude: 32.4632,
    },
    distance: "3.7 km",
    participantCount: 8,
    maxParticipants: 15,
    isJoined: true,
    organizer: {
      id: 3,
      name: "Zen Yoga",
      isVerified: true,
      logoUrl: "https://randomuser.me/api/portraits/women/68.jpg",
    },
    description:
      "Sabah yoga seansı ile güne enerjik başlayın. Tüm seviyelerden katılımcılar için uygundur. Seansımızda nefes egzersizleri, esneme ve meditasyon pratikleri yapılacaktır. Zihinsel ve fiziksel sağlığınız için harika bir fırsat.",
    requirements:
      "Yoga matı (isterseniz merkezimizden de temin edebilirsiniz) ve rahat kıyafetler.",
    notes: "Lütfen seanstan 15 dakika önce hazır olunuz.",
    imageUrl:
      "https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=2070&auto=format&fit=crop",
    participants: [
      {
        id: 1,
        name: "Ayşe Yalçın",
        profileImage: "https://randomuser.me/api/portraits/women/33.jpg",
      },
      {
        id: 2,
        name: "Selin Aksoy",
        profileImage: "https://randomuser.me/api/portraits/women/49.jpg",
      },
      {
        id: 3,
        name: "Can Öztürk",
        profileImage: "https://randomuser.me/api/portraits/men/41.jpg",
      },
      {
        id: 4,
        name: "Deniz Yılmaz",
        profileImage: "https://randomuser.me/api/portraits/women/17.jpg",
      },
      {
        id: 5,
        name: "Emre Kaplan",
        profileImage: "https://randomuser.me/api/portraits/men/62.jpg",
      },
      {
        id: 6,
        name: "Aslı Koç",
        profileImage: "https://randomuser.me/api/portraits/women/55.jpg",
      },
      {
        id: 7,
        name: "Kaan Aydın",
        profileImage: "https://randomuser.me/api/portraits/men/78.jpg",
      },
      {
        id: 8,
        name: "Gül Şahin",
        profileImage: "https://randomuser.me/api/portraits/women/91.jpg",
      },
    ],
    reviews: [
      {
        id: 1,
        user: {
          name: "Ayşe Yalçın",
          avatar: "https://randomuser.me/api/portraits/women/33.jpg",
        },
        rating: 5,
        content:
          "Harika bir deneyimdi! Eğitmen çok profesyonel ve anlayışlıydı. Kesinlikle tavsiye ederim.",
        date: "22 Ekim 2023",
      },
      {
        id: 2,
        user: {
          name: "Selin Aksoy",
          avatar: "https://randomuser.me/api/portraits/women/49.jpg",
        },
        rating: 5,
        content:
          "Stresli bir haftanın ardından tam da ihtiyacım olan şeydi. Merkez çok ferah ve temizdi.",
        date: "20 Ekim 2023",
      },
      {
        id: 3,
        user: {
          name: "Can Öztürk",
          avatar: "https://randomuser.me/api/portraits/men/41.jpg",
        },
        rating: 4,
        content:
          "İlk kez yoga denedim ve beklediğimden çok daha iyiydi. Eğitmen yeni başlayanlar için özel ilgi gösterdi.",
        date: "19 Ekim 2023",
      },
      {
        id: 4,
        user: {
          name: "Deniz Yılmaz",
          avatar: "https://randomuser.me/api/portraits/women/17.jpg",
        },
        rating: 4,
        content:
          "Çok rahatlatıcı ve faydalı bir seanstı. Tek sorun park yeri bulmakta biraz zorlandım.",
        date: "18 Ekim 2023",
      },
    ],
  },
];

export default function EventDetailsScreen() {
  const params = useLocalSearchParams();
  const eventId = Number(params.id);
  const [eventDetail, setEventDetail] = useState<EventDetail | null>(null);
  const [activeTab, setActiveTab] = useState("info"); // 'info', 'map', 'reviews'
  const [isJoined, setIsJoined] = useState(false);
  const [isParticipantsModalVisible, setIsParticipantsModalVisible] =
    useState(false);

  useEffect(() => {
    // Gerçek uygulamada burada API çağrısı yapılır
    console.log("Etkinlik ID:", eventId);

    // ID'ye göre etkinliği bul
    const event = sampleEvents.find((e) => e.id === eventId);
    if (event) {
      setEventDetail(event);
      setIsJoined(event.isJoined);
    } else {
      // Etkinlik bulunamadıysa örnek veriyi göster
      setEventDetail(sampleEvents[0]);
      setIsJoined(sampleEvents[0].isJoined);
      console.log(
        "Belirtilen ID ile etkinlik bulunamadı, varsayılan etkinlik gösteriliyor."
      );
    }
  }, [eventId]);

  // Etkinlik henüz yüklenmediyse yükleniyor göster
  if (!eventDetail) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Etkinlik yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Kategori rengini belirle
  const categoryColor =
    theme.categoryColors[eventDetail.category] || theme.primary;

  const handleBack = () => {
    router.back();
  };

  const handleToggleJoin = () => {
    // Gerçek uygulamada, burada API çağrısı yapılır
    setIsJoined(!isJoined);
    Alert.alert(
      !isJoined ? "Katılım Onaylandı" : "Katılım İptal Edildi",
      !isJoined ? "Etkinliğe başarıyla katıldınız!" : "Etkinlikten ayrıldınız.",
      [{ text: "Tamam", onPress: () => console.log("OK") }]
    );
  };

  const handleContact = () => {
    // Organizatör DM sayfasına yönlendir
    const organizerId = eventDetail.organizer.id;
    router.navigate({
      pathname: "/messages/[id]",
      params: {
        id: organizerId,
      },
    });
  };

  const handleShare = () => {
    Alert.alert(
      "Paylaş",
      `${eventDetail.title} etkinliğini paylaşmak için bir platform seçin.`,
      [{ text: "Tamam", onPress: () => console.log("OK") }]
    );
  };

  // Katılımcıları gösterme modalını aç
  const handleShowParticipants = () => {
    setIsParticipantsModalVisible(true);
  };

  // Katılımcı Modalı
  const renderParticipantsModal = () => {
    if (!eventDetail) return null;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={isParticipantsModalVisible}
        onRequestClose={() => setIsParticipantsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Katılımcılar ({eventDetail.participantCount}/
                {eventDetail.maxParticipants})
              </Text>
              <TouchableOpacity
                onPress={() => setIsParticipantsModalVisible(false)}
                style={styles.closeButton}
              >
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.participantsListContainer}>
              {eventDetail.participants &&
              eventDetail.participants.length > 0 ? (
                eventDetail.participants.map((participant) => (
                  <TouchableOpacity
                    key={participant.id}
                    style={styles.participantItem}
                    onPress={() => {
                      // Gelecekte profil sayfasına yönlendirme yapılabilir
                      console.log(`${participant.name} profiline tıklandı`);
                      setIsParticipantsModalVisible(false);
                      // Bu kısımda profil sayfasına yönlendirme yapılabilir
                      // router.navigate...
                    }}
                  >
                    <Image
                      source={{ uri: participant.profileImage }}
                      style={styles.participantImage}
                    />
                    <View style={styles.participantDetails}>
                      <Text style={styles.participantName}>
                        {participant.name}
                      </Text>
                      <Text style={styles.participantRole}>Katılımcı</Text>
                    </View>
                    <ChevronRight size={18} color={theme.textSecondary} />
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noParticipantsText}>
                  Henüz katılımcı bulunmuyor.
                </Text>
              )}

              {/* Eğer API'den gelen katılımcı sayısı daha fazlaysa */}
              {eventDetail.participantCount >
                (eventDetail.participants
                  ? eventDetail.participants.length
                  : 0) && (
                <View style={styles.moreParticipantsInfo}>
                  <Text style={styles.moreParticipantsText}>
                    +
                    {eventDetail.participantCount -
                      (eventDetail.participants
                        ? eventDetail.participants.length
                        : 0)}{" "}
                    kişi daha
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  // Tab içeriğini render et
  const renderTabContent = () => {
    switch (activeTab) {
      case "info":
        return (
          <Box style={styles.tabContent}>
            <VStack style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Etkinlik Açıklaması</Text>
              <Text style={styles.description}>{eventDetail.description}</Text>
            </VStack>

            <VStack style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Gereksinimler</Text>
              <Text style={styles.description}>{eventDetail.requirements}</Text>
            </VStack>

            {eventDetail.notes && (
              <VStack style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Notlar</Text>
                <Text style={styles.description}>{eventDetail.notes}</Text>
              </VStack>
            )}
          </Box>
        );
      case "map":
        return (
          <Box style={styles.tabContent}>
            <Box style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: eventDetail.coordinates.latitude,
                  longitude: eventDetail.coordinates.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: eventDetail.coordinates.latitude,
                    longitude: eventDetail.coordinates.longitude,
                  }}
                  title={eventDetail.title}
                  description={eventDetail.location}
                  pinColor="#10B981"
                />
              </MapView>

              <TouchableOpacity
                style={[
                  styles.getDirectionsButton,
                  { backgroundColor: "white" },
                ]}
                onPress={() => {
                  // Gerçek uygulamada haritalara yönlendirme için
                  Alert.alert(
                    "Yol Tarifi",
                    "Google Maps veya Apple Maps'e yönlendirileceksiniz",
                    [{ text: "Tamam", onPress: () => console.log("OK") }]
                  );
                }}
              >
                <HStack style={styles.getDirectionsButtonInner}>
                  <Navigation size={16} color={categoryColor} />
                  <Text
                    style={[styles.getDirectionsText, { color: categoryColor }]}
                  >
                    Yol Tarifi Al
                  </Text>
                </HStack>
              </TouchableOpacity>
            </Box>
          </Box>
        );
      case "reviews":
        return (
          <Box style={styles.tabContent}>
            <EventReviews
              eventId={eventDetail.id}
              reviews={eventDetail.reviews || []}
            />
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderParticipantsModal()}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Etkinlik Resmi */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: eventDetail.imageUrl }}
            style={styles.eventImage}
            resizeMode="cover"
          />
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Box style={styles.backButtonInner}>
              <ChevronRight
                size={22}
                color="#0F172A"
                style={{ transform: [{ rotate: "180deg" }] }}
              />
            </Box>
          </TouchableOpacity>

          <Box style={styles.categoryTag}>
            <Text style={[styles.categoryText, { color: categoryColor }]}>
              {eventDetail.category}
            </Text>
          </Box>

          {isJoined && (
            <Box style={styles.joinedBadge}>
              <Text style={styles.joinedText}>Katıldınız</Text>
            </Box>
          )}
        </View>

        {/* Etkinlik Başlığı ve Temel Bilgiler */}
        <Box style={styles.titleContainer}>
          <Text style={styles.title}>{eventDetail.title}</Text>

          <HStack style={styles.organizer}>
            <Image
              source={{ uri: eventDetail.organizer.logoUrl }}
              style={styles.organizerLogo}
            />
            <Text style={styles.organizerName}>
              {eventDetail.organizer.name}
            </Text>
          </HStack>
        </Box>

        {/* Etkinlik Bilgileri - Tarih, Saat, Konum */}
        <Box style={styles.infoCards}>
          <HStack style={styles.infoRow}>
            <Box style={styles.infoCard}>
              <Box
                style={[
                  styles.infoIconWrapper,
                  { backgroundColor: `${categoryColor}15` },
                ]}
              >
                <Calendar size={18} color={categoryColor} />
              </Box>
              <VStack>
                <Text style={styles.infoLabel}>Tarih</Text>
                <Text style={styles.infoValue}>{eventDetail.date}</Text>
              </VStack>
            </Box>

            <Box style={styles.infoCard}>
              <Box
                style={[
                  styles.infoIconWrapper,
                  { backgroundColor: `${categoryColor}15` },
                ]}
              >
                <Clock size={18} color={categoryColor} />
              </Box>
              <VStack>
                <Text style={styles.infoLabel}>Saat</Text>
                <Text style={styles.infoValue}>{eventDetail.time}</Text>
              </VStack>
            </Box>
          </HStack>

          <Box style={styles.locationCard}>
            <Box
              style={[
                styles.infoIconWrapper,
                { backgroundColor: `${categoryColor}15` },
              ]}
            >
              <MapPin size={18} color={categoryColor} />
            </Box>
            <VStack style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Konum</Text>
              <Text style={styles.infoValue}>{eventDetail.location}</Text>
              <Text style={styles.distanceText}>
                {eventDetail.distance} uzaklıkta
              </Text>
            </VStack>
          </Box>

          <TouchableOpacity
            onPress={handleShowParticipants}
            activeOpacity={0.7}
          >
            <Box
              style={[
                styles.participantsCard,
                { borderWidth: 1, borderColor: `${categoryColor}40` },
              ]}
            >
              <Box
                style={[
                  styles.infoIconWrapper,
                  { backgroundColor: `${categoryColor}15` },
                ]}
              >
                <Users size={18} color={categoryColor} />
              </Box>
              <VStack style={{ flex: 1 }}>
                <HStack style={{ alignItems: "center" }}>
                  <Text style={styles.infoLabel}>Katılımcılar</Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: categoryColor,
                      marginLeft: 5,
                    }}
                  >
                    (Tıkla)
                  </Text>
                </HStack>
                <HStack style={styles.participantInfo}>
                  <Text style={styles.infoValue}>
                    {eventDetail.participantCount}/{eventDetail.maxParticipants}
                  </Text>
                  <Box style={styles.progressBarContainer}>
                    <Box
                      style={[
                        styles.progressBar,
                        {
                          width: `${
                            (eventDetail.participantCount /
                              eventDetail.maxParticipants) *
                            100
                          }%`,
                          backgroundColor: categoryColor,
                        },
                      ]}
                    />
                  </Box>
                </HStack>
              </VStack>
            </Box>
          </TouchableOpacity>
        </Box>

        {/* Tab Seçici */}
        <HStack style={styles.tabSelector}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "info" && styles.activeTab]}
            onPress={() => setActiveTab("info")}
          >
            <Info
              size={18}
              color={activeTab === "info" ? categoryColor : theme.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "info" && { color: categoryColor },
              ]}
            >
              Bilgiler
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "reviews" && styles.activeTab]}
            onPress={() => setActiveTab("reviews")}
          >
            <MessageCircle
              size={18}
              color={
                activeTab === "reviews" ? categoryColor : theme.textSecondary
              }
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "reviews" && { color: categoryColor },
              ]}
            >
              Yorumlar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "map" && styles.activeTab]}
            onPress={() => setActiveTab("map")}
          >
            <Map
              size={18}
              color={activeTab === "map" ? categoryColor : theme.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "map" && { color: categoryColor },
              ]}
            >
              Harita
            </Text>
          </TouchableOpacity>
        </HStack>

        {/* Tab İçeriği */}
        {renderTabContent()}
      </ScrollView>

      {/* Alt Butonlar */}
      <HStack style={styles.actionButtons}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            { flex: 2 },
            isJoined ? styles.leaveButton : styles.joinButton,
          ]}
          onPress={handleToggleJoin}
        >
          <Text
            style={[
              styles.actionButtonText,
              isJoined && styles.leaveButtonText,
            ]}
          >
            {isJoined ? "Ayrıl" : "Katıl"}
          </Text>
        </TouchableOpacity>
      </HStack>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingTop: Platform.OS === "android" ? 0 : 0,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: theme.textSecondary,
  },
  imageContainer: {
    width: "100%",
    height: 240,
    position: "relative",
  },
  eventImage: {
    width: "100%",
    height: "100%",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  backButtonInner: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryTag: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
  },
  joinedBadge: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: theme.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  joinedText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
  titleContainer: {
    padding: 20,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.text,
    marginBottom: 10,
  },
  organizer: {
    alignItems: "center",
  },
  organizerLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  organizerName: {
    fontSize: 14,
    color: theme.textSecondary,
    fontWeight: "500",
  },
  infoCards: {
    padding: 16,
    backgroundColor: theme.surface,
  },
  infoRow: {
    gap: 10,
    marginBottom: 10,
  },
  infoCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.background,
    borderRadius: 12,
    padding: 12,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  participantsCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.background,
    borderRadius: 12,
    padding: 12,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.text,
  },
  distanceText: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 2,
  },
  participantInfo: {
    alignItems: "center",
    gap: 8,
  },
  progressBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 3,
  },
  tabSelector: {
    backgroundColor: theme.surface,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.border,
    paddingVertical: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 6,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: theme.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.textSecondary,
  },
  tabContent: {
    padding: 16,
    backgroundColor: theme.surface,
  },
  infoSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.textSecondary,
  },
  tagContainer: {
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: theme.primaryPale,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: theme.primary,
    fontWeight: "500",
  },
  mapContainer: {
    height: 300,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    marginBottom: 16,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  customMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  getDirectionsButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  getDirectionsButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  getDirectionsText: {
    fontSize: 14,
    fontWeight: "600",
  },
  actionButtons: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    backgroundColor: theme.surface,
  },
  actionButton: {
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  joinButton: {
    backgroundColor: theme.primary,
  },
  leaveButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: theme.error,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  leaveButtonText: {
    color: theme.error,
  },
  actionIconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.background,
    marginLeft: 4,
    borderWidth: 1,
    borderColor: theme.border,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 5,
  },
  participantsListContainer: {
    flex: 1,
  },
  participantItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  participantImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  participantDetails: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.text,
  },
  participantRole: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 2,
  },
  moreParticipantsInfo: {
    padding: 15,
    alignItems: "center",
  },
  moreParticipantsText: {
    fontSize: 14,
    color: theme.textSecondary,
    fontWeight: "500",
  },
  noParticipantsText: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: "center",
    marginVertical: 20,
  },
});
