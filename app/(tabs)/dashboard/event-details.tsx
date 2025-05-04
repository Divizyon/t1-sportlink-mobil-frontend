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
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  EventDetailHeader,
  EventInfo,
  EventParticipants,
} from "@/components/dashboard";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { MapPin, Calendar, Clock, Users, ChevronRight, MessageSquare, Info, Map, Share2, Navigation } from "lucide-react-native";
import MapView, { Marker } from 'react-native-maps';

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
  }
};

// Örnek etkinlik verileri
const sampleEvents = [
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
      "https://randomuser.me/api/portraits/women/28.jpg",
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
      "Basketbol severler için haftalık dostluk maçı. Her seviyeden oyuncular katılabilir. Bu etkinlikte rekabetten çok eğlence ön plandadır ve yeni arkadaşlar edinebilirsiniz. Maç sonrası katılımcılarla sosyal etkinlik planlanmaktadır.",
    requirements: "Spor ayakkabı ve rahat kıyafet getirmeniz yeterli.",
    tags: ["Spor", "Basketbol", "Takım Oyunu"],
    notes: "Maç bitiminde sosyal bir etkinlik düzenlenecektir.",
    imageUrl: "https://images.unsplash.com/photo-1518063319789-7217e6706b04?q=80&w=2069&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Futbol Turnuvası",
    type: "Spor",
    category: "Futbol",
    date: "25 Ekim",
    time: "15:00-18:00",
    location: "Selçuklu Stadyumu",
    coordinates: {
      latitude: 37.8751,
      longitude: 32.4832,
    },
    distance: "2.5 km",
    participants: [
      "https://randomuser.me/api/portraits/men/32.jpg",
      "https://randomuser.me/api/portraits/men/44.jpg",
      "https://randomuser.me/api/portraits/women/65.jpg",
    ],
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
    requirements: "Forma, futbol ayakkabıları ve tekmelik getirmeniz gerekmektedir.",
    tags: ["Spor", "Futbol", "Turnuva"],
    notes: "Turnuva sonunda ödül töreni yapılacaktır.",
    imageUrl: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=2070&auto=format&fit=crop",
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
    participants: [
      "https://randomuser.me/api/portraits/women/63.jpg",
      "https://randomuser.me/api/portraits/women/44.jpg",
    ],
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
    requirements: "Yoga matı (isterseniz merkezimizden de temin edebilirsiniz) ve rahat kıyafetler.",
    tags: ["Sağlık", "Yoga", "Meditasyon"],
    notes: "Lütfen seanstan 15 dakika önce hazır olunuz.",
    imageUrl: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=2070&auto=format&fit=crop",
  }
];

