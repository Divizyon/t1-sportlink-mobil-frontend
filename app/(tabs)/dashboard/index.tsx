import React, { useState, useEffect } from "react";
import {
  View,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  Text,
  TouchableOpacity,
  Image,
} from "react-native";
import { router } from "expo-router";
import {
  Header,
  DateSelector,
  CategorySelector,
  DistanceFilter,
  TabSelector,
  EventCard,
  RatingModal,
} from "@/components/dashboard";
import {
  Plus,
  MapPin,
  Star,
  Users,
  Clock,
  Calendar,
  CheckCircle,
} from "lucide-react-native";

// Renk teması - fotoğraftaki açık yeşil
const theme = {
  primary: "#34D399", // Ana yeşil renk
  primaryLight: "#D1FAE5", // Çok açık yeşil (fotoğraftaki badge rengi)
  primaryPale: "#ECFDF5", // En açık yeşil tonu (arkaplan için)
  primaryDark: "#10B981", // Koyu yeşil (vurgu için)
  secondary: "#F59E0B", // Vurgu rengi (turuncu/amber)
  background: "#F8FAFC", // Sayfa arkaplanı
  surface: "#FFFFFF", // Kart arkaplanı
  text: "#0F172A", // Ana metin rengi
  textSecondary: "#64748B", // İkincil metin rengi
  border: "#E2E8F0", // Sınır rengi
};

// Geçici kullanıcı verileri
const userData = {
  name: "Özgür Eren",
  avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg",
  isPro: true,
  unreadMessages: 5, // Okunmamış mesaj sayısı eklendi
};

// Kullanıcının mevcut konumu
const userLocation = {
  latitude: 37.8679,
  longitude: 32.4849,
};

// Konya'daki farklı lokasyonlar için etkinlikler
const nearbyLocations = [
  { name: "Meram", latitude: 37.859, longitude: 32.452, distance: 1.2 },
  { name: "Selçuklu", latitude: 37.875, longitude: 32.485, distance: 2.5 },
  { name: "Karatay", latitude: 37.872, longitude: 32.508, distance: 3.7 },
  { name: "Real", latitude: 37.883, longitude: 32.51, distance: 4.1 },
  { name: "Bosna Hersek", latitude: 37.893, longitude: 32.473, distance: 5.8 },
  {
    name: "Alaaddin Tepesi",
    latitude: 37.871,
    longitude: 32.493,
    distance: 0.8,
  },
  { name: "Kule Site", latitude: 37.873, longitude: 32.498, distance: 1.5 },
  { name: "Zafer", latitude: 37.863, longitude: 32.482, distance: 0.9 },
];

// Mesafe hesaplama fonksiyonu (Haversine formülü) - km cinsinden mesafe döndürür
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Dünya'nın yarıçapı (km)
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

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

