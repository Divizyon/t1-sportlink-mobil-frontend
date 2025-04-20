import React, { useState, useEffect } from "react";
import {
  View,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  Platform,
} from "react-native";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { router } from "expo-router";
import {
  MapPin,
  Calendar,
  Clock,
  Plus,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Star,
  UserCheck,
  CheckCircle,
  Filter,
  Users,
  Layers,
  Building,
  TrendingUp,
} from "lucide-react-native";

// Geçici kullanıcı verileri
const userData = {
  name: "Özgür Eren",
  avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg",
  isPro: true,
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
      "https://randomuser.me/api/portraits/men/78.jpg",
      "https://randomuser.me/api/portraits/women/23.jpg",
    ],
    participantCount: 14,
    maxParticipants: 20,
    rating: 4.6,
    reviews: [
      {
        id: 1,
        userName: "Emre K.",
        rating: 5,
        comment: "Harika bir rota ve arkadaş ortamı.",
      },
    ],
    isJoined: false,
    organizer: {
      id: 8,
      name: "Bisikletliler Derneği",
      isVerified: true,
      logoUrl: "https://randomuser.me/api/portraits/men/55.jpg",
    },
    description:
      "Konya şehir içi keyifli bisiklet turu. Orta seviye kondisyon gerektirmektedir.",
    requirements: "Kendi bisikletinizi ve kaskınızı getirmeniz gerekiyor.",
  },
  {
    id: 9,
    title: "Masa Tenisi Turnuvası",
    type: "Turnuva",
    category: "Masa Tenisi",
    date: "25 Ekim",
    time: "14:00-18:00",
    location: "Bosna Hersek Gençlik Merkezi",
    coordinates: {
      latitude: 37.893,
      longitude: 32.473,
    },
    distance: "5.8 km",
    participants: [
      "https://randomuser.me/api/portraits/men/62.jpg",
      "https://randomuser.me/api/portraits/women/37.jpg",
    ],
    participantCount: 16,
    maxParticipants: 32,
    rating: 4.4,
    reviews: [
      {
        id: 1,
        userName: "Tolga B.",
        rating: 4,
        comment: "Rekabetçi ve eğlenceli bir ortamdı.",
      },
    ],
    isJoined: false,
    organizer: {
      id: 9,
      name: "Konya Masa Tenisi Kulübü",
      isVerified: false,
      logoUrl: "https://randomuser.me/api/portraits/men/91.jpg",
    },
    description:
      "Amatör masa tenisi turnuvası. Her seviyeden oyuncu katılabilir.",
    requirements:
      "Kendi raketinizi getirmeniz önerilir. Spor ayakkabı zorunludur.",
  },
  {
    id: 10,
    title: "Dağ Bisikleti Eğitimi",
    type: "Eğitim",
    category: "Bisiklet",
    date: "26 Ekim",
    time: "10:00-13:00",
    location: "Real AVM Yanı",
    coordinates: {
      latitude: 37.883,
      longitude: 32.51,
    },
    distance: "4.1 km",
    participants: [
      "https://randomuser.me/api/portraits/men/39.jpg",
      "https://randomuser.me/api/portraits/women/41.jpg",
    ],
    participantCount: 8,
    maxParticipants: 10,
    rating: 4.9,
    reviews: [
      {
        id: 1,
        userName: "Meryem H.",
        rating: 5,
        comment: "Çok profesyonel bir eğitimdi, temel teknikleri öğrendim.",
      },
    ],
    isJoined: false,
    organizer: {
      id: 10,
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

// Geçici haber verileri
const newsData = [
  {
    id: 1,
    title: "Konyaspor'un yeni sezondaki ilk maçı",
    image: "https://picsum.photos/300/150",
    date: "21 Ekim",
  },
  {
    id: 2,
    title: "Yerel basketbol turnuvası kayıtları başladı",
    image: "https://picsum.photos/300/151",
    date: "22 Ekim",
  },
];

// Haftanın günleri
const daysOfWeek = ["Pzr", "Pzt", "Sal", "Çrş", "Per", "Cum", "Cmt"];

// Spor kategorileri
const sportCategories = [
  { id: 1, name: "Tümü", icon: "🏆" },
  { id: 2, name: "Futbol", icon: "⚽" },
  { id: 3, name: "Basketbol", icon: "🏀" },
  { id: 4, name: "Yüzme", icon: "🏊" },
  { id: 5, name: "Tenis", icon: "🎾" },
  { id: 6, name: "Voleybol", icon: "🏐" },
];

export default function DashboardScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activityPercentage, setActivityPercentage] = useState(69);
  const [filteredEvents, setFilteredEvents] = useState(eventData);
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [distanceFilter, setDistanceFilter] = useState(10); // km cinsinden
  const [activeTab, setActiveTab] = useState("nearby"); // "nearby" veya "joined"
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [eventToRate, setEventToRate] = useState<any>(null);
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

    // Gerçek uygulamada şöyle olurdu:
    // const getLocation = async () => {
    //   try {
    //     const { status } = await Location.requestForegroundPermissionsAsync();
    //     if (status !== 'granted') {
    //       Alert.alert('İzin Hatası', 'Konum izni verilmedi');
    //       setIsLocationLoading(false);
    //       return;
    //     }
    //     const location = await Location.getCurrentPositionAsync({});
    //     setUserCoordinates({
    //       latitude: location.coords.latitude,
    //       longitude: location.coords.longitude
    //     });
    //     setIsLocationLoading(false);
    //   } catch (error) {
    //     console.error('Konum alınamadı:', error);
    //     setIsLocationLoading(false);
    //   }
    // };
    // getLocation();
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

  // Kullanıcının katıldığı etkinlikleri filtreleme
  const joinedEvents = eventData.filter((event) => event.isJoined);

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
    // Dialog kaldırıldı, etkinlikler doğrudan listelenecek
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
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Box style={styles.header}>
          <HStack style={styles.userInfo}>
            <Image source={{ uri: userData.avatarUrl }} style={styles.avatar} />
            <VStack style={{ marginLeft: 8 }}>
              <Text style={styles.userName}>{userData.name}</Text>
              {userData.isPro && (
                <Box style={styles.proBadge}>
                  <Text style={styles.proText}>PRO</Text>
                </Box>
              )}
            </VStack>
          </HStack>
          <HStack>
            <TouchableOpacity style={styles.iconButton}>
              <Settings size={22} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Bell size={22} color="#333" />
            </TouchableOpacity>
          </HStack>
        </Box>

        {/* Calendar Section */}
        <Box style={styles.calendarSection}>
          <HStack style={styles.monthHeader}>
            <Text style={styles.monthTitle}>
              {currentDay} {currentMonth}
            </Text>
            <HStack>
              <TouchableOpacity
                onPress={handlePrevWeek}
                style={styles.navButton}
              >
                <ChevronLeft size={20} color="#333" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleNextWeek}
                style={styles.navButton}
              >
                <ChevronRight size={20} color="#333" />
              </TouchableOpacity>
            </HStack>
          </HStack>

          <HStack style={styles.daysContainer}>
            {days.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.dayItem, day.isSelected && styles.selectedDay]}
                onPress={() => handleDateSelect(day.date)}
              >
                <Text style={styles.dayName}>{day.dayName}</Text>
                <Text
                  style={[
                    styles.dayNumber,
                    day.isSelected && styles.selectedDayText,
                  ]}
                >
                  {day.dayNumber}
                </Text>
                {day.isSelected && <View style={styles.selectedDot} />}
              </TouchableOpacity>
            ))}
          </HStack>
        </Box>

        {/* Sport Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {sportCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryItem,
                selectedCategory === category.name && styles.selectedCategory,
              ]}
              onPress={() => handleCategorySelect(category.name)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text
                style={[
                  styles.categoryName,
                  selectedCategory === category.name &&
                    styles.selectedCategoryText,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Distance Filter */}
        <Box style={styles.filterSection}>
          <Text style={styles.filterLabel}>
            Maksimum uzaklık: {distanceFilter} km
          </Text>
          <View style={styles.sliderContainer}>
            <TouchableOpacity
              style={styles.sliderButton}
              onPress={() =>
                handleDistanceFilterChange(Math.max(1, distanceFilter - 1))
              }
            >
              <Text>-</Text>
            </TouchableOpacity>

            <View style={styles.sliderTrack}>
              <View
                style={[
                  styles.sliderFill,
                  { width: `${(distanceFilter / 10) * 100}%` },
                ]}
              />
            </View>

            <TouchableOpacity
              style={styles.sliderButton}
              onPress={() =>
                handleDistanceFilterChange(Math.min(10, distanceFilter + 1))
              }
            >
              <Text>+</Text>
            </TouchableOpacity>
          </View>
        </Box>

        {/* Featured Event - Yakındaki en iyi etkinlik */}
        {activeTab === "nearby" && filteredEvents.length > 0 && (
          <Box style={styles.featuredEventContainer}>
            <HStack
              style={{
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 15,
              }}
            >
              <Text style={styles.featuredEventTitle}>Öne Çıkan Etkinlik</Text>
              <HStack style={styles.trendingBadge}>
                <TrendingUp size={14} color="#047857" />
                <Text style={styles.trendingText}>Popüler</Text>
              </HStack>
            </HStack>

            <TouchableOpacity
              style={styles.featuredEventCard}
              onPress={() => handleEventPress(filteredEvents[0].id)}
            >
              <Image
                source={{ uri: "https://picsum.photos/500/300" }}
                style={styles.featuredEventImage}
              />
              <Box style={styles.featuredEventBadge}>
                <Text style={styles.featuredEventBadgeText}>ÖNE ÇIKAN</Text>
              </Box>

              <Box style={styles.featuredEventContent}>
                <HStack style={styles.featuredEventMeta}>
                  <Box style={styles.featuredEventCategory}>
                    <Text style={styles.featuredEventCategoryText}>
                      {filteredEvents[0].category}
                    </Text>
                  </Box>
                  <HStack style={{ alignItems: "center" }}>
                    <Star size={14} color="#f59e0b" fill="#f59e0b" />
                    <Text style={styles.featuredEventRating}>
                      {filteredEvents[0].rating}
                    </Text>
                  </HStack>
                </HStack>

                <Text style={styles.featuredEventName}>
                  {filteredEvents[0].title}
                </Text>
                <Text style={styles.featuredEventDescription} numberOfLines={2}>
                  {filteredEvents[0].description}
                </Text>

                <HStack style={styles.featuredEventDetails}>
                  <HStack style={styles.featuredEventDetail}>
                    <Calendar size={14} color="#666" />
                    <Text style={styles.featuredEventDetailText}>
                      {filteredEvents[0].date}
                    </Text>
                  </HStack>
                  <HStack style={styles.featuredEventDetail}>
                    <Clock size={14} color="#666" />
                    <Text style={styles.featuredEventDetailText}>
                      {filteredEvents[0].time}
                    </Text>
                  </HStack>
                </HStack>

                <HStack style={styles.featuredEventLocation}>
                  <MapPin size={14} color="#666" />
                  <Text style={styles.featuredEventDetailText}>
                    {filteredEvents[0].location} ({filteredEvents[0].distance})
                  </Text>
                </HStack>

                <HStack style={styles.featuredEventOrganizer}>
                  <Image
                    source={{ uri: filteredEvents[0].organizer.logoUrl }}
                    style={styles.featuredEventOrganizerLogo}
                  />
                  <VStack style={{ flex: 1 }}>
                    <HStack style={{ alignItems: "center" }}>
                      <Text style={styles.featuredEventOrganizerName}>
                        {filteredEvents[0].organizer.name}
                      </Text>
                      {filteredEvents[0].organizer.isVerified && (
                        <CheckCircle
                          size={12}
                          color="#047857"
                          style={{ marginLeft: 4 }}
                        />
                      )}
                    </HStack>
                    <HStack style={styles.featuredEventParticipantsInfo}>
                      <Users size={12} color="#666" />
                      <Text style={styles.featuredEventParticipantsText}>
                        {filteredEvents[0].participantCount}/
                        {filteredEvents[0].maxParticipants} katılımcı
                      </Text>
                    </HStack>
                  </VStack>

                  <TouchableOpacity
                    style={[
                      styles.featuredJoinButton,
                      filteredEvents[0].isJoined && styles.featuredJoinedButton,
                    ]}
                    onPress={() => handleJoinEvent(filteredEvents[0].id)}
                  >
                    <Text
                      style={[
                        styles.featuredJoinButtonText,
                        filteredEvents[0].isJoined &&
                          styles.featuredJoinedButtonText,
                      ]}
                    >
                      {filteredEvents[0].isJoined ? "Katılıyor" : "Katıl"}
                    </Text>
                  </TouchableOpacity>
                </HStack>
              </Box>
            </TouchableOpacity>
          </Box>
        )}

        {/* Events Tabs */}
        <HStack style={styles.tabsContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "nearby" && styles.activeTabButton,
            ]}
            onPress={() => handleTabChange("nearby")}
          >
            <MapPin
              size={16}
              color={activeTab === "nearby" ? "#047857" : "#666"}
            />
            <Text
              style={[
                styles.tabButtonText,
                activeTab === "nearby" && styles.activeTabButtonText,
              ]}
            >
              Yaklaşan Etkinlikler{isLocationLoading ? " (Yükleniyor...)" : ""}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "joined" && styles.activeTabButton,
            ]}
            onPress={() => handleTabChange("joined")}
          >
            <UserCheck
              size={16}
              color={activeTab === "joined" ? "#047857" : "#666"}
            />
            <Text
              style={[
                styles.tabButtonText,
                activeTab === "joined" && styles.activeTabButtonText,
              ]}
            >
              Katıldığım Etkinlikler
            </Text>
          </TouchableOpacity>
        </HStack>

        {/* Events Header */}
        <Box style={styles.sectionHeader}>
          <HStack style={{ alignItems: "center" }}>
            <Text style={styles.sectionTitle}>
              {activeTab === "nearby"
                ? "Yaklaşan Etkinlikler"
                : "Katıldığım Etkinlikler"}
            </Text>
            {activeTab === "nearby" && (
              <Box style={styles.nearbyCountBadge}>
                <Text style={styles.nearbyCountText}>
                  {filteredEvents.length}
                </Text>
              </Box>
            )}
          </HStack>
        </Box>

        {/* Events List */}
        <VStack style={styles.eventsContainer}>
          {isLocationLoading && activeTab === "nearby" ? (
            <Box style={styles.noEventsMessage}>
              <Text style={styles.noEventsText}>Konum bilgisi alınıyor...</Text>
            </Box>
          ) : filteredEvents.length > 0 ? (
            <>
              {activeTab === "nearby" && (
                <Box style={styles.locationInfoBox}>
                  <MapPin
                    size={16}
                    color="#047857"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.locationInfoText}>
                    Konumunuza göre yaklaşan {filteredEvents.length} etkinlik
                    listeleniyor ({userCoordinates.latitude.toFixed(4)},{" "}
                    {userCoordinates.longitude.toFixed(4)})
                  </Text>
                </Box>
              )}
              {filteredEvents.map((event) => (
                <TouchableOpacity
                  key={event.id}
                  style={styles.eventCard}
                  onPress={() => handleEventPress(event.id)}
                >
                  <HStack style={styles.eventHeader}>
                    <Box style={styles.dateBox}>
                      <Text style={styles.dateNumber}>
                        {event.date.split(" ")[0]}
                      </Text>
                      <Text style={styles.dateMonth}>Eki</Text>
                    </Box>
                    <VStack style={styles.eventDetails}>
                      <HStack style={styles.eventTopInfo}>
                        <Text style={styles.eventTime}>{event.time}</Text>
                        <HStack style={styles.organizerBadge}>
                          <Building size={12} color="#047857" />
                          <Text style={styles.organizerBadgeText}>
                            {event.organizer.name}
                          </Text>
                        </HStack>
                      </HStack>
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      <Text style={styles.eventDescription} numberOfLines={1}>
                        {event.description}
                      </Text>
                      <HStack style={styles.eventTypeContainer}>
                        <Box
                          style={
                            event.type === "Spor"
                              ? styles.workTag
                              : styles.meetingTag
                          }
                        >
                          <Text style={styles.tagText}>{event.type}</Text>
                        </Box>
                        <HStack style={styles.participants}>
                          {event.participants.map((participant, index) => (
                            <Image
                              key={index}
                              source={{ uri: participant }}
                              style={[
                                styles.participantAvatar,
                                { marginLeft: index > 0 ? -10 : 0 },
                              ]}
                            />
                          ))}
                          {event.participantCount > 3 && (
                            <Box style={styles.moreParticipantsBadge}>
                              <Text style={styles.moreParticipantsText}>
                                +{event.participantCount - 3}
                              </Text>
                            </Box>
                          )}
                        </HStack>
                      </HStack>
                      <HStack style={styles.eventExtraInfo}>
                        <Box style={styles.distanceInfo}>
                          <MapPin
                            size={14}
                            color="#666"
                            style={{ marginRight: 4 }}
                          />
                          <Text style={styles.distanceText}>
                            {event.distance}
                          </Text>
                        </Box>
                        <Box style={styles.ratingInfo}>
                          <Text style={styles.ratingText}>
                            ⭐ {event.rating}
                          </Text>
                        </Box>
                      </HStack>
                      <HStack style={styles.eventActions}>
                        <TouchableOpacity
                          style={[
                            styles.joinButton,
                            event.isJoined && styles.joinedButton,
                          ]}
                          onPress={() => handleJoinEvent(event.id)}
                        >
                          <Text
                            style={[
                              styles.joinButtonText,
                              event.isJoined && styles.joinedButtonText,
                            ]}
                          >
                            {event.isJoined ? "Katılıyor" : "Katıl"}
                          </Text>
                          {event.isJoined && (
                            <CheckCircle
                              size={14}
                              color="#047857"
                              style={{ marginLeft: 4 }}
                            />
                          )}
                        </TouchableOpacity>

                        {event.isJoined && (
                          <TouchableOpacity
                            style={styles.rateButton}
                            onPress={() => handleRateEvent(event.id)}
                          >
                            <Text style={styles.rateButtonText}>
                              Değerlendir
                            </Text>
                            <Star
                              size={14}
                              color="#f59e0b"
                              style={{ marginLeft: 4 }}
                            />
                          </TouchableOpacity>
                        )}
                      </HStack>
                    </VStack>
                    <TouchableOpacity style={styles.moreButton}>
                      <MoreVertical size={20} color="#666" />
                    </TouchableOpacity>
                  </HStack>
                </TouchableOpacity>
              ))}
            </>
          ) : (
            <Box style={styles.noEventsMessage}>
              <Text style={styles.noEventsText}>
                {activeTab === "nearby"
                  ? "Bu kriterlere uygun etkinlik bulunamadı. Mesafe filtresini artırmayı deneyin."
                  : "Henüz katıldığın bir etkinlik bulunmuyor."}
              </Text>
            </Box>
          )}
        </VStack>

        {/* News Section */}
        <Box style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Spor Haberleri</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>Tümünü Gör</Text>
          </TouchableOpacity>
        </Box>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.newsScrollContainer}
        >
          {newsData.map((news) => (
            <TouchableOpacity key={news.id} style={styles.newsCard}>
              <Image source={{ uri: news.image }} style={styles.newsImage} />
              <Box style={styles.newsContent}>
                <Text style={styles.newsTitle}>{news.title}</Text>
                <Text style={styles.newsDate}>{news.date}</Text>
              </Box>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Bottom Spacing */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Rating Modal */}
      {showRatingModal && (
        <View style={styles.ratingModal}>
          <View style={styles.ratingContent}>
            <Text style={styles.ratingTitle}>Etkinlik Değerlendirme</Text>
            <View style={styles.ratingStars}>
              {[1, 2, 3, 4, 5].map((star, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.starButton}
                  onPress={() => setRating(star)}
                >
                  <Star
                    size={24}
                    color={star <= rating ? "#f59e0b" : "#e2e8f0"}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.ratingCommentLabel}>Yorumunuz:</Text>
            <TextInput
              style={styles.ratingCommentInput}
              value={reviewComment}
              onChangeText={setReviewComment}
              multiline
            />
            <TouchableOpacity
              style={styles.submitButton}
              onPress={submitRating}
            >
              <Text style={styles.submitButtonText}>Değerlendir</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  proBadge: {
    backgroundColor: "#f0d080",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 4,
  },
  proText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
  },
  iconButton: {
    padding: 8,
    marginLeft: 5,
  },
  calendarSection: {
    backgroundColor: "#fff",
    padding: 20,
  },
  monthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  navButton: {
    padding: 5,
    marginHorizontal: 5,
  },
  daysContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayItem: {
    alignItems: "center",
    width: 40,
  },
  dayName: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
  },
  selectedDay: {
    borderRadius: 5,
  },
  selectedDayText: {
    color: "#000",
    fontWeight: "bold",
  },
  selectedDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#000",
    marginTop: 4,
  },
  activitySection: {
    backgroundColor: "#e8f4f8",
    borderRadius: 15,
    margin: 15,
    padding: 15,
  },
  activityContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressCircleContainer: {
    position: "relative",
    width: 70,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
  },
  progressCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 8,
    borderColor: "#cce6ef",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  progressInnerCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  progressArc: {
    position: "absolute",
    width: 35,
    height: 70,
    right: 0,
    top: 0,
    backgroundColor: "#4DB6AC",
    borderTopRightRadius: 35,
    borderBottomRightRadius: 35,
  },
  checkmark: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#4DB6AC",
    justifyContent: "center",
    alignItems: "center",
  },
  activityInfo: {
    flex: 1,
    marginLeft: 15,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  activityDesc: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  eventsContainer: {
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  eventCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 10,
    padding: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
  },
  eventTime: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  eventTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  participants: {
    flexDirection: "row",
  },
  participantAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#fff",
  },
  moreButton: {
    padding: 5,
  },
  viewAllText: {
    fontSize: 14,
    color: "#4DB6AC",
  },
  newsScrollContainer: {
    paddingLeft: 15,
  },
  newsCard: {
    width: 250,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginRight: 15,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  newsImage: {
    width: "100%",
    height: 120,
  },
  newsContent: {
    padding: 10,
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  newsDate: {
    fontSize: 12,
    color: "#999",
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    height: 60,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  navItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  homeIndicator: {
    width: 40,
    height: 5,
    backgroundColor: "#ddd",
    borderRadius: 3,
  },
  categoriesContainer: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: "#fff",
    marginBottom: 5,
  },
  categoryItem: {
    alignItems: "center",
    marginRight: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 15,
    backgroundColor: "#f5f5f5",
  },
  selectedCategory: {
    backgroundColor: "#e6f7f4",
    borderColor: "#047857",
    borderWidth: 1,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 12,
    color: "#666",
  },
  selectedCategoryText: {
    color: "#047857",
    fontWeight: "500",
  },
  filterSection: {
    padding: 15,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  filterLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  sliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sliderTrack: {
    flex: 1,
    height: 6,
    backgroundColor: "#e2e8f0",
    borderRadius: 3,
    marginHorizontal: 10,
    overflow: "hidden",
  },
  sliderFill: {
    height: "100%",
    backgroundColor: "#047857",
    borderRadius: 3,
  },
  sliderButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  eventExtraInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  distanceInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  distanceText: {
    fontSize: 12,
    color: "#666",
  },
  ratingInfo: {
    backgroundColor: "#fff9e6",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  ratingText: {
    fontSize: 12,
    color: "#f59e0b",
  },
  noEventsMessage: {
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  noEventsText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    marginBottom: 10,
    borderRadius: 8,
    marginHorizontal: 15,
    padding: 5,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 6,
  },
  activeTabButton: {
    backgroundColor: "#e6f7f4",
  },
  tabButtonText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#666",
  },
  activeTabButtonText: {
    color: "#047857",
    fontWeight: "500",
  },
  ratingModal: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  ratingContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  ratingStars: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  starButton: {
    padding: 10,
  },
  ratingCommentLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  ratingCommentInput: {
    height: 100,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: "#047857",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  eventActions: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 8,
  },
  joinButton: {
    backgroundColor: "#047857",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  joinedButton: {
    backgroundColor: "#e6f7f4",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#047857",
  },
  joinButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  joinedButtonText: {
    color: "#047857",
    fontSize: 12,
    fontWeight: "500",
  },
  rateButton: {
    backgroundColor: "#fff9e6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f59e0b",
  },
  rateButtonText: {
    color: "#f59e0b",
    fontSize: 12,
    fontWeight: "500",
  },
  featuredEventContainer: {
    padding: 15,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  featuredEventTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  featuredEventCard: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featuredEventImage: {
    width: "100%",
    height: 180,
  },
  featuredEventBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#047857",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  featuredEventBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
  },
  featuredEventContent: {
    padding: 15,
  },
  featuredEventMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  featuredEventCategory: {
    backgroundColor: "#e6f7f4",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
  },
  featuredEventCategoryText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#047857",
  },
  featuredEventRating: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 4,
  },
  featuredEventName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  featuredEventDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  featuredEventDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  featuredEventDetailText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
  },
  featuredEventOrganizer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  featuredEventOrganizerLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  featuredEventOrganizerName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  featuredEventParticipantsInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  featuredEventParticipantsText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  eventTopInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  organizerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e6f7f4",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  organizerBadgeText: {
    fontSize: 12,
    color: "#047857",
    marginLeft: 4,
  },
  moreParticipantsBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#e6f7f4",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: -5,
    borderWidth: 2,
    borderColor: "#fff",
  },
  moreParticipantsText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#047857",
  },
  nearbyCountBadge: {
    backgroundColor: "#e6f7f4",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  nearbyCountText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#047857",
  },
  trendingBadge: {
    backgroundColor: "#e6f7f4",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  trendingText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#047857",
    marginLeft: 4,
  },
  featuredJoinButton: {
    backgroundColor: "#047857",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  featuredJoinedButton: {
    backgroundColor: "#e6f7f4",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#047857",
  },
  featuredJoinButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  featuredJoinedButtonText: {
    color: "#047857",
    fontSize: 12,
    fontWeight: "500",
  },
  featuredEventDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  featuredEventLocation: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  locationInfoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e6f7f4",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  locationInfoText: {
    fontSize: 12,
    color: "#047857",
    flex: 1,
  },
});
