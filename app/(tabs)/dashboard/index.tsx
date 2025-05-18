import {
  CategorySelector,
  DateSelector,
  EventMap,
  Header,
  TabSelector,
  SimpleDistanceSlider,
} from "@/components/dashboard";
import * as Location from "expo-location";
import { router } from "expo-router";
import { CheckCircle, MapPin, Users, Plus } from "lucide-react-native";
import React, { useCallback, useEffect, useState, useRef } from "react";
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
  StatusBar as RNStatusBar,
  PermissionsAndroid,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { HStack } from "@/components/ui/hstack";
import CreateEventButton from "@/components/dashboard/CreateEventButton";
import { Event as ApiEvent, eventsApi } from "../../../services/api/events";
import { showToast } from "../../../src/utils/toastHelper";
import { Sport, sportsApi } from "../../../services/api/sports";
import { logDetailedEvent, eventMatchesSportId } from "../../../src/utils/loggingUtils";
import { useMessages } from "@/src/contexts/MessageContext";
import { StatusBar } from 'expo-status-bar';

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
    "Diğer": "#64748B", // Gri (Diğer kategorisi için)
    "Yürüyüş": "#10B981", // Yeşil
  },
};

// Geçici kullanıcı verileri
const userData = {
  name: "Özgür Eren",
  avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg",
  isPro: true,
  unreadMessages: 5, // Okunmamış mesaj sayısı eklendi
};

// Kullanıcının mevcut konumu - başlangıçta boş, gerçek konum Location API'dan alınacak
const initialLocation = {
  latitude: 0,
  longitude: 0,
};

// Konya'daki farklı lokasyonlar için etkinlikler - ARTIK KULLANILMIYOR (API'den gerçek veriler geliyor)
// SILINDI: nearbyLocations array

// Mesafe hesaplama fonksiyonu (Haversine formülü) - km cinsinden mesafe döndürür
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  // Early validation to prevent NaN results
  if (!lat1 || !lon1 || !lat2 || !lon2 || 
      isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
    console.log(`Geçersiz koordinatlar - mesafe hesaplanamıyor: (${lat1}, ${lon1}) ve (${lat2}, ${lon2})`);
    return 9999; // Geçersiz koordinat için büyük bir değer döndür (filtrelemede kullanılacak)
  }

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

// Event tipi tanımlama - UI için kullanılacak
interface Event {
  id: string;
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
  participantCount: number;
  maxParticipants: number;
  isJoined: boolean;
  organizer: {
    id: string;
    name: string;
    isVerified: boolean;
  };
  description: string;
  calculatedDistance?: number;
}

// Spor kategorileri veri seti - artık API'den alınacak
const defaultSportCategories = [
  { id: 0, name: "Tümü", icon: "🏆" },
];

// Haftanın günleri
const daysOfWeek = ["Pzr", "Pzt", "Sal", "Çrş", "Per", "Cum", "Cmt"];

