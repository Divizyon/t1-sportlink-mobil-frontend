import {
  CategorySelector,
  DateSelector,
  EventMap,
  Header,
  TabSelector,
} from "@/components/dashboard";
import * as Location from "expo-location";
import { router } from "expo-router";
import { CheckCircle, MapPin, Users } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  PermissionsAndroid,
} from "react-native";
import CreateEventButton from "@/components/dashboard/CreateEventButton";

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
  },
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
  latitude: 37.8717,
  longitude: 32.493, // Konya Alaaddin Tepesi
};

// Konya'daki farklı lokasyonlar için etkinlikler
const nearbyLocations = [
  { name: "Meram", latitude: 37.85, longitude: 32.452, distance: 2.8 },
  { name: "Selçuklu", latitude: 37.875, longitude: 32.485, distance: 1.5 },
  { name: "Karatay", latitude: 37.872, longitude: 32.508, distance: 2.2 },
  { name: "Real", latitude: 37.883, longitude: 32.51, distance: 3.4 },
  { name: "Bosna Hersek", latitude: 37.893, longitude: 32.473, distance: 4.2 },
  { name: "Kültürpark", latitude: 37.875, longitude: 32.492, distance: 0.7 },
  { name: "Kule Site", latitude: 37.873, longitude: 32.498, distance: 1.0 },
  { name: "Zafer", latitude: 37.863, longitude: 32.482, distance: 1.8 },
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
const initialEventData = [
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
  // Yeni eklenen 8 örnek etkinlik
  {
    id: 10,
    title: "Voleybol Turnuvası",
    type: "Spor",
    category: "Voleybol",
    date: "26 Ekim",
    time: "14:00-18:00",
    location: "Selçuklu Spor Salonu",
    coordinates: {
      latitude: 37.885,
      longitude: 32.482,
    },
    distance: "3.2 km",
    participants: [
      "https://randomuser.me/api/portraits/women/18.jpg",
      "https://randomuser.me/api/portraits/men/43.jpg",
    ],
    participantCount: 24,
    maxParticipants: 36,
    isJoined: false,
    organizer: {
      id: 10,
      name: "Selçuklu Belediyesi Spor",
      isVerified: true,
      logoUrl: "https://randomuser.me/api/portraits/men/18.jpg",
    },
    description:
      "6 takımlı voleybol turnuvası. Her seviyeden oyuncular katılabilir. Birinci takıma kupa ve madalya verilecektir.",
    requirements:
      "Spor ayakkabı ve forma gereklidir. Takım olarak başvuru yapmalısınız.",
  },
  {
    id: 11,
    title: "Yüzme Yarışı",
    type: "Yarışma",
    category: "Yüzme",
    date: "27 Ekim",
    time: "09:00-12:00",
    location: "Selçuklu Olimpik Havuz",
    coordinates: {
      latitude: 37.878,
      longitude: 32.492,
    },
    distance: "2.1 km",
    participants: [
      "https://randomuser.me/api/portraits/women/23.jpg",
      "https://randomuser.me/api/portraits/men/67.jpg",
    ],
    participantCount: 18,
    maxParticipants: 30,
    isJoined: false,
    organizer: {
      id: 11,
      name: "Konya Yüzme Federasyonu",
      isVerified: true,
      logoUrl: "https://randomuser.me/api/portraits/women/11.jpg",
    },
    description:
      "Farklı kategorilerde yüzme yarışı. Serbest, kurbağalama ve kelebek stilleri için ayrı yarışmalar olacaktır.",
    requirements:
      "Profesyonel mayo, bone ve gözlük zorunludur. Önceden kayıt yaptırılmalıdır.",
  },
  {
    id: 12,
    title: "Pilates Kursu",
    type: "Kurs",
    category: "Yoga",
    date: "28 Ekim",
    time: "17:30-18:30",
    location: "Meram Spor Merkezi",
    coordinates: {
      latitude: 37.855,
      longitude: 32.465,
    },
    distance: "1.8 km",
    participants: [
      "https://randomuser.me/api/portraits/women/21.jpg",
      "https://randomuser.me/api/portraits/women/34.jpg",
    ],
    participantCount: 10,
    maxParticipants: 15,
    isJoined: false,
    organizer: {
      id: 12,
      name: "Meram Fitness",
      isVerified: true,
      logoUrl: "https://randomuser.me/api/portraits/women/56.jpg",
    },
    description:
      "Başlangıç seviyesi pilates kursu. Doğru duruş ve nefes teknikleri üzerine odaklanılacaktır.",
    requirements:
      "Mat ve rahat kıyafetler getirilmelidir. Havlu ve su tavsiye edilir.",
  },
  {
    id: 13,
    title: "Halı Saha Maçı",
    type: "Spor",
    category: "Futbol",
    date: "29 Ekim",
    time: "20:00-22:00",
    location: "Bosna Hersek Halı Saha",
    coordinates: {
      latitude: 37.893,
      longitude: 32.473,
    },
    distance: "5.8 km",
    participants: [
      "https://randomuser.me/api/portraits/men/12.jpg",
      "https://randomuser.me/api/portraits/men/15.jpg",
    ],
    participantCount: 12,
    maxParticipants: 14,
    isJoined: false,
    organizer: {
      id: 13,
      name: "Konya Futbol Grubu",
      isVerified: false,
      logoUrl: "https://randomuser.me/api/portraits/men/33.jpg",
    },
    description:
      "Haftalık halı saha maçı. Her seviyeden oyuncu katılabilir. Kaleci aranıyor!",
    requirements:
      "Halı saha ayakkabısı ve forma getirmeniz gerekiyor. Saha ücreti kişi başı bölüşülecektir.",
  },
  {
    id: 14,
    title: "Tenis Turnuvası",
    type: "Yarışma",
    category: "Tenis",
    date: "30 Ekim",
    time: "12:00-18:00",
    location: "Meram Tenis Kulübü",
    coordinates: {
      latitude: 37.848,
      longitude: 32.457,
    },
    distance: "4.2 km",
    participants: [
      "https://randomuser.me/api/portraits/men/37.jpg",
      "https://randomuser.me/api/portraits/women/37.jpg",
    ],
    participantCount: 16,
    maxParticipants: 16,
    isJoined: false,
    organizer: {
      id: 14,
      name: "Meram Tenis Akademisi",
      isVerified: true,
      logoUrl: "https://randomuser.me/api/portraits/men/78.jpg",
    },
    description:
      "Tenis turnuvası. Tek erkekler, tek kadınlar ve çiftler kategorilerinde yarışmalar olacaktır.",
    requirements:
      "Tenis raketi, uygun ayakkabı ve kıyafet zorunludur. Turnuva katılım ücreti vardır.",
  },
  {
    id: 15,
    title: "Dağ Yürüyüşü",
    type: "Tur",
    category: "Koşu",
    date: "31 Ekim",
    time: "08:00-14:00",
    location: "Aladağ Yolu",
    coordinates: {
      latitude: 37.842,
      longitude: 32.402,
    },
    distance: "8.7 km",
    participants: [
      "https://randomuser.me/api/portraits/men/52.jpg",
      "https://randomuser.me/api/portraits/women/52.jpg",
    ],
    participantCount: 15,
    maxParticipants: 25,
    isJoined: false,
    organizer: {
      id: 15,
      name: "Konya Doğa Sporları",
      isVerified: true,
      logoUrl: "https://randomuser.me/api/portraits/men/92.jpg",
    },
    description:
      "Aladağ'da orta zorlukta doğa yürüyüşü. Toplamda 12 km'lik parkur, muhteşem manzara eşliğinde tamamlanacak.",
    requirements:
      "Trekking ayakkabısı, sırt çantası, yeterli su ve atıştırmalık getirmeniz gerekiyor. Şapka ve güneş kremi önerilir.",
  },
  {
    id: 16,
    title: "Açık Hava Satranç Turnuvası",
    type: "Yarışma",
    category: "Akıl Oyunları",
    date: "1 Kasım",
    time: "10:00-16:00",
    location: "Kültür Park",
    coordinates: {
      latitude: 37.866,
      longitude: 32.482,
    },
    distance: "0.7 km",
    participants: [
      "https://randomuser.me/api/portraits/men/72.jpg",
      "https://randomuser.me/api/portraits/women/72.jpg",
    ],
    participantCount: 22,
    maxParticipants: 32,
    isJoined: false,
    organizer: {
      id: 16,
      name: "Konya Satranç Kulübü",
      isVerified: true,
      logoUrl: "https://randomuser.me/api/portraits/men/65.jpg",
    },
    description:
      "Açık hava satranç turnuvası. İsviçre sistemi ile 5 tur oynanacaktır. Dereceye girenlere ödül verilecektir.",
    requirements:
      "Önceden kayıt yaptırmanız gerekmektedir. Katılım ücretsizdir.",
  },
  {
    id: 17,
    title: "Okçuluk Eğitimi",
    type: "Kurs",
    category: "Okçuluk",
    date: "2 Kasım",
    time: "15:00-17:00",
    location: "Selçuklu Okçuluk Tesisi",
    coordinates: {
      latitude: 37.881,
      longitude: 32.466,
    },
    distance: "3.5 km",
    participants: [
      "https://randomuser.me/api/portraits/men/82.jpg",
      "https://randomuser.me/api/portraits/women/82.jpg",
    ],
    participantCount: 8,
    maxParticipants: 12,
    isJoined: false,
    organizer: {
      id: 17,
      name: "Selçuklu Okçuluk",
      isVerified: true,
      logoUrl: "https://randomuser.me/api/portraits/men/85.jpg",
    },
    description:
      "Geleneksel Türk okçuluğu eğitimi. Başlangıç seviyesinden ileri seviyeye kadar herkes katılabilir.",
    requirements:
      "Tüm ekipmanlar tesis tarafından sağlanacaktır. Rahat kıyafetler giymeniz önerilir.",
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
  { id: 7, name: "Koşu", icon: "🏃" },
  { id: 8, name: "Yoga", icon: "🧘" },
  { id: 9, name: "Bisiklet", icon: "🚴" },
  { id: 10, name: "Yürüyüş", icon: "🚶" },
];

// Haftanın günleri
const daysOfWeek = ["Pzr", "Pzt", "Sal", "Çrş", "Per", "Cum", "Cmt"];

export default function DashboardScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [eventData, setEventData] = useState<Event[]>(initialEventData);
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [distanceFilter, setDistanceFilter] = useState(3); // Varsayılan olarak 3km'ye düşürdük
  const [activeTab, setActiveTab] = useState("nearby"); // "nearby", "nearest" veya "joined"
  const [userCoordinates, setUserCoordinates] = useState(userLocation);
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [showPOI, setShowPOI] = useState(true); // POI'leri göster/gizle state'i

  // Kullanıcının konumunu alma
  useEffect(() => {
    // Expo Location API'ını kullanarak gerçek konumu al
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.log("Konum izni verilmedi, Alaaddin Tepesi kullanılıyor");
          setUserCoordinates(userLocation); // Konya Alaaddin Tepesi
          setIsLocationLoading(false);
          return;
        }

        // Gerçek uygulamada burası kullanılacak, şimdilik test için Alaaddin Tepesi'ni kullan
        // let location = await Location.getCurrentPositionAsync({});
        // setUserCoordinates({
        //   latitude: location.coords.latitude,
        //   longitude: location.coords.longitude
        // });

        // Test için Alaaddin Tepesi'ni kullan
        setUserCoordinates({
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
        });

        setIsLocationLoading(false);
      } catch (error) {
        console.log("Konum alınamadı:", error);
        // Hata durumunda Alaaddin Tepesi'ni kullan
        setUserCoordinates(userLocation);
        setIsLocationLoading(false);
      }
    })();
  }, []);

  // Uygulama başladığında tüm etkinlikleri göster
  useEffect(() => {
    console.log("Uygulama başlatıldı, tüm etkinlikler yükleniyor");
    // Tüm etkinlikleri yükle, bunu yaparken isLocationLoading'e bağlı kalmayalım
    setFilteredEvents(eventData);
  }, []);

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
    // useEffect applyActiveFilters'ı otomatik olarak tetikleyecek
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    // useEffect applyActiveFilters'ı otomatik olarak tetikleyecek
  };

  const handleDistanceFilterChange = (distance: number) => {
    setDistanceFilter(distance);
    // useEffect applyActiveFilters'ı otomatik olarak tetikleyecek
  };

  const handleTabChange = (tab: string) => {
    console.log(`Tab değişimi: ${activeTab} -> ${tab}`);

    if (tab === activeTab) {
      console.log("Aynı tab tekrar seçildi - etkinlikler yeniden yükleniyor");
    }

    // Just update the tab - the useEffect will handle filtering
    setActiveTab(tab);
    
    // No need to call applyActiveFilters directly as the useEffect will handle it
    // This prevents duplicate filter operations
  };

  const handleNearbyPress = () => {
    // Sadece tab değişikliğini tetikle
    setActiveTab("nearby");
    // useEffect otomatik olarak çalışacak ve filtrelemeyi gerçekleştirecek
  };

  const handleJoinEvent = (eventId: number) => {
    // Update main event data
    const updatedEventData = eventData.map((event) => {
      if (event.id === eventId) {
        return { ...event, isJoined: !event.isJoined };
      }
      return event;
    });

    // Update eventData
    setEventData(updatedEventData);

    // Re-filter the events based on the current filters and active tab
    applyActiveFilters();

    Alert.alert(
      "Başarılı",
      `Etkinliğe ${
        updatedEventData.find((e) => e.id === eventId)?.isJoined
          ? "katıldınız"
          : "katılımınız iptal edildi"
      }.`,
      [{ text: "Tamam", onPress: () => console.log("OK") }]
    );
  };

  useEffect(() => {
    // Konum yüklendikten sonra başlangıç filtrelemesini yap
    if (!isLocationLoading) {
      applyActiveFilters();
    }
  }, [isLocationLoading]);

  // Ekstra debug fonksiyonu ekle
  const logAllCategories = () => {
    // Veri tutarlılığını kontrol et - etkinlikler vs kategori listesi
    const eventCategories = [...new Set(eventData.map((e) => e.category))];
    const sportCategoryNames = sportCategories.map((c) => c.name);

    console.log("Tüm etkinlik kategorileri:", eventCategories);
    console.log("Sport kategorileri:", sportCategoryNames);

    // Eşleşmeyen kategorileri bul
    const mismatchedCategories = eventCategories.filter(
      (c) => !sportCategoryNames.includes(c)
    );
    if (mismatchedCategories.length > 0) {
      console.log("UYARI: Eşleşmeyen kategoriler:", mismatchedCategories);
    }
  };

  // Tab değişikliği, filtre değişikliği ve konum değişikliği için
  useEffect(() => {
    logAllCategories(); // Önce kategori tutarlılığını kontrol et

    if (!isLocationLoading) {
      // Debug için filtreleme bilgilerini göster
      console.log(
        `>> FİLTRELEME: Tab=${activeTab}, Kategori=${selectedCategory}, Mesafe=${distanceFilter}km`
      );

      // Debounce implementation to prevent rapid consecutive updates
      const debounceTimer = setTimeout(() => {
        // Filtreleme uygula
        applyActiveFilters();
      }, 300);
      
      // Clean up timer on next effect run
      return () => clearTimeout(debounceTimer);
    }
  }, [
    activeTab,
    selectedCategory,
    distanceFilter,
    userCoordinates,
    eventData,
    isLocationLoading,
  ]);

  // Tab değişiminde event'lerin görüntülenmesi için ek bir güvenlik önlemi
  useEffect(() => {
    if (
      (activeTab === "nearby" || activeTab === "nearest") &&
      filteredEvents.length === 0 &&
      !isLocationLoading
    ) {
      console.log(
        `${
          activeTab === "nearby" ? "Yakındakiler" : "Bana En Yakın"
        } sekmesinde etkinlik bulunamadı - Tüm etkinlikler yükleniyor`
      );

      if (activeTab === "nearest") {
        // En yakın etkinliği göster
        const eventsWithDistance = eventData.map((event) => {
          const calculatedDistance = calculateDistance(
            userCoordinates.latitude,
            userCoordinates.longitude,
            event.coordinates.latitude,
            event.coordinates.longitude
          );

          return {
            ...event,
            calculatedDistance,
            distance: `${calculatedDistance.toFixed(1)} km`,
          };
        });

        // Mesafeye göre sırala
        const sorted = [...eventsWithDistance].sort(
          (a, b) => a.calculatedDistance - b.calculatedDistance
        );

        // En yakın etkinliği göster
        if (sorted.length > 0) {
          setFilteredEvents([sorted[0]]);
        } else {
          setFilteredEvents([]);
        }
      } else {
        // Yakındakiler için - Mesafeye bakılmaksızın tüm etkinlikleri göster
        setFilteredEvents(eventData);
      }
    }
  }, [activeTab, filteredEvents.length, isLocationLoading]);

  // Aktif filtreleri uygula
  const applyActiveFilters = useCallback(() => {
    console.log(
      `Filtreler uygulanıyor: Tab=${activeTab}, Mesafe=${distanceFilter}, Kategori=${selectedCategory}`
    );

    if (eventData.length === 0) {
      console.log("Henüz etkinlik verisi yok - Filtreler uygulanamıyor");
      return;
    }

    if (!userCoordinates) {
      console.log("Konum bilgisi yok - Mesafe hesaplanamıyor");
      return;
    }

    // Önce tüm event'leri kopyala ve mesafe hesapla
    let eventsWithDistance = eventData.map((event) => {
      const calculatedDistance = calculateDistance(
        userCoordinates.latitude,
        userCoordinates.longitude,
        event.coordinates.latitude,
        event.coordinates.longitude
      );

      return {
        ...event,
        calculatedDistance,
        distance: `${calculatedDistance.toFixed(1)} km`,
      };
    });

    console.log(
      `Toplam ${eventsWithDistance.length} etkinlik için mesafe hesaplandı`
    );

    // Katıldıklarım filtrelemesi
    if (activeTab === "joined") {
      eventsWithDistance = eventsWithDistance.filter((event) => {
        const isJoined = event.isJoined;
        console.log(
          `Etkinlik: ${event.title}, Katılım Durumu: ${
            isJoined ? "Evet" : "Hayır"
          }`
        );
        return isJoined;
      });
      console.log(
        `Filtreleme sonrası ${eventsWithDistance.length} etkinlik (sadece katılınanlar)`
      );
    }
    // Bana En Yakın filtrelemesi
    else if (activeTab === "nearest") {
      // Önce mesafeye göre sırala
      eventsWithDistance = [...eventsWithDistance].sort(
        (a, b) => a.calculatedDistance - b.calculatedDistance
      );

      // Sadece en yakın etkinliği al
      if (eventsWithDistance.length > 0) {
        const nearestEvent = eventsWithDistance[0];
        console.log(
          `En yakın etkinlik: ${nearestEvent.title}, Mesafe: ${nearestEvent.distance}`
        );
        eventsWithDistance = [nearestEvent];
      } else {
        console.log("Hiç etkinlik bulunamadı");
        eventsWithDistance = [];
      }
    }
    // Yakındakiler filtrelemesi
    else {
      // Mesafe filtrelemesi
      if (distanceFilter !== null) {
        eventsWithDistance = eventsWithDistance.filter((event) => {
          const matchesDistance = event.calculatedDistance <= distanceFilter;
          console.log(
            `Etkinlik: ${
              event.title
            }, Mesafe: ${event.calculatedDistance.toFixed(
              1
            )} km, Filtre: ${distanceFilter} km, Eşleşme: ${
              matchesDistance ? "Evet" : "Hayır"
            }`
          );
          return matchesDistance;
        });
        console.log(
          `Filtreleme sonrası ${eventsWithDistance.length} etkinlik (mesafe filtresi)`
        );
      }

      // Kategori filtrelemesi
      if (selectedCategory !== null && selectedCategory !== "Tümü") {
        // Log tüm kategorileri (debug için)
        const availableCategories = [...new Set(eventsWithDistance.map(event => event.category))];
        console.log(`Mevcut etkinlik kategorileri: ${availableCategories.join(', ')}`);
        
        eventsWithDistance = eventsWithDistance.filter((event) => {
          const matchesCategory = event.category === selectedCategory;
          console.log(
            `Etkinlik: ${event.title}, Kategori: ${
              event.category
            }, Filtre: ${selectedCategory}, Eşleşme: ${
              matchesCategory ? "Evet" : "Hayır"
            }`
          );
          return matchesCategory;
        });
        console.log(
          `Filtreleme sonrası ${eventsWithDistance.length} etkinlik (kategori filtresi)`
        );
      } else {
        console.log(`Tümü kategorisi seçili, tüm kategoriler gösteriliyor (${eventsWithDistance.length} etkinlik)`);
      }
    }

    setFilteredEvents(eventsWithDistance);
    console.log(
      `Toplam ${eventsWithDistance.length} etkinlik filtreleme sonrası görüntüleniyor`
    );
  }, [activeTab, selectedCategory, distanceFilter, eventData, userCoordinates]);

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

  const handleMapFilterChange = (newCategory: string, newDistance: number) => {
    console.log(
      `Harita üzerinden filtre değişti: Kategori="${newCategory}", Mesafe=${newDistance}km`
    );

    // Kategori bilgisini kontrol et ve doğrula
    const validCategory =
      sportCategories.find((c) => c.name === newCategory)?.name || "Tümü";
    if (validCategory !== newCategory) {
      console.log(
        `Geçersiz kategori: "${newCategory}", geçerli kategori "${validCategory}" kullanılıyor`
      );
    }

    // State'leri güncelle
    setDistanceFilter(newDistance);
    setSelectedCategory(validCategory);

    // Filtreleme yapılacak (filtreleme değerleri değiştiğinde useEffect tarafından tetiklenir)
    console.log(
      `Filtreleme değerleri güncellendi: kategori=${validCategory}, mesafe=${newDistance}km`
    );
  };

  // Spor tesisleri görünümünü değiştirmek için yeni fonksiyon
  const togglePOI = () => {
    setShowPOI((prev) => !prev);
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
        {activeTab === "nearby" && (
          <CategorySelector
            categories={sportCategories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
          />
        )}

        {/* Map View */}
        <View style={styles.mapContainer}>
          <EventMap
            userLocation={isLocationLoading ? userLocation : userCoordinates}
            events={filteredEvents.map((event) => ({
              id: event.id,
              title: event.title,
              coordinates: event.coordinates,
              category: event.category,
            }))}
            onMarkerPress={handleEventPress}
            activeTab={activeTab}
            onFilterChange={handleMapFilterChange}
            selectedCategory={selectedCategory}
            distanceFilter={distanceFilter}
            showPOI={showPOI}
          />
        </View>

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
            filteredEvents.map((event) => {
              // Kategori rengini belirle
              const categoryColor =
                theme.categoryColors[
                  event.category as keyof typeof theme.categoryColors
                ] || theme.primaryDark;

              return (
                <TouchableOpacity
                  key={event.id}
                  style={styles.eventCard}
                  onPress={() => handleEventPress(event.id)}
                >
                  {/* Renk göstergesi */}
                  <View
                    style={[
                      styles.eventIndicator,
                      { backgroundColor: categoryColor },
                    ]}
                  />

                  <View
                    style={[styles.dateBox, { backgroundColor: categoryColor }]}
                  >
                    <Text style={styles.dayNumber}>
                      {event.date.split(" ")[0]}
                    </Text>
                    <Text style={styles.monthName}>Eki</Text>
                  </View>

                  <View style={styles.eventDetails}>
                    <View style={styles.eventTimeContainer}>
                      <Text style={styles.eventTime}>{event.time}</Text>
                      <View
                        style={[
                          styles.organizerBadge,
                          { backgroundColor: `${categoryColor}20` },
                        ]}
                      >
                        <Text
                          style={[
                            styles.organizerBadgeText,
                            { color: categoryColor },
                          ]}
                        >
                          {event.organizer.name}
                        </Text>
                        {event.organizer.isVerified && (
                          <CheckCircle
                            size={12}
                            color={categoryColor}
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
                      {/* Kategori etiketi ekle */}
                      <View
                        style={[
                          styles.typeTag,
                          { backgroundColor: `${categoryColor}20` },
                        ]}
                      >
                        <Text
                          style={[styles.typeTagText, { color: categoryColor }]}
                        >
                          {event.category}
                        </Text>
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

                      {/* Katılımcı avatarlarını göster */}
                      <View style={styles.participantAvatars}>
                        {event.participants.slice(0, 2).map((avatar, idx) => (
                          <Image
                            key={idx}
                            source={{ uri: avatar }}
                            style={[
                              styles.participantAvatar,
                              { marginLeft: idx > 0 ? -8 : 0 },
                            ]}
                          />
                        ))}
                        {event.participantCount > 2 && (
                          <View
                            style={[
                              styles.moreParticipants,
                              {
                                backgroundColor: `${categoryColor}20`,
                                borderColor: `${categoryColor}40`,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.moreParticipantsText,
                                { color: categoryColor },
                              ]}
                            >
                              +{event.participantCount - 2}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Eğer etkinliğe katılındıysa işaret göster */}
                    {event.isJoined && (
                      <View
                        style={[
                          styles.joinedIndicator,
                          { backgroundColor: categoryColor },
                        ]}
                      >
                        <CheckCircle size={14} color="#fff" />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      <CreateEventButton onPress={handleCreateEvent} />
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.6)",
    position: "relative",
  },
  dateBox: {
    width: 65,
    backgroundColor: "#1E1E1E",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 10,
    marginRight: -5,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 2,
    borderColor: "white",
  },
  dayNumber: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
  },
  monthName: {
    fontSize: 14,
    color: "white",
    opacity: 0.9,
  },
  eventDetails: {
    flex: 1,
    padding: 14,
    paddingLeft: 18,
  },
  eventTimeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  eventTime: {
    fontSize: 14,
    color: theme.textSecondary,
    fontWeight: "500",
    backgroundColor: "rgba(241, 245, 249, 0.5)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  organizerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  organizerBadgeText: {
    fontSize: 12,
    color: theme.primaryDark,
    fontWeight: "600",
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: theme.text,
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 8,
    lineHeight: 18,
  },
  tagContainer: {
    flexDirection: "row",
    marginBottom: 8,
    gap: 8,
  },
  typeTag: {
    backgroundColor: theme.primaryPale,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
    elevation: 1,
  },
  categoryTag: {
    backgroundColor: "rgba(255, 247, 237, 0.8)",
  },
  typeTagText: {
    fontSize: 12,
    color: theme.primaryDark,
    fontWeight: "600",
  },
  eventLocation: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    backgroundColor: "rgba(241, 245, 249, 0.5)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  locationText: {
    fontSize: 12,
    color: theme.textSecondary,
    fontWeight: "500",
  },
  eventFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    backgroundColor: "rgba(249, 250, 251, 0.7)",
    padding: 6,
    borderRadius: 8,
  },
  participantsInfo: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  participantsText: {
    fontSize: 12,
    color: theme.textSecondary,
    fontWeight: "500",
  },
  participantAvatars: {
    flexDirection: "row",
    alignItems: "center",
  },
  participantAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "white",
  },
  moreParticipants: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -8,
    borderWidth: 1,
    borderColor: "white",
  },
  moreParticipantsText: {
    fontSize: 10,
    color: theme.primaryDark,
    fontWeight: "700",
  },
  joinedIndicator: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: theme.primaryDark,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
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
  mapContainer: {
    marginVertical: 10,
  },
  poiToggleWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  poiToggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  poiToggleActive: {
    backgroundColor: "#ECFDF5",
    borderColor: "#34D399",
  },
  poiToggleText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  poiToggleTextActive: {
    color: "#10B981",
  },
  eventIndicator: {
    position: "absolute",
    top: 0,
    left: 60,
    width: 4,
    height: "100%",
    backgroundColor: theme.primaryDark,
  },
});