export default function EventDetailsScreen() {
  const params = useLocalSearchParams();
  const eventId = Number(params.id);
  const [eventDetail, setEventDetail] = useState(null);
  const [activeTab, setActiveTab] = useState('info'); // 'info', 'participants', 'map'
  const [isJoined, setIsJoined] = useState(false);

  useEffect(() => {
    // Gerçek uygulamada burada API çağrısı yapılır
    console.log("Etkinlik ID:", eventId);
    
    // ID'ye göre etkinliği bul
    const event = sampleEvents.find(e => e.id === eventId);
    if (event) {
      setEventDetail(event);
      setIsJoined(event.isJoined);
    } else {
      // Etkinlik bulunamadıysa örnek veriyi göster
      setEventDetail(sampleEvents[0]);
      setIsJoined(sampleEvents[0].isJoined);
      console.log("Belirtilen ID ile etkinlik bulunamadı, varsayılan etkinlik gösteriliyor.");
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
  const categoryColor = theme.categoryColors[eventDetail.category] || theme.primary;

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
        id: organizerId
      }
    });
  };

  const handleShare = () => {
    Alert.alert(
      "Paylaş",
      `${eventDetail.title} etkinliğini paylaşmak için bir platform seçin.`,
      [{ text: "Tamam", onPress: () => console.log("OK") }]
    );
  };

  // Tab içeriğini render et
  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
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
            
            <VStack style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Etiketler</Text>
              <HStack style={styles.tagContainer}>
                {eventDetail.tags.map((tag, index) => (
                  <Box key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </Box>
                ))}
              </HStack>
            </VStack>
          </Box>
        );
      case 'participants':
        return (
          <Box style={styles.tabContent}>
            <EventParticipants
              participants={eventDetail.participants}
              participantCount={eventDetail.participantCount}
              maxParticipants={eventDetail.maxParticipants}
            />
          </Box>
        );
      case 'map':
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
                style={[styles.getDirectionsButton, { backgroundColor: 'white' }]}
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
                  <Text style={[styles.getDirectionsText, { color: categoryColor }]}>Yol Tarifi Al</Text>
                </HStack>
              </TouchableOpacity>
            </Box>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Etkinlik Resmi */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: eventDetail.imageUrl }} 
            style={styles.eventImage} 
            resizeMode="cover"
          />
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Box style={styles.backButtonInner}>
              <ChevronRight size={22} color="#0F172A" style={{ transform: [{ rotate: '180deg' }] }} />
            </Box>
          </TouchableOpacity>
          
          <Box style={styles.categoryTag}>
            <Text style={[styles.categoryText, { color: categoryColor }]}>{eventDetail.category}</Text>
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
            <Text style={styles.organizerName}>{eventDetail.organizer.name}</Text>
          </HStack>
        </Box>

        {/* Etkinlik Bilgileri - Tarih, Saat, Konum */}
        <Box style={styles.infoCards}>
          <HStack style={styles.infoRow}>
            <Box style={styles.infoCard}>
              <Box style={[styles.infoIconWrapper, { backgroundColor: `${categoryColor}15` }]}>
                <Calendar size={18} color={categoryColor} />
              </Box>
              <VStack>
                <Text style={styles.infoLabel}>Tarih</Text>
                <Text style={styles.infoValue}>{eventDetail.date}</Text>
              </VStack>
            </Box>
            
            <Box style={styles.infoCard}>
              <Box style={[styles.infoIconWrapper, { backgroundColor: `${categoryColor}15` }]}>
                <Clock size={18} color={categoryColor} />
              </Box>
              <VStack>
                <Text style={styles.infoLabel}>Saat</Text>
                <Text style={styles.infoValue}>{eventDetail.time}</Text>
              </VStack>
            </Box>
          </HStack>
          
          <Box style={styles.locationCard}>
            <Box style={[styles.infoIconWrapper, { backgroundColor: `${categoryColor}15` }]}>
              <MapPin size={18} color={categoryColor} />
            </Box>
            <VStack style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Konum</Text>
              <Text style={styles.infoValue}>{eventDetail.location}</Text>
              <Text style={styles.distanceText}>{eventDetail.distance} uzaklıkta</Text>
            </VStack>
          </Box>
          
          <Box style={styles.participantsCard}>
            <Box style={[styles.infoIconWrapper, { backgroundColor: `${categoryColor}15` }]}>
              <Users size={18} color={categoryColor} />
            </Box>
            <VStack style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Katılımcılar</Text>
              <HStack style={styles.participantInfo}>
                <Text style={styles.infoValue}>{eventDetail.participantCount}/{eventDetail.maxParticipants}</Text>
                <Box style={styles.progressBarContainer}>
                  <Box 
                    style={[
                      styles.progressBar, 
                      { 
                        width: `${(eventDetail.participantCount / eventDetail.maxParticipants) * 100}%`,
                        backgroundColor: categoryColor
                      }
                    ]} 
                  />
                </Box>
              </HStack>
            </VStack>
          </Box>
        </Box>

        {/* Tab Seçici */}
        <HStack style={styles.tabSelector}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'info' && styles.activeTab]} 
            onPress={() => setActiveTab('info')}
          >
            <Info size={18} color={activeTab === 'info' ? categoryColor : theme.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'info' && { color: categoryColor }]}>Bilgiler</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'participants' && styles.activeTab]} 
            onPress={() => setActiveTab('participants')}
          >
            <Users size={18} color={activeTab === 'participants' ? categoryColor : theme.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'participants' && { color: categoryColor }]}>Katılımcılar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'map' && styles.activeTab]} 
            onPress={() => setActiveTab('map')}
          >
            <Map size={18} color={activeTab === 'map' ? categoryColor : theme.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'map' && { color: categoryColor }]}>Harita</Text>
          </TouchableOpacity>
        </HStack>

        {/* Tab İçeriği */}
        {renderTabContent()}

      </ScrollView>

      {/* Alt Butonlar */}
      <HStack style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, { flex: 2 }, isJoined ? styles.leaveButton : styles.joinButton]} 
          onPress={handleToggleJoin}
        >
          <Text style={[styles.actionButtonText, isJoined && styles.leaveButtonText]}>
            {isJoined ? "Ayrıl" : "Katıl"}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionIconButton} onPress={handleContact}>
          <MessageSquare size={22} color={theme.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionIconButton} onPress={handleShare}>
          <Share2 size={22} color={theme.textSecondary} />
        </TouchableOpacity>
      </HStack>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: theme.textSecondary,
  },
  imageContainer: {
    width: '100%',
    height: 240,
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  backButtonInner: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryTag: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
    fontWeight: '600',
  },
  joinedBadge: {
    position: 'absolute',
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
    fontWeight: '600',
    color: 'white',
  },
  titleContainer: {
    padding: 20,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 10,
  },
  organizer: {
    alignItems: 'center',
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
    fontWeight: '500',
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
    flexDirection: 'row',
    alignItems: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
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
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
  },
  distanceText: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 2,
  },
  participantInfo: {
    alignItems: 'center',
    gap: 8,
  },
  progressBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: theme.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
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
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.textSecondary,
  },
  tagContainer: {
    flexWrap: 'wrap',
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
    fontWeight: '500',
  },
  mapContainer: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 16,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  customMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  getDirectionsButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'white',
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  getDirectionsText: {
    fontSize: 14,
    fontWeight: '600',
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
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  joinButton: {
    backgroundColor: theme.primary,
  },
  leaveButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.error,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  leaveButtonText: {
    color: theme.error,
  },
  actionIconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.background,
    marginLeft: 4,
    borderWidth: 1,
    borderColor: theme.border,
  },
});