// Geçici etkinlik verileri
const eventData = [
  {
    id: 1,
    title: "Basketbol Maçı",
    type: "Spor",
    category: "Basketbol",
    date: "23 Ekim",
    time: "11:00-13:00",
    location: "Konya Basket Sahası",
    coordinates: {
      latitude: 37.8651,
      longitude: 32.4932,
    },
    distance: "1.2 km",
    participants: [
      "https://randomuser.me/api/portraits/women/68.jpg",
      "https://randomuser.me/api/portraits/men/75.jpg",
    ],
    participantCount: 10,
    maxParticipants: 12,
    rating: 4.5,
    reviews: [
      {
        id: 1,
        userName: "Ahmet K.",
        rating: 5,
        comment: "Harika bir etkinlikti!",
      },
      {
        id: 2,
        userName: "Zeynep T.",
        rating: 4,
        comment: "Eğlenceliydi ama biraz kalabalıktı.",
      },
    ],
    isJoined: false,
    organizer: {
      id: 1,
      name: "Konya Spor Kulübü",
      isVerified: true,
      logoUrl: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    description:
      "Basketbol severler için haftalık dostluk maçı. Her seviyeden oyuncular katılabilir.",
    requirements: "Spor ayakkabı ve rahat kıyafet getirmeniz yeterli.",
  },
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
  {
    id: 4,
    title: "Tenis Dersi",
    type: "Kurs",
    category: "Tenis",
    date: "25 Ekim",
    time: "18:00-20:00",
    location: "Selçuklu Tenis Kulübü",
    coordinates: {
      latitude: 37.875,
      longitude: 32.4852,
    },
    distance: "4.1 km",
    participants: [
      "https://randomuser.me/api/portraits/women/28.jpg",
      "https://randomuser.me/api/portraits/men/36.jpg",
    ],
    participantCount: 6,
    maxParticipants: 8,
    rating: 4.9,
    reviews: [
      {
        id: 1,
        userName: "Berk T.",
        rating: 5,
        comment: "Eğitmen çok iyiydi, çok şey öğrendim.",
      },
      {
        id: 2,
        userName: "Selin Ç.",
        rating: 5,
        comment: "Küçük gruplar halinde öğrenmek çok etkili.",
      },
    ],
    isJoined: false,
    organizer: {
      id: 4,
      name: "Selçuklu Tenis Akademisi",
      isVerified: true,
      logoUrl: "https://randomuser.me/api/portraits/men/29.jpg",
    },
    description:
      "Başlangıç seviyesinden ileri seviyeye tenis dersleri. Raketler kulüp tarafından sağlanmaktadır.",
    requirements:
      "Spor ayakkabı ve rahat kıyafet yeterlidir. Raket isterseniz yanınızda getirebilirsiniz.",
  },
  // Yeni etkinlikler ekleniyor
  {
    id: 6,
    title: "Sabah Koşusu",
    type: "Spor",
    category: "Koşu",
    date: "23 Ekim",
    time: "07:30-08:30",
    location: "Alaaddin Tepesi",
    coordinates: {
      latitude: 37.871,
      longitude: 32.493,
    },
    distance: "0.8 km",
    participants: [
      "https://randomuser.me/api/portraits/men/25.jpg",
      "https://randomuser.me/api/portraits/women/12.jpg",
    ],
    participantCount: 7,
    maxParticipants: 15,
    rating: 4.7,
    reviews: [
      {
        id: 1,
        userName: "Murat L.",
        rating: 5,
        comment: "Muhteşem bir başlangıç! Güne enerjik başlamak için ideal.",
      },
    ],
    isJoined: false,
    organizer: {
      id: 6,
      name: "Konya Koşu Grubu",
      isVerified: true,
      logoUrl: "https://randomuser.me/api/portraits/men/22.jpg",
    },
    description:
      "Her seviyeye uygun sabah koşusu. Daha sonra birlikte kahvaltı yapılacaktır.",
    requirements:
      "Koşuya uygun ayakkabı ve kıyafet getirmeniz yeterli. Su şişenizi unutmayın!",
  },
  {
    id: 7,
    title: "Yoga Dersi",
    type: "Kurs",
    category: "Yoga",
    date: "23 Ekim",
    time: "18:00-19:30",
    location: "Zafer Parkı",
    coordinates: {
      latitude: 37.863,
      longitude: 32.482,
    },
    distance: "0.9 km",
    participants: [
      "https://randomuser.me/api/portraits/women/42.jpg",
      "https://randomuser.me/api/portraits/women/51.jpg",
    ],
    participantCount: 12,
    maxParticipants: 15,
    rating: 4.8,
    reviews: [
      {
        id: 1,
        userName: "Ayşe M.",
        rating: 5,
        comment: "Çok huzurlu bir deneyimdi, kesinlikle tekrarlayacağım.",
      },
    ],
    isJoined: false,
    organizer: {
      id: 7,
      name: "Huzur Yoga",
      isVerified: true,
      logoUrl: "https://randomuser.me/api/portraits/women/76.jpg",
    },
    description:
      "Açık havada yoga dersi. Stres atmak ve zihinsel huzur için ideal bir etkinlik.",
    requirements: "Mat getirmeniz rica olunur. Rahat kıyafetler giyiniz.",
  },
  {
    id: 8,
    title: "Bisiklet Turu",
    type: "Tur",
    category: "Bisiklet",
    date: "24 Ekim",
    time: "09:00-12:00",
    location: "Kule Site",
    coordinates: {
      latitude: 37.873,
      longitude: 32.498,
    },
    distance: "1.5 km",
    participants: [
      "https://randomuser.me/api/portraits/men/55.jpg",
      "https://randomuser.me/api/portraits/women/22.jpg",
    ],
    participantCount: 9,
    maxParticipants: 12,
    rating: 4.6,
    reviews: [
      {
        id: 1,
        userName: "Kerem D.",
        rating: 5,
        comment: "Grup lideri çok profesyoneldi, rota mükemmeldi.",
      },
    ],
    isJoined: false,
    organizer: {
      id: 8,
      name: "Konya Bisiklet Topluluğu",
      isVerified: true,
      logoUrl: "https://randomuser.me/api/portraits/men/82.jpg",
    },
    description:
      "Konya'nın tarihi yerlerini keşfetmek için bisiklet turu. Orta zorlukta bir rotadır.",
    requirements:
      "Kendi bisikletinizi getirmeniz gerekmektedir. Kask zorunludur.",
  },
  {
    id: 9,
    title: "Dağ Bisikleti Kursu",
    type: "Kurs",
    category: "Bisiklet",
    date: "25 Ekim",
    time: "10:00-14:00",
    location: "Meram Dağlık Bölge",
    coordinates: {
      latitude: 37.85,
      longitude: 32.44,
    },
    distance: "5.8 km",
    participants: [
      "https://randomuser.me/api/portraits/men/62.jpg",
      "https://randomuser.me/api/portraits/men/47.jpg",
    ],
    participantCount: 5,
    maxParticipants: 8,
    rating: 4.3,
    reviews: [
      {
        id: 1,
        userName: "Burak Y.",
        rating: 4,
        comment: "Zorlu ama öğreticiydi. Güvenlik önlemleri iyiydi.",
      },
    ],
    isJoined: false,
    organizer: {
      id: 9,
      name: "Konya Extreme Sporlar",
      isVerified: true,
      logoUrl: "https://randomuser.me/api/portraits/men/24.jpg",
    },
    description:
      "Dağ bisikleti temel eğitimi. Güvenli sürüş teknikleri ve ekipman bilgisi verilecektir.",
    requirements:
      "Dağ bisikleti ve kask zorunludur. Dizlik ve dirseklik önerilir.",
  },
];

// Spor kategorileri
const sportCategories = [
  { id: 1, name: "Tümü", icon: "🏆" },
  { id: 2, name: "Futbol", icon: "⚽" },
  { id: 3, name: "Basketbol", icon: "🏀" },
  { id: 4, name: "Yüzme", icon: "🏊" },
  { id: 5, name: "Tenis", icon: "🎾" },
  { id: 6, name: "Voleybol", icon: "🏐" },
];

// Haftanın günleri
const daysOfWeek = ["Pzr", "Pzt", "Sal", "Çrş", "Per", "Cum", "Cmt"];

export default function DashboardScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filteredEvents, setFilteredEvents] = useState<Event[]>(eventData);
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [distanceFilter, setDistanceFilter] = useState(10); // km cinsinden
  const [activeTab, setActiveTab] = useState("nearby"); // "nearby" veya "joined"
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [eventToRate, setEventToRate] = useState<Event | null>(null);
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [userCoordinates, setUserCoordinates] = useState(userLocation);
  const [eventsWithDistance, setEventsWithDistance] = useState<Event[]>([]);
  const [isLocationLoading, setIsLocationLoading] = useState(true);

  // Kullanıcının konumunu alma
  useEffect(() => {
    // Bu normalde Expo'nun Location API'ını kullanacak, ancak şimdilik sabit konum kullanıyoruz
    setUserCoordinates(userLocation);
    setIsLocationLoading(false);
  }, []);

  // Mesafe hesapla ve olayları güncelle
  useEffect(() => {
    if (!isLocationLoading) {
      const eventsWithCalculatedDistance = eventData.map((event) => {
        const distance = calculateDistance(
          userCoordinates.latitude,
          userCoordinates.longitude,
          event.coordinates.latitude,
          event.coordinates.longitude
        );
        return {
          ...event,
          calculatedDistance: distance,
          distance: `${distance.toFixed(1)} km`,
        };
      });
      setEventsWithDistance(eventsWithCalculatedDistance);
      filterEvents(selectedDate, selectedCategory, distanceFilter, activeTab);
    }
  }, [
    userCoordinates,
    isLocationLoading,
    selectedDate,
    selectedCategory,
    distanceFilter,
    activeTab,
  ]);

  // Ay ve gün için geçici hesaplamalar
  const currentMonth = new Intl.DateTimeFormat("tr-TR", {
    month: "long",
  }).format(selectedDate);
  const currentDay = selectedDate.getDate();

  // Haftanın günlerini ve tarihlerini hesapla
  const getDaysInWeek = () => {
    const days = [];
    const currentDate = new Date(selectedDate);
    const currentDay = currentDate.getDay(); // 0-6 (Pazar-Cumartesi)

    // Haftanın başlangıcını bul (Pazar)
    currentDate.setDate(currentDate.getDate() - currentDay);

    // Haftanın her günü için
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() + i);

      days.push({
        dayName: daysOfWeek[i],
        dayNumber: date.getDate(),
        date: date,
        isToday: date.toDateString() === new Date().toDateString(),
        isSelected: date.toDateString() === selectedDate.toDateString(),
      });
    }

    return days;
  };

  const days = getDaysInWeek();

  const handlePrevWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedDate(newDate);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    filterEvents(date, selectedCategory, distanceFilter, activeTab);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    filterEvents(selectedDate, category, distanceFilter, activeTab);
  };

  const handleDistanceFilterChange = (distance: number) => {
    setDistanceFilter(distance);
    filterEvents(selectedDate, selectedCategory, distance, activeTab);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "nearby") {
      handleNearbyPress();
    } else {
      filterEvents(selectedDate, selectedCategory, distanceFilter, tab);
    }
  };

  const handleJoinEvent = (eventId: number) => {
    // Gerçek uygulamada, burada API çağrısı yapılır
    // Örnek için, durumu hemen güncelliyoruz
    const updatedEvents = eventData.map((event) => {
      if (event.id === eventId) {
        return { ...event, isJoined: !event.isJoined };
      }
      return event;
    });

    // Gerçek uygulamada state yönetimi için Redux vb. kullanılmalı
    // Bu basit örnek için doğrudan filtreli olayları güncelliyoruz
    setFilteredEvents(
      updatedEvents.filter((event) => {
        if (activeTab === "joined") return event.isJoined;

        const matchesDate = event.date === `${selectedDate.getDate()} Ekim`;
        const matchesCategory =
          selectedCategory === "Tümü" || event.category === selectedCategory;
        const matchesDistance = parseFloat(event.distance) <= distanceFilter;

        return matchesDate && matchesCategory && matchesDistance;
      })
    );

    Alert.alert("Başarılı", "Etkinlik durumu güncellendi.", [
      { text: "Tamam", onPress: () => console.log("OK") },
    ]);
  };

  const handleRateEvent = (eventId: number) => {
    // Derecelendirme başlatma
    const eventToRate = eventData.find((event) => event.id === eventId);
    if (eventToRate) {
      setEventToRate(eventToRate);
      setShowRatingModal(true);
    }
  };

  const submitRating = () => {
    // Gerçek uygulamada, burada API çağrısı yapılır
    console.log(
      `Event ${eventToRate?.id} rated: ${rating}, comment: ${reviewComment}`
    );
    setShowRatingModal(false);
    setRating(0);
    setReviewComment("");
    setEventToRate(null);

    Alert.alert(
      "Değerlendirme Gönderildi",
      "Geri bildiriminiz için teşekkür ederiz!",
      [{ text: "Tamam", onPress: () => console.log("OK") }]
    );
  };

  const filterEvents = (
    date: Date,
    category: string,
    maxDistance: number,
    tab: string
  ) => {
    const dateStr = `${date.getDate()} Ekim`; // Basitleştirilmiş tarih kontrolü, gerçek uygulamada doğru tarih formatı kullanılmalı

    let filtered =
      eventsWithDistance.length > 0
        ? eventsWithDistance.filter((event) => {
            // Eğer "katıldığım" sekmesindeyse, sadece katılınan etkinlikleri göster
            if (tab === "joined") return event.isJoined;

            const matchesDate = event.date === dateStr;
            const matchesCategory =
              category === "Tümü" || event.category === category;
            const matchesDistance = event.calculatedDistance
              ? event.calculatedDistance <= maxDistance
              : false;

            return matchesDate && matchesCategory && matchesDistance;
          })
        : [];

    // Yakındaki etkinlik sekmesinde mesafeye göre sırala
    if (tab === "nearby") {
      filtered = filtered.sort((a, b) => {
        // Null kontrolleri ekle
        const distanceA = a.calculatedDistance || Number.MAX_VALUE;
        const distanceB = b.calculatedDistance || Number.MAX_VALUE;
        return distanceA - distanceB;
      });
    }

    setFilteredEvents(filtered);
  };

  const handleNearbyPress = () => {
    setActiveTab("nearby");
    // Mesafe filtrelemesi ile yakındaki etkinlikleri getir
    filterEvents(selectedDate, selectedCategory, distanceFilter, "nearby");
  };

  const handleCreateEvent = () => {
    // @ts-ignore
    router.navigate("/(tabs)/dashboard/create-event");
  };

  const handleEventPress = (eventId: number) => {
    // @ts-ignore
    router.navigate({
      pathname: "/(tabs)/dashboard/event-details",
      params: { id: eventId },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Header */}
        <View style={styles.headerWrapper}>
          <Header
            userName={userData.name}
            userAvatar={userData.avatarUrl}
            isPro={userData.isPro}
            unreadMessages={userData.unreadMessages}
          />
        </View>

        {/* Calendar Section */}
        <DateSelector
          currentDay={currentDay}
          currentMonth={currentMonth}
          days={days}
          onPrevWeek={handlePrevWeek}
          onNextWeek={handleNextWeek}
          onDateSelect={handleDateSelect}
        />

        {/* Sport Categories */}
        <CategorySelector
          categories={sportCategories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
        />

        {/* Distance Filter */}
        <DistanceFilter
          distance={distanceFilter}
          onDistanceChange={handleDistanceFilterChange}
        />

        {/* Tabs */}
        <TabSelector activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Events */}
        <View style={styles.eventsSection}>
          {isLocationLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Etkinlikler yükleniyor...</Text>
            </View>
          ) : filteredEvents.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Bu kriterlere uygun etkinlik bulunamadı.
              </Text>
            </View>
          ) : (
            filteredEvents.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={styles.eventCard}
                onPress={() => handleEventPress(event.id)}
              >
                <View style={styles.dateBox}>
                  <Text style={styles.dayNumber}>
                    {event.date.split(" ")[0]}
                  </Text>
                  <Text style={styles.monthName}>Eki</Text>
                </View>

                <View style={styles.eventDetails}>
                  <View style={styles.eventTimeContainer}>
                    <Text style={styles.eventTime}>{event.time}</Text>
                    <View style={styles.organizerBadge}>
                      <Text style={styles.organizerBadgeText}>
                        {event.organizer.name}
                      </Text>
                      {event.organizer.isVerified && (
                        <CheckCircle
                          size={12}
                          color={theme.primary}
                          style={{ marginLeft: 4 }}
                        />
                      )}
                    </View>
                  </View>

                  <Text style={styles.eventTitle}>{event.title}</Text>

                  <Text style={styles.eventDescription} numberOfLines={1}>
                    {event.description}
                  </Text>

                  <View style={styles.tagContainer}>
                    <View style={styles.typeTag}>
                      <Text style={styles.typeTagText}>{event.type}</Text>
                    </View>
                  </View>

                  <View style={styles.eventLocation}>
                    <MapPin
                      size={14}
                      color={theme.textSecondary}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={styles.locationText}>
                      {event.location} ({event.distance})
                    </Text>
                  </View>

                  <View style={styles.eventFooter}>
                    <View style={styles.participantsInfo}>
                      <Users
                        size={14}
                        color={theme.textSecondary}
                        style={{ marginRight: 4 }}
                      />
                      <Text style={styles.participantsText}>
                        {event.participantCount}/{event.maxParticipants}{" "}
                        katılımcı
                      </Text>
                    </View>

                    <View style={styles.ratingContainer}>
                      {event.rating > 0 && (
                        <>
                          <Star
                            size={14}
                            color={theme.secondary}
                            fill={theme.secondary}
                            style={{ marginRight: 2 }}
                          />
                          <Text style={styles.ratingValue}>
                            {event.rating.toFixed(1)}
                          </Text>
                        </>
                      )}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Rating Modal */}
      <RatingModal
        visible={showRatingModal}
        eventTitle={eventToRate?.title}
        rating={rating}
        comment={reviewComment}
        onChangeRating={setRating}
        onChangeComment={setReviewComment}
        onSubmit={submitRating}
        onClose={() => setShowRatingModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingTop: Platform.OS === "android" ? 25 : 0,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  headerWrapper: {
    backgroundColor: theme.background,
    paddingVertical: 5,
    paddingHorizontal: 10,
    zIndex: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.text,
  },
  seeAllButton: {
    fontSize: 14,
    color: theme.primary,
  },
  eventsSection: {
    paddingHorizontal: 16,
  },
  eventCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  dateBox: {
    width: 60,
    backgroundColor: "#1E1E1E",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  dayNumber: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
  },
  monthName: {
    fontSize: 14,
    color: "white",
  },
  eventDetails: {
    flex: 1,
    padding: 12,
  },
  eventTimeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  eventTime: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  organizerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  organizerBadgeText: {
    fontSize: 12,
    color: theme.primary,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.text,
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 6,
  },
  tagContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  typeTag: {
    backgroundColor: theme.primaryPale,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  typeTagText: {
    fontSize: 12,
    color: theme.primary,
  },
  eventLocation: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  eventFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  participantsInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  participantsText: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.secondary,
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  loadingContainer: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: "center",
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: "center",
  },
});