export default function DashboardScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [eventData, setEventData] = useState<Event[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [selectedSportId, setSelectedSportId] = useState<number | null>(null);
  const [distanceFilter, setDistanceFilter] = useState(10);
  const [activeTab, setActiveTab] = useState("nearby");
  const [userCoordinates, setUserCoordinates] = useState(initialLocation);
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [showPOI, setShowPOI] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sportCategories, setSportCategories] = useState(defaultSportCategories);
  const [sportCategoriesLoading, setSportCategoriesLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstLoad = useRef(true);
  const prevActiveTabRef = useRef(activeTab);

  // Ay ve gün için geçici hesaplamalar
  const currentMonth = new Intl.DateTimeFormat("tr-TR", {
    month: "long",
  }).format(selectedDate);
  const currentDay = selectedDate.getDate();

  // Get unread message count from context with safety
  const getUnreadCount = () => {
    try {
      return useMessages().unreadCount;
    } catch (error) {
      console.warn('Could not access message context:', error);
      return userData.unreadMessages;
    }
  };

  const unreadMessages = getUnreadCount();

  // Fetch sport categories from API
  useEffect(() => {
    const fetchSportCategories = async () => {
      setSportCategoriesLoading(true);
      try {
        console.log("Fetching sport categories from API...");
        const sports = await sportsApi.getAllSports();
        
        if (Array.isArray(sports)) {
          // Add "Tümü" (All) category at the beginning
          const allCategories = [
            { id: 0, name: "Tümü", icon: "🏆" }, 
            ...sports
          ];
          
          console.log(`Retrieved ${sports.length} sport categories from API`);
          setSportCategories(allCategories);
        } else {
          console.error("API returned invalid sports data:", sports);
          // Keep default categories
        }
      } catch (error) {
        console.error("Error fetching sport categories:", error);
        showToast("Spor kategorileri yüklenemedi", "error");
      } finally {
        setSportCategoriesLoading(false);
      }
    };
    
    fetchSportCategories();
  }, []);

  // Update distance filter
  const handleDistanceFilterChange = (distance: number) => {
    if (distance !== distanceFilter) {
      console.log(`Distance filter changed: ${distanceFilter}km → ${distance}km`);
      
      // Set loading state first for UI feedback
      setIsLoading(true);
      
      // Immediately clear existing filtered events to prevent showing irrelevant results
      setFilteredEvents([]);
      
      // Update the UI state
      setDistanceFilter(distance);
      
      // API calls will be handled by the dependency effect
      // Use a small timeout to let the loading state render first
      setTimeout(() => {
        fetchEvents();
      }, 100);
    }
  };

  const handleTabChange = (tab: string) => {
    console.log(`Tab değişimi: ${activeTab} -> ${tab}`);
    
    // Immediately set loading state
    setIsLoading(true);
    
    // Clear existing events when switching tabs to avoid showing stale data
    setFilteredEvents([]);
    setEventData([]);
    
    // Update the active tab
    setActiveTab(tab);
    
    // Force a fetch of new events with a slight delay
    setTimeout(() => {
      fetchEvents();
    }, 100);
  };

  const handleNearbyPress = () => {
    setActiveTab("nearby");
    // API çağrısı useEffect tarafından yapılacak
  };

  const handleDateSelect = (date: Date) => {
    // Immediately set loading state to prevent showing old data
    setIsLoading(true);
    
    // Clear existing events lists immediately
    setFilteredEvents([]);
    setEventData([]);
    
    // Update the selected date
    setSelectedDate(date);
    
    // Log for debugging
    const dateStr = formatDateToString(date);
    console.log(`Selected date: ${dateStr}`);
    
    // Fetch events for the selected date with small delay
    setTimeout(() => {
      fetchEvents();
    }, 100);
  };

  // Initialize the view to always start from today
  useEffect(() => {
    // Make sure we always start from today when app first loads
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (isFirstLoad.current) {
      setSelectedDate(today);
      isFirstLoad.current = false;
      
      // We don't need to fetch events here as the dependency effect will handle it
    }
  }, []);

  const handleCategorySelect = (category: string) => {
    console.log(`Kategori seçildi: ${category}`);
    
    // Immediately set loading state
    setIsLoading(true);
    
    // Clear existing events to avoid showing irrelevant data during transition
    setFilteredEvents([]);
    setEventData([]);
    
    // Update category state
    setSelectedCategory(category);
    
    // Find the corresponding sport ID
    if (category === "Tümü") {
      setSelectedSportId(null);
      console.log("Tüm kategoriler seçildi, sportId=null");
    } else {
      const selectedSport = sportCategories.find(sport => sport.name === category);
      if (selectedSport) {
        setSelectedSportId(selectedSport.id);
        console.log(`Kategori ID: ${selectedSport.id} (${category})`);
      } else {
        console.warn(`Kategori bulunamadı: ${category}`);
        setSelectedSportId(null);
      }
    }
    // API çağrısı useEffect tarafından yapılacak
  };

  // Kullanıcının konumunu alma
  useEffect(() => {
    // Expo Location API'ını kullanarak gerçek konumu al
    (async () => {
      try {
        setIsLocationLoading(true);
        console.log("Konum izni isteniyor...");
        
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.log("Konum izni verilmedi, etkinlik konumları gösterilemeyebilir");
          showToast("Konum izni verilmedi. Bazı özellikler çalışmayabilir.", "warning");
          setIsLocationLoading(false);
          return;
        }

        console.log("Konum izni verildi, mevcut konum alınıyor...");
        
        // Gerçek konum bilgisini al
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High
        });
        
        console.log("Konum başarıyla alındı:", {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude
        });
        
        // Hemen koordinatları güncelle ve etkinlikleri getirmeye başla
        setUserCoordinates({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude
        });

        setIsLocationLoading(false);
        // API çağrısı ana useEffect tarafından yapılacak
      } catch (error) {
        console.error("Konum alınamadı:", error);
        showToast("Konum alınamadı. Lütfen konum servislerinizi kontrol edin.", "error");
        setIsLocationLoading(false);
      }
    })();
  }, []);

  // Tüm filtre değişikliklerini takip et
  useEffect(() => {
    if (!isLocationLoading && userCoordinates.latitude && userCoordinates.longitude) {
      console.log("Bağımlılıklar değişti, etkinlikleri yeniden getiriyorum:");
      console.log(`- Tab: ${activeTab}`);
      console.log(`- Mesafe: ${distanceFilter}km`);
      console.log(`- Kategori: ${selectedCategory}${selectedSportId ? ` (ID: ${selectedSportId})` : ''}`);
      
      // Tarih formatını YYYY-MM-DD'ye çevir (loglama için)
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      console.log(`- Tarih: ${formattedDate}`);
      console.log(`- Konum: ${userCoordinates.latitude.toFixed(6)}, ${userCoordinates.longitude.toFixed(6)}`);
      
      // Clear any pending debounced operation
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      // Set a loading state only for initial load or tab changes
      // for other filter changes, we'll keep showing existing data until new data arrives
      if (isFirstLoad.current || prevActiveTabRef.current !== activeTab) {
        setIsLoading(true);
      }
      
      // Use different delay for different types of filter changes
      // - Quick update for tab changes
      // - Moderate delay for minor filter adjustments (distance, category)
      const delay = isFirstLoad.current || prevActiveTabRef.current !== activeTab ? 0 : 300;
      
      isFirstLoad.current = false;
      prevActiveTabRef.current = activeTab;
      
      debounceTimerRef.current = setTimeout(() => {
        fetchEvents();
      }, delay);
    }
  }, [activeTab, selectedSportId, distanceFilter, selectedDate, userCoordinates, isLocationLoading]);

  // Harita üzerinden filtreleme değişikliği
  const handleMapFilterChange = (newCategory: string, newDistance: number) => {
    // Track if we need to fetch new data
    let shouldFetchEvents = false;
    
    // Only log significant changes
    if (newDistance !== distanceFilter || newCategory !== selectedCategory) {
      console.log(`Harita filtresi değişti: Kategori="${newCategory}", Mesafe=${newDistance}km`);
      
      // Immediately show loading state
      setIsLoading(true);
      
      // Clear current results to prevent flickering of irrelevant data
      setFilteredEvents([]);
    }
    
    // Update distance if changed
    if (newDistance !== distanceFilter) {
      setDistanceFilter(newDistance);
      shouldFetchEvents = true;
    }
    
    // Update category if changed
    if (newCategory !== selectedCategory) {
      // Find the corresponding sport ID
      if (newCategory === "Tümü") {
        setSelectedSportId(null);
      } else {
        const category = sportCategories.find(cat => cat.name === newCategory);
        if (category) {
          setSelectedSportId(category.id);
        }
      }
      setSelectedCategory(newCategory);
      shouldFetchEvents = true;
    }
    
    // Only fetch events if necessary
    if (shouldFetchEvents) {
      // Clear existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      // Fetch events after a short delay
      debounceTimerRef.current = setTimeout(() => {
        fetchEvents();
      }, 100);
    }
  };

  // API'dan etkinlikleri getir
  const fetchEvents = async () => {
    if (isLocationLoading) {
      console.log("Konum yükleniyor, etkinlikler getirilemedi");
      return;
    }
    
    // Koordinat kontrolü
    if (!userCoordinates.latitude || !userCoordinates.longitude) {
      console.log("Geçerli koordinatlar yok, etkinlikler getirilemedi");
      showToast("Konum bilgisi alınamadı. Lütfen konum izinlerini kontrol edin.", "error");
      return;
    }

    setIsLoading(true);
    try {
      console.log(`Etkinlikler getiriliyor... Tab: ${activeTab}`);
      console.log(`Konum bilgisi: lat=${userCoordinates.latitude}, lng=${userCoordinates.longitude}`);
      
      // Ensure date is a valid Date object first
      let dateToUse = selectedDate;
      if (!(dateToUse instanceof Date) || isNaN(dateToUse.getTime())) {
        console.error("Invalid date:", dateToUse);
        // Use today's date as fallback
        dateToUse = new Date();
      }
      
      // Format date as required by API (YYYY-MM-DD) using our helper
      const formattedDate = formatDateToString(dateToUse);
      
      console.log(`Filtre bilgileri: Tarih=${formattedDate}, Kategori=${selectedCategory}, Mesafe=${distanceFilter}km`);
      
      // Ek parametreler
      const additionalParams: Record<string, any> = {
        date: formattedDate // Tarih filtresi - Bu parametre adı backend API ile eşleşmeli
      };
      
      // Kategori filtresi ekle (Tümü değilse)
      if (selectedSportId) {
        additionalParams.sport_id = selectedSportId;
        console.log(`Kategori filtresi: ${selectedCategory} (ID: ${selectedSportId})`);
      }
      
      if (activeTab === "nearby") {
        // Yakındaki etkinlikleri getir
        console.log(`Yakındaki etkinlikler için API isteği: lat=${userCoordinates.latitude}, lng=${userCoordinates.longitude}, mesafe=${distanceFilter}km`);
        
        const events = await eventsApi.getNearbyEvents(
          userCoordinates.latitude,
          userCoordinates.longitude,
          distanceFilter, // Kullanıcının seçtiği mesafeyi doğrudan API'ye gönder
          1,
          50,
          additionalParams
        );
        
        // Debug için orijinal API yanıtını ayrıntılı incele
        if (events && events.length > 0) {
          console.log('***** DETAYLI API YANITI *****');
          console.log(`API ${events.length} etkinlik buldu, işleniyor...`);
          
          // İlk etkinliğin tam içeriğini ayrıntılı logla
          const firstEvent = events[0];
          logDetailedEvent(firstEvent);
          
          // Log tarihleri kontrol etmek için
          console.log("Etkinlik tarihleri kontrolü:");
          events.forEach((event: ApiEvent, index: number) => {
            console.log(`Etkinlik #${index+1} (ID: ${event.id}): ${event.event_date}, Başlık: ${event.title}`);
          });
          console.log(`Seçili tarih: ${formattedDate}`);
          
          // Koordinat formatı kontrolü
          const hasLatLong = 'location_lat' in firstEvent && 'location_long' in firstEvent;
          const hasLatitudeLongitude = 'location_latitude' in firstEvent && 'location_longitude' in firstEvent;
          
          console.log(`Konum formatı: ${hasLatLong ? 'location_lat/long' : (hasLatitudeLongitude ? 'location_latitude/longitude' : 'bilinmeyen')}`);
          
          if (hasLatLong) {
            console.log(`location_lat: ${firstEvent.location_lat}, Tipi: ${typeof firstEvent.location_lat}`);
            console.log(`location_long: ${firstEvent.location_long}, Tipi: ${typeof firstEvent.location_long}`);
          } else if (hasLatitudeLongitude) {
            const firstEventAny = firstEvent as any;
            console.log(`location_latitude: ${firstEventAny.location_latitude}, Tipi: ${typeof firstEventAny.location_latitude}`);
            console.log(`location_longitude: ${firstEventAny.location_longitude}, Tipi: ${typeof firstEventAny.location_longitude}`);
            
            // Tüm etkinliklere standart format ile koordinat ekle
            events.forEach((event: ApiEvent) => {
              const eventAny = event as any;
              if (eventAny.location_latitude && eventAny.location_longitude) {
                // @ts-ignore - Dinamik alan ekleme
                event.location_lat = Number(eventAny.location_latitude);
                // @ts-ignore - Dinamik alan ekleme
                event.location_long = Number(eventAny.location_longitude);
              }
            });
            
            console.log('Etkinlikler standart koordinat formatına dönüştürüldü');
          } else {
            console.log('Etkinlik koordinatları eksik, manuel olarak güncelleniyor...');
            const manualCoordinates = {
              latitude: 38.0089744,  // Konya
              longitude: 32.5217585  // Konya
            };
            
            // Tüm etkinliklere koordinat ekle
            events.forEach((event: ApiEvent) => {
              // @ts-ignore - Dinamik alan ekleme
              event.location_lat = manualCoordinates.latitude;
              // @ts-ignore - Dinamik alan ekleme
              event.location_long = manualCoordinates.longitude;
            });
            
            console.log('Etkinlikler güncellenmiş koordinatlarla kaydedildi');
          }
          
          // API yanıtını UI formatına dönüştür - Artık backend filtrelemesi kullanıldığı için
          // frontend'de tekrar sport_id ve event_date filtrelemeleri yapmıyoruz
          const mappedEvents = mapApiEventsToUIEvents(events);
          
          // Sort events by distance (closest first)
          const sortedEvents = [...mappedEvents].sort((a, b) => {
            const distA = typeof a.calculatedDistance === 'number' && !isNaN(a.calculatedDistance) 
              ? a.calculatedDistance 
              : 9999;
            const distB = typeof b.calculatedDistance === 'number' && !isNaN(b.calculatedDistance) 
              ? b.calculatedDistance 
              : 9999;
            
            return distA - distB;
          });
          
          setEventData(sortedEvents);
          setFilteredEvents(sortedEvents); // Doğrudan göster
          
          console.log(`${sortedEvents.length} etkinlik başarıyla işlendi ve mesafeye göre sıralandı`);
        } else {
          console.log("API'den etkinlik bulunamadı");
          setEventData([]);
          setFilteredEvents([]);
        }
      } 
      else if (activeTab === "joined") {
        // Katıldığım etkinlikleri getir - sadece ACTIVE durumundakiler
        console.log("Katıldığım ACTIVE etkinlikler için API isteği yapılıyor");
        
        // ACTIVE parametresini ekle (sadece aktif etkinlikleri göster)
        const status = "ACTIVE";
        
        const events = await eventsApi.getUserParticipatedEvents(1, 50, status);
        
        if (events && events.length > 0) {
          console.log(`API ${events.length} aktif katılınan etkinlik buldu`);
          
          // API yanıtını UI formatına dönüştür
          let mappedEvents = mapApiEventsToUIEvents(events);
          
          // Backend date parameter desteği olmadığı için burada client-side tarih filtreleme yapıyoruz
          if (formattedDate) {
            console.log(`Client-side tarih filtrelemesi uygulanıyor: ${formattedDate}`);
            
            // Tarih formatını kontrol et ve eşleştir
            mappedEvents = mappedEvents.filter(event => {
              // Etkinlik tarihini al (API event verisinden)
              const apiEvent = events.find((e: ApiEvent) => e.id === event.id);
              if (!apiEvent || !apiEvent.event_date) return false;
              
              // Etkinlik tarihini Date nesnesine çevir
              const eventDate = new Date(apiEvent.event_date);
              if (isNaN(eventDate.getTime())) return false;
              
              // Tarih karşılaştırması için YYYY-MM-DD formatında string'e çevir
              const eventDateStr = formatDateToString(eventDate);
              
              // Tarihler eşleşiyor mu kontrol et
              const isMatch = eventDateStr === formattedDate;
              console.log(`Etkinlik: ${event.title}, Tarih: ${eventDateStr}, Seçili Tarih: ${formattedDate}, Eşleşme: ${isMatch ? 'Evet' : 'Hayır'}`);
              
              return isMatch;
            });
            
            console.log(`Tarih filtrelemesi sonrası ${mappedEvents.length} etkinlik görüntüleniyor`);
          } else {
            console.log("Tarih filtresi yok, tüm etkinlikler gösteriliyor");
          }
          
          setEventData(mappedEvents);
          setFilteredEvents(mappedEvents); // Doğrudan göster
        } else {
          console.log("Katılınan aktif etkinlik bulunamadı");
          setEventData([]);
          setFilteredEvents([]);
        }
      }
    } catch (error) {
      console.error("Etkinlikler getirilirken hata oluştu:", error);
      showToast("Etkinlikler yüklenirken bir sorun oluştu", "error");
      setEventData([]);
      setFilteredEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  // API yanıtını UI formatına dönüştür
  const mapApiEventsToUIEvents = (apiEvents: ApiEvent[]): Event[] => {
    if (!Array.isArray(apiEvents)) {
      console.log("API yanıtı bir dizi değil:", apiEvents);
      return [];
    }
    
    // Format the selected date for comparison with event dates
    const formattedSelectedDate = formatDateToString(selectedDate);
    console.log(`Seçili tarih için filtreleme: ${formattedSelectedDate}`);
    
    // Check if we should be strict with date filtering
    // We will always apply date filtering from the backend
    // The shouldFilterByDate flag is removed since we handle this on the server side
    
    console.log(`API'den gelen ${apiEvents.length} etkinlik gösteriliyor. Tarih filtresi backend tarafından uygulandı.`);
    
    return apiEvents.map(event => {
      // Tarihi biçimlendir
      const eventDate = new Date(event.event_date);
      const day = eventDate.getDate();
      const month = new Intl.DateTimeFormat('tr-TR', { month: 'long' }).format(eventDate);
      
      // Zamanı biçimlendir
      const startTime = new Date(event.start_time).toLocaleTimeString('tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      const endTime = new Date(event.end_time).toLocaleTimeString('tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      // Koordinat validasyonu
      // Farklı API yanıtlarında farklı koordinat alanları olabilir (location_lat veya location_latitude)
      const defaultLat = 38.0089744; // Varsayılan enlem (Konya)
      const defaultLng = 32.5217585; // Varsayılan boylam (Konya)
      
      // Farklı olası alan adlarını kontrol et - TypeScript uyumlu
      const eventAny = event as any; // Geçici tip dönüşümü yaparak erişim sağla
      
      const latitude = 
        ('location_lat' in event) ? Number(event.location_lat) :
        ('location_latitude' in eventAny) ? Number(eventAny.location_latitude) : 
        defaultLat;
        
      const longitude = 
        ('location_long' in event) ? Number(event.location_long) :
        ('location_longitude' in eventAny) ? Number(eventAny.location_longitude) : 
        defaultLng;
      
      // Log for debugging
      console.log(`[Event ${event.id}] Koordinatlar: ${latitude}, ${longitude} (${isNaN(latitude) || isNaN(longitude) ? 'Geçersiz' : 'Geçerli'})`);
      
      // Mesafeyi hesapla - geçersiz koordinatlar için 0 uzaklık
      let distance = 0;
      if (!isNaN(latitude) && !isNaN(longitude)) {
        distance = calculateDistance(
          userCoordinates.latitude,
          userCoordinates.longitude,
          latitude,
          longitude
        );
        console.log(`[Event ${event.id}] Mesafe: ${distance.toFixed(1)}km`);
      } else {
        console.log(`[Event ${event.id}] Geçersiz koordinatlar nedeniyle mesafe hesaplanamadı`);
      }
      
      // Spor bilgisini güvenli şekilde çıkar
      let sportName = "Diğer";
      
      // API yanıtında farklı spor alan adları olabilir
      if (eventAny.sport && typeof eventAny.sport === 'object' && 'name' in eventAny.sport) {
        // sport: {id: 6, icon: "🎾", name: "Tenis"} formatı
        sportName = eventAny.sport.name;
      } else if (eventAny.Sports && typeof eventAny.Sports === 'object' && 'name' in eventAny.Sports) {
        // Sports: {id: 6, icon: "🎾", name: "Tenis"} formatı
        sportName = eventAny.Sports.name;
      } else if (event.sport_name) {
        // Doğrudan sport_name alanı
        sportName = event.sport_name;
      }

      // Spor kategorisini mevcut sportCategories listesindeki adlar ile eşleştir
      // Bu, UI tutarlılığını sağlar
      const matchedSport = sportCategories.find(
        (cat) => cat.name.toLowerCase() === sportName.toLowerCase()
      );
      
      const finalSportName = matchedSport ? matchedSport.name : sportName;
      console.log(`[Event ${event.id}] Spor kategorisi: ${finalSportName} (Orijinal: ${sportName})`);
      
      // Oluşturucu bilgisini güvenli şekilde çıkar
      let creatorName = "İsimsiz";
      
      // API yanıtında farklı creator alan adları olabilir
      if (eventAny.creator && typeof eventAny.creator === 'object') {
        if ('first_name' in eventAny.creator && 'last_name' in eventAny.creator) {
          creatorName = `${eventAny.creator.first_name} ${eventAny.creator.last_name}`;
        } else if ('full_name' in eventAny.creator) {
          creatorName = eventAny.creator.full_name;
        }
      } else if (eventAny.users && typeof eventAny.users === 'object') {
        if ('first_name' in eventAny.users && 'last_name' in eventAny.users) {
          creatorName = `${eventAny.users.first_name} ${eventAny.users.last_name}`;
        }
      } else if (event.creator_name) {
        creatorName = event.creator_name;
      }
      
      console.log(`[Event ${event.id}] Oluşturucu: ${creatorName}`);
      
      return {
        id: event.id,
        title: event.title,
        type: "Etkinlik",
        category: finalSportName,
        date: `${day} ${month}`,
        time: `${startTime}-${endTime}`,
        location: event.location_name || "Konum bilgisi yok",
        coordinates: {
          latitude, 
          longitude
        },
        distance: `${distance.toFixed(1)} km`,
        participantCount: event.participant_count || 0,
        maxParticipants: event.max_participants || 10,
        isJoined: event.user_joined || false,
        organizer: {
          id: event.creator_id || "",
          name: creatorName,
          isVerified: true
        },
        description: event.description || "",
        calculatedDistance: distance
      };
    });
  };

  // Helper function to format a date object to YYYY-MM-DD string
  const formatDateToString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Generate dates for horizontal day scrolling (30 days from today)
  const getDaysInWeek = () => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for accurate comparison
    
    // Create array of 30 days starting from today
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      days.push({
        dayName: daysOfWeek[date.getDay()],
        dayNumber: date.getDate(),
        date: date,
        isToday: i === 0, // First day is today
        isSelected: date.toDateString() === selectedDate.toDateString(),
      });
    }
    
    return days;
  };

  const days = getDaysInWeek();

  const handleJoinEvent = async (eventId: string) => {
    try {
      const currentEvent = eventData.find(e => e.id === eventId);
      const isJoined = currentEvent?.isJoined;
      
      if (isJoined) {
        // Etkinlikten ayrıl
        await eventsApi.leaveEvent(eventId);
        showToast("Etkinlikten ayrıldınız", "success");
      } else {
        // Etkinliğe katıl
        await eventsApi.joinEvent(eventId);
        showToast("Etkinliğe katıldınız", "success");
      }
      
      // Etkinlikleri yenile
      fetchEvents();
    } catch (error) {
      console.error("Etkinliğe katılırken/ayrılırken hata oluştu:", error);
      showToast("İşlem sırasında bir hata oluştu", "error");
    }
  };

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
    
    // Seçili kategori kontrol ediliyor
    if (selectedCategory !== "Tümü" && !eventCategories.includes(selectedCategory)) {
      console.log(`UYARI: Seçili kategori '${selectedCategory}' API'den dönen kategoriler arasında bulunamadı`);
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
  }, [activeTab, selectedCategory, distanceFilter, isLocationLoading, selectedDate]);

  // Tab değişiminde event'lerin görüntülenmesi için ek bir güvenlik önlemi
  useEffect(() => {
    if (
      activeTab === "nearby" &&
      filteredEvents.length === 0 &&
      !isLocationLoading
    ) {
      console.log(
        `Yakındakiler sekmesinde etkinlik bulunamadı - Tüm etkinlikler yükleniyor`
      );
      
      // Yakındakiler için - Mesafeye bakılmaksızın tüm etkinlikleri göster
      setFilteredEvents(eventData);
    }
  }, [activeTab, filteredEvents.length, isLocationLoading, eventData]);

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

    // Mesafe hesaplama - gerekli, çünkü mesafenin UI'da gösterilmesi gerekiyor
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

    // Backend filtrelemeyi kullandığımız için, sadece mesafe bilgisi ve sıralama işlemi yapıyoruz
    // Mesafeye göre sıralama yap
    eventsWithDistance = eventsWithDistance.sort((a, b) => {
      const distA = a.calculatedDistance || 9999;
      const distB = b.calculatedDistance || 9999;
      return distA - distB;
    });

    // Mesafe bilgisini günlük
    if (activeTab === "nearby" && eventsWithDistance.length > 0) {
      eventsWithDistance.forEach(event => {
        const calculatedDistance = event.calculatedDistance || 0;
        console.log(
          `Etkinlik: ${event.title}, Mesafe: ${calculatedDistance.toFixed(1)} km, Filtre: ${distanceFilter} km, Eşleşme: ${
            calculatedDistance <= distanceFilter ? "Evet" : "Hayır"
          }`
        );
      });
    }

    // Filtreleme uygulanıyor
    let filteredResult = [...eventsWithDistance];

    // Kategori filtrelemesi
    if (selectedCategory !== "Tümü") {
      filteredResult = filteredResult.filter(
        (event) => event.category === selectedCategory
      );
      console.log(`Kategori filtrelemesi sonrası ${filteredResult.length} etkinlik`);
    }

    // Mesafe filtrelemesi
    filteredResult = filteredResult.filter(
      (event) => (event.calculatedDistance || 0) <= distanceFilter
    );
    console.log(`Mesafe filtrelemesi sonrası ${filteredResult.length} etkinlik`);

    // Sonuçları güncelle
    console.log(`Toplam ${filteredResult.length} etkinlik filtreleme sonrası görüntüleniyor`);
    setFilteredEvents(filteredResult);
  }, [activeTab, distanceFilter, eventData, userCoordinates, selectedCategory]);

  const handleCreateEvent = () => {
    router.push("/event-form");
  };

  const handleEventPress = (eventId: string | number) => {
    // Convert to string if number
    const id = typeof eventId === "number" ? eventId.toString() : eventId;
    
    // Navigate to event details
    router.push({
      pathname: "event-details/[id]",
      params: { id },
    });
  };

  // Spor tesisleri görünümünü değiştirmek için yeni fonksiyon
  const togglePOI = () => {
    setShowPOI((prev) => !prev);
  };

  // Render map with filters
  const renderMap = () => {
    // Eğer konum yükleniyor ise loading göster
    if (isLocationLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Konum alınıyor...</Text>
        </View>
      );
    }
    
    // Geçerli koordinat kontrolü - 0,0 veya null/undefined koordinatlar geçersiz
    const hasValidCoordinates = 
      userCoordinates && 
      typeof userCoordinates.latitude === 'number' &&
      typeof userCoordinates.longitude === 'number' &&
      (userCoordinates.latitude !== 0 || userCoordinates.longitude !== 0) &&
      !isNaN(userCoordinates.latitude) && 
      !isNaN(userCoordinates.longitude);
    
    if (!hasValidCoordinates) {
      console.error("Geçersiz kullanıcı koordinatları:", userCoordinates);
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            Konum bilgisi alınamadı. Lütfen konum izinlerini kontrol edin.
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              // Konumu tekrar almayı dene
              setIsLocationLoading(true);
              Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High
              }).then(location => {
                console.log("Yeni konum alındı:", location.coords);
                setUserCoordinates({
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude
                });
                setIsLocationLoading(false);
                fetchEvents();
              }).catch(error => {
                console.error("Konum tekrar alınamadı:", error);
                setIsLocationLoading(false);
              });
            }}
          >
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Etkinlikler yükleniyor...</Text>
        </View>
      );
    }
    
    // Harita için geçerli etkinlikleri hazırla
    const mapEvents = filteredEvents.map((event, index) => ({
      id: Number(event.id),
      title: event.title,
      coordinates: event.coordinates,
      category: event.category,
    }));
    
    // Return the map directly without additional wrapper
    return (
      <EventMap
        userLocation={userCoordinates}
        events={mapEvents}
        onMarkerPress={(eventId) => {
          handleEventPress(eventId.toString());
        }}
        activeTab={activeTab}
        distanceFilter={distanceFilter}
        showPOI={showPOI}
      />
    );
  };

  // Add create event button
  const renderCreateEventButton = () => {
    return (
      <TouchableOpacity
        style={styles.createEventButton}
        onPress={() => router.push('/dashboard/create-event')}
      >
        <HStack style={styles.createEventButtonContent}>
          <Plus size={24} color="#FFFFFF" />
          <Text style={styles.createEventButtonText}>Etkinlik Oluştur</Text>
        </HStack>
      </TouchableOpacity>
    );
  };

  // Handle refresh when pull-to-refresh is triggered
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    
    // Reset state as needed for a fresh load
    setFilteredEvents([]);
    setEventData([]);
    
    try {
      // Refresh location if needed
      if (userCoordinates.latitude === 0 || userCoordinates.longitude === 0) {
        console.log("Refreshing location data...");
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High
          });
          
          setUserCoordinates({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          });
          console.log("Location refreshed successfully");
        } catch (error) {
          console.error("Failed to refresh location:", error);
        }
      }
      
      // Refresh sport categories
      console.log("Refreshing sport categories...");
      try {
        const sports = await sportsApi.getAllSports();
        if (Array.isArray(sports)) {
          const allCategories = [
            { id: 0, name: "Tümü", icon: "🏆" }, 
            ...sports
          ];
          setSportCategories(allCategories);
          console.log("Sport categories refreshed successfully");
        }
      } catch (error) {
        console.error("Failed to refresh sport categories:", error);
      }
      
      // Fetch fresh event data
      console.log("Refreshing events data...");
      await fetchEvents();
      console.log("Events refreshed successfully");
      
    } catch (error) {
      console.error("Error during refresh:", error);
      showToast("Yenileme sırasında bir hata oluştu", "error");
    } finally {
      setRefreshing(false);
    }
  }, [userCoordinates.latitude, userCoordinates.longitude]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header with unread message count */}
      <Header unreadMessages={unreadMessages} />
      
      <View style={styles.headerWrapper}>
        <TabSelector activeTab={activeTab} onTabChange={handleTabChange} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.primary, theme.secondary]}
            tintColor={theme.primary}
            title="Yenileniyor..."
            titleColor={theme.textSecondary}
          />
        }
      >
        {/* Date Selector */}
        <DateSelector
          currentDay={selectedDate.getDate()}
          currentMonth={
            selectedDate.toLocaleString('tr-TR', { month: 'long', year: 'numeric' })
          }
          days={days}
          onDateSelect={handleDateSelect}
        />

        {/* Category Filter - keep visible for the "nearby" tab */}
        {activeTab === "nearby" && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {sportCategoriesLoading ? (
              <View style={styles.categoriesLoadingContainer}>
                <ActivityIndicator size="small" color={theme.primary} />
              </View>
            ) : (
              sportCategories.map((sport) => (
                <TouchableOpacity
                  key={sport.id}
                  style={[
                    styles.categoryButton,
                    selectedCategory === sport.name && styles.categoryButtonActive,
                  ]}
                  onPress={() => handleCategorySelect(sport.name)}
                >
                  {sport.icon && (
                    <Text style={styles.categoryIcon}>{sport.icon}</Text>
                  )}
                  <Text
                    style={[
                      styles.categoryButtonText,
                      selectedCategory === sport.name &&
                        styles.categoryButtonTextActive,
                    ]}
                  >
                    {sport.name}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        )}

        {/* Distance slider - separate from map to prevent refreshing issues */}
        {activeTab === "nearby" && (
          <SimpleDistanceSlider
            value={distanceFilter}
            onChange={handleDistanceFilterChange}
            min={1}
            max={50}
            step={5}
          />
        )}

        {/* No events message - with create button */}
        {!isLoading && filteredEvents.length === 0 ? (
          <View style={styles.noEventsCard}>
            <Text style={styles.noEventsCardTitle}>
              Etkinlik Bulunamadı
            </Text>
            <Text style={styles.noEventsCardText}>
              Seçilen filtrelere uygun etkinlik bulunamadı. Lütfen filtrelerinizi değiştirin veya yeni bir etkinlik oluşturun.
            </Text>
          </View>
        ) : (
          <>
            {/* Map Container (for "nearby" tab only) */}
            {activeTab === "nearby" && (
              <View style={styles.mapSection}>
                <View style={styles.sectionHeaderWithAction}>
                  <Text style={styles.sectionTitle}>Harita</Text>
                  <HStack style={styles.sectionActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, showPOI && styles.actionButtonActive]}
                      onPress={togglePOI}
                    >
                      <MapPin
                        size={18}
                        color={showPOI ? theme.primary : theme.textSecondary}
                        strokeWidth={2}
                      />
                      <Text style={[styles.actionButtonText, showPOI && styles.actionButtonTextActive]}>
                        Tesisler
                      </Text>
                    </TouchableOpacity>
                  </HStack>
                </View>
                <View style={styles.mapContainer}>
                  {renderMap()}
                </View>
              </View>
            )}

            {/* Events List */}
            {filteredEvents.length > 0 && (
              <View style={styles.eventsListContainer}>
                <View style={styles.sectionHeaderWithAction}>
                  <Text style={styles.sectionTitle}>Etkinlikler</Text>
                  <Text style={styles.eventCountText}>{filteredEvents.length} etkinlik</Text>
                </View>

                {isLoading ? (
                  <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 20 }} />
                ) : (
                  filteredEvents.map((event) => (
                    <TouchableOpacity
                      key={event.id}
                      style={styles.eventCard}
                      onPress={() => handleEventPress(event.id)}
                    >
                      <HStack style={styles.eventCardHeader}>
                        <View style={styles.eventDateBox}>
                          <Text style={styles.eventDate}>{event.date}</Text>
                        </View>

                        <View style={styles.eventDetailsBox}>
                          <Text style={styles.eventTitle}>{event.title}</Text>
                          <HStack style={styles.eventMeta}>
                            <HStack style={styles.eventMetaItem}>
                              <MapPin size={14} color={theme.textSecondary} />
                              <Text style={styles.eventMetaText}>
                                {event.distance}
                              </Text>
                            </HStack>
                            <HStack style={styles.eventMetaItem}>
                              <Users size={14} color={theme.textSecondary} />
                              <Text style={styles.eventMetaText}>
                                {event.participantCount}/{event.maxParticipants}
                              </Text>
                            </HStack>
                          </HStack>
                        </View>

                        <TouchableOpacity
                          style={[
                            styles.joinButton,
                            event.isJoined && styles.joinedButton,
                          ]}
                          onPress={() => handleJoinEvent(event.id)}
                        >
                          {event.isJoined ? (
                            <CheckCircle
                              size={18}
                              color="white"
                            />
                          ) : (
                            <Text style={styles.joinButtonText}>Katıl</Text>
                          )}
                        </TouchableOpacity>
                      </HStack>

                      <HStack style={styles.eventCardFooter}>
                        <View
                          style={[
                            styles.categoryTag,
                            {
                              backgroundColor:
                                theme.categoryColors[
                                  event.category as keyof typeof theme.categoryColors
                                ] || theme.secondary,
                            },
                          ]}
                        >
                          <Text style={styles.categoryTagText}>{event.category}</Text>
                        </View>
                        <Text style={styles.eventTime}>{event.time}</Text>
                      </HStack>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {renderCreateEventButton()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingTop: Platform.OS === "android" ? RNStatusBar.currentHeight || 0 : 0,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100, // Add extra padding at the bottom to account for tab bar
    flexGrow: 1,
  },
  headerWrapper: {
    backgroundColor: theme.background,
    paddingVertical: 5,
    paddingHorizontal: 10,
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  sectionActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
    padding: 12,
    width: '100%',
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
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
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
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 12,
    height: 300,
    width: '100%',
  },
  loadingText: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: "center",
    marginTop: 16,
  },
  noEventsContainer: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 12,
    minHeight: 250,
  },
  noEventsText: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: "center",
  },
  mapContainer: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: theme.background,
    marginTop: 8,
    borderWidth: 1,
    borderColor: theme.border,
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
  content: {
    flexGrow: 1,
  },
  eventsListContainer: {
    padding: 16,
    width: '100%',
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  actionButtonActive: {
    backgroundColor: "#ECFDF5",
    borderColor: "#22C55E",
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#64748B",
    marginLeft: 4,
  },
  actionButtonTextActive: {
    color: "#10B981",
    fontWeight: "600",
  },
  noEventsCard: {
    backgroundColor: "white",
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 16,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noEventsCardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.text,
    marginBottom: 16,
    textAlign: "center",
  },
  noEventsCardText: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  createEventButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#4F46E5',
    borderRadius: 30,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  createEventButtonContent: {
    alignItems: 'center',
    gap: 8,
  },
  createEventButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  eventCardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  eventDateBox: {
    width: 65,
    backgroundColor: "#1E1E1E",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 10,
    marginRight: 16,
  },
  eventDetailsBox: {
    flex: 1,
  },
  eventDate: {
    fontSize: 14,
    color: "white",
    fontWeight: "bold",
  },
  eventMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  eventMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  eventMetaText: {
    fontSize: 12,
    color: theme.textSecondary,
    fontWeight: "500",
    marginLeft: 4,
  },
  joinButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: theme.primary,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "white",
  },
  joinedButton: {
    backgroundColor: theme.primary,
  },
  eventCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  categoryTagText: {
    fontSize: 12,
    color: "white",
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: theme.primary,
    marginTop: 16,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "white",
  },
  categoriesLoadingContainer: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeaderWithAction: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  mapSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  eventCountText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#64748B",
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    marginRight: 8,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  categoryButtonActive: {
    backgroundColor: "#ECFDF5",
    borderColor: "#22C55E",
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748B",
  },
  categoryButtonTextActive: {
    color: "#10B981",
    fontWeight: "700",
  },
  categoryIcon: {
    fontSize: 18,
    marginRight: 8,
  },
});
