import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import MapView, { Marker, Callout, PROVIDER_DEFAULT, Polyline, Region } from 'react-native-maps';
import { Filter, ChevronDown } from 'lucide-react-native';

interface Location {
  id: number;
  title: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  category: string;
}

// POI types
interface PointOfInterest {
  id: number;
  title: string;
  description: string;
  type: 'bikeRoute' | 'runningPath' | 'gym';
  coordinates: {
    latitude: number;
    longitude: number;
  };
  // For routes with multiple points (bike routes, running paths)
  route?: Array<{
    latitude: number;
    longitude: number;
  }>;
}

interface EventMapProps {
  userLocation: {
    latitude: number;
    longitude: number;
  };
  events: Location[];
  onMarkerPress?: (eventId: number) => void;
  activeTab?: string;
  onFilterChange?: (category: string, distance: number) => void;
  selectedCategory?: string;
  distanceFilter?: number;
  showPOI?: boolean; // New prop to toggle POI visibility
}

// Categories to color mapping
const categoryColors: Record<string, string> = {
  "Tümü": "#34D399",
  "Futbol": "#34A853",
  "Basketbol": "#EA4335",
  "Yüzme": "#4285F4",
  "Tenis": "#FBBC05",
  "Voleybol": "#3F51B5",
  "Koşu": "#FF6D01",
  "Yoga": "#9C27B0",
  "Bisiklet": "#FF5722",
  "Okçuluk": "#795548",
  "Akıl Oyunları": "#00BCD4"
};

// Mesafe filtreleme seçenekleri
const distanceOptions = [5, 10, 25, 50];

// Kategori filtreleme seçenekleri - sıralama sportCategories ile aynı olmalı
const categoryOptions = [
  "Tümü", 
  "Futbol", 
  "Basketbol", 
  "Yüzme", 
  "Tenis", 
  "Voleybol", 
  "Koşu", 
  "Yoga", 
  "Bisiklet", 
  "Okçuluk", 
  "Akıl Oyunları"
];

// Custom map styling to make it look more polished
const customMapStyle = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#f5f5f5"
      }
    ]
  },
  {
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#f5f5f5"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#bdbdbd"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#eeeeee"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#e5e5e5"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#ffffff"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#dadada"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "transit.line",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#e5e5e5"
      }
    ]
  },
  {
    "featureType": "transit.station",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#eeeeee"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#c9c9c9"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  }
];

// POI color mapping
const poiColors = {
  bikeRoute: "#4CAF50", // Green
  runningPath: "#FF5722", // Orange
  gym: "#2196F3",       // Blue
};

// Konya'daki örnek bisiklet rotaları, koşu yolları ve spor salonları
const pointsOfInterest: PointOfInterest[] = [
  // Bisiklet rotaları
  {
    id: 101,
    title: "Meram Bisiklet Yolu",
    description: "7.5 km uzunluğunda bisiklet yolu",
    type: "bikeRoute",
    coordinates: { latitude: 37.8599, longitude: 32.4522 },
    route: [
      { latitude: 37.8599, longitude: 32.4522 },
      { latitude: 37.8580, longitude: 32.4530 },
      { latitude: 37.8560, longitude: 32.4550 },
      { latitude: 37.8540, longitude: 32.4580 },
      { latitude: 37.8520, longitude: 32.4600 }
    ]
  },
  {
    id: 102,
    title: "Selçuklu Bisiklet Parkuru",
    description: "5 km uzunluğunda bisiklet yolu",
    type: "bikeRoute",
    coordinates: { latitude: 37.885, longitude: 32.485 },
    route: [
      { latitude: 37.885, longitude: 32.485 },
      { latitude: 37.887, longitude: 32.488 },
      { latitude: 37.889, longitude: 32.491 },
      { latitude: 37.892, longitude: 32.493 },
      { latitude: 37.895, longitude: 32.495 }
    ]
  },
  // Koşu yolları
  {
    id: 201,
    title: "Alaaddin Tepesi Koşu Yolu",
    description: "2.5 km parkur",
    type: "runningPath",
    coordinates: { latitude: 37.871, longitude: 32.493 },
    route: [
      { latitude: 37.871, longitude: 32.493 },
      { latitude: 37.872, longitude: 32.495 },
      { latitude: 37.873, longitude: 32.497 },
      { latitude: 37.874, longitude: 32.499 },
      { latitude: 37.875, longitude: 32.501 }
    ]
  },
  {
    id: 202,
    title: "Kültürpark Koşu Parkuru",
    description: "3 km parkur",
    type: "runningPath",
    coordinates: { latitude: 37.866, longitude: 32.482 },
    route: [
      { latitude: 37.866, longitude: 32.482 },
      { latitude: 37.867, longitude: 32.484 },
      { latitude: 37.868, longitude: 32.486 },
      { latitude: 37.869, longitude: 32.488 },
      { latitude: 37.870, longitude: 32.490 }
    ]
  },
  // Spor salonları
  {
    id: 301,
    title: "Selçuklu Belediyesi Spor Tesisi",
    description: "Tam donanımlı spor salonu",
    type: "gym",
    coordinates: { latitude: 37.883, longitude: 32.482 }
  },
  {
    id: 302,
    title: "Meram Fitness Center",
    description: "Fitness ve grup dersleri",
    type: "gym",
    coordinates: { latitude: 37.855, longitude: 32.465 }
  },
  {
    id: 303,
    title: "Konya Büyükşehir Spor Kompleksi",
    description: "Yüzme havuzu ve spor salonu",
    type: "gym",
    coordinates: { latitude: 37.875, longitude: 32.492 }
  }
];

const EventMap = ({ 
  userLocation, 
  events = [], 
  onMarkerPress, 
  activeTab = "nearby",
  onFilterChange,
  selectedCategory = "Tümü",
  distanceFilter = 50,
  showPOI = true // Default to showing POIs
}: EventMapProps) => {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [localDistanceFilter, setLocalDistanceFilter] = useState(distanceFilter);
  const [localSelectedCategory, setLocalSelectedCategory] = useState(selectedCategory);
  const [activePOITypes, setActivePOITypes] = useState<string[]>(["bikeRoute", "runningPath", "gym"]);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const mapRef = React.useRef<MapView>(null);
  const [currentRegion, setCurrentRegion] = useState<Region>({
    latitude: userLocation.latitude,
    longitude: userLocation.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  
  const getMarkerColor = (category: string) => {
    return categoryColors[category] || "#34D399"; // Default to theme.primary if category not found
  };

  const handleMapReady = () => {
    setIsMapLoaded(true);
  };

  // Get unique categories from events for the legend
  const uniqueCategories = events && events.length > 0 
    ? [...new Set(events.map(event => event.category))]
    : [];

  // Get the appropriate title based on active tab
  const getMapTitle = () => {
    if (activeTab === "joined") {
      return "Katıldığınız Etkinlikler";
    }
    return "Yakınındaki Etkinlikler";
  };

  const handleDistanceChange = (value: number) => {
    console.log(`Mesafe değişti: ${value}km, kategori: ${localSelectedCategory}`);
    // Yerel state'i güncelle
    setLocalDistanceFilter(value);
    
    // Ana komponentteki filtreleme fonksiyonunu çağır
    if (onFilterChange) {
      try {
        // Tam olarak aynı kategori adını kullanarak çağrı yap
        onFilterChange(localSelectedCategory, value);
        console.log(`Filtreleme fonksiyonu çağrıldı: kategori=${localSelectedCategory}, mesafe=${value}`);
      } catch (error) {
        console.error('Filtreleme sırasında hata:', error);
      }
    }
  };

  const handleCategoryChange = (category: string) => {
    console.log(`Kategori değişti: ${category}, önceki: ${localSelectedCategory}`);
    
    // Yerel durumu güncelle
    setLocalSelectedCategory(category);
    
    // Ana komponente bildir
    if (onFilterChange) {
      try {
        onFilterChange(category, localDistanceFilter);
        console.log(`Filtreleme fonksiyonu çağrıldı: kategori=${category}, mesafe=${localDistanceFilter}`);
      } catch (error) {
        console.error('Kategori filtreleme sırasında hata:', error);
      }
    }
  };

  // Toggle POI visibility
  const togglePOIType = (type: string) => {
    setActivePOITypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };

  // Get POI emoji based on type
  const getPOIEmoji = (type: 'bikeRoute' | 'runningPath' | 'gym') => {
    switch(type) {
      case 'bikeRoute':
        return '🚴';
      case 'runningPath':
        return '🏃';
      case 'gym':
        return '🏋️';
      default:
        return '📍';
    }
  };

  // Get POI marker color based on type
  const getPOIColor = (type: 'bikeRoute' | 'runningPath' | 'gym') => {
    return poiColors[type];
  };

  // Toggle filter panel visibility
  const toggleFiltersPanel = () => {
    setShowFiltersPanel(prev => !prev);
  };

  // Yeni bölge değişikliğini takip et
  const handleRegionChange = (region: Region) => {
    setCurrentRegion(region);
  };

  // Her tab değişiminde mapReady durumunu sıfırla
  useEffect(() => {
    console.log(`Tab changed to: ${activeTab}, loading map with ${events.length} events`);
    setIsMapLoaded(false);
    // 100ms sonra haritanın yüklenmesini beklenmeden ready durumuna geç
    // Bu, haritanın daha hızlı yüklenmesini sağlar
    const timer = setTimeout(() => {
      setIsMapLoaded(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [activeTab]);

  // Update local distance filter when prop changes
  useEffect(() => {
    setLocalDistanceFilter(distanceFilter);
  }, [distanceFilter]);

  // Reset map loaded state when events change significantly
  useEffect(() => {
    console.log(`Events changed: ${events.length} events available`);
  }, [events]);

  return (
    <>
      <Text style={styles.sectionTitle}>{getMapTitle()}</Text>
      
      {/* Distance Slider - Only show for nearby tab */}
      {activeTab === "nearby" && (
        <View style={styles.distanceSliderContainer}>
          <View style={styles.sliderLabelContainer}>
            <Text style={styles.sliderLabel}>Mesafe: {localDistanceFilter} km</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={50}
            step={1}
            value={localDistanceFilter}
            onValueChange={handleDistanceChange}
            minimumTrackTintColor="#10B981"
            maximumTrackTintColor="#E2E8F0"
            thumbTintColor="#10B981"
          />
          <View style={styles.sliderMarkersContainer}>
            <Text style={styles.sliderMarker}>1km</Text>
            <Text style={styles.sliderMarker}>25km</Text>
            <Text style={styles.sliderMarker}>50km</Text>
          </View>
        </View>
      )}
      
      {/* Compact Filter Button */}
      <View style={styles.filterButtonContainer}>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={toggleFiltersPanel}
        >
          <Filter size={16} color="#64748B" />
          <Text style={styles.filterButtonText}>Harita Katmanları</Text>
          <ChevronDown size={16} color="#64748B" style={showFiltersPanel ? styles.chevronUp : undefined} />
        </TouchableOpacity>
      </View>
      
      {/* Filter Panel - Shown when filter button is clicked */}
      {showFiltersPanel && showPOI && (
        <View style={styles.filterPanel}>
          <Text style={styles.filterPanelTitle}>Harita Katmanları</Text>
          <View style={styles.filterPanelItems}>
            <TouchableOpacity 
              style={styles.filterPanelItem}
              onPress={() => togglePOIType("bikeRoute")}
            >
              <View style={styles.filterPanelItemCheckbox}>
                {activePOITypes.includes("bikeRoute") && (
                  <View style={[styles.filterPanelItemCheckboxInner, { backgroundColor: poiColors.bikeRoute }]} />
                )}
              </View>
              <Text style={styles.filterPanelItemText}>🚴 Bisiklet Rotaları</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.filterPanelItem}
              onPress={() => togglePOIType("runningPath")}
            >
              <View style={styles.filterPanelItemCheckbox}>
                {activePOITypes.includes("runningPath") && (
                  <View style={[styles.filterPanelItemCheckboxInner, { backgroundColor: poiColors.runningPath }]} />
                )}
              </View>
              <Text style={styles.filterPanelItemText}>🏃 Koşu Parkurları</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.filterPanelItem}
              onPress={() => togglePOIType("gym")}
            >
              <View style={styles.filterPanelItemCheckbox}>
                {activePOITypes.includes("gym") && (
                  <View style={[styles.filterPanelItemCheckboxInner, { backgroundColor: poiColors.gym }]} />
                )}
              </View>
              <Text style={styles.filterPanelItemText}>🏋️ Spor Salonları</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      <View style={styles.container}>
        <MapView
          provider={PROVIDER_DEFAULT}
          style={styles.map}
          initialRegion={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          onMapReady={handleMapReady}
          customMapStyle={customMapStyle}
          ref={mapRef}
          onRegionChangeComplete={handleRegionChange}
        >
          {/* User location marker */}
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            title="Konumunuz"
            pinColor="#000"
          >
            <Callout>
              <Text style={styles.calloutTitle}>Şu anki konumunuz</Text>
            </Callout>
          </Marker>

          {/* Event markers */}
          {events.map((event) => (
            <Marker
              key={event.id}
              coordinate={{
                latitude: event.coordinates.latitude,
                longitude: event.coordinates.longitude,
              }}
              title={event.title}
              description={event.category}
              pinColor={getMarkerColor(event.category)}
              onPress={() => onMarkerPress && onMarkerPress(event.id)}
            >
              <Callout>
                <View style={styles.calloutContainer}>
                  <Text style={styles.calloutTitle}>{event.title}</Text>
                  <Text style={styles.calloutCategory}>{event.category}</Text>
                </View>
              </Callout>
            </Marker>
          ))}

          {/* Points of Interest */}
          {showPOI && pointsOfInterest.map((poi) => (
            activePOITypes.includes(poi.type) && (
              <React.Fragment key={poi.id}>
                {/* Marker for point */}
                <Marker
                  coordinate={poi.coordinates}
                  title={poi.title}
                  description={poi.description}
                >
                  <View style={[styles.poiMarker, { backgroundColor: getPOIColor(poi.type) }]}>
                    <Text style={styles.poiMarkerEmoji}>{getPOIEmoji(poi.type)}</Text>
                  </View>
                  <Callout>
                    <View style={styles.calloutContainer}>
                      <Text style={styles.calloutTitle}>{poi.title}</Text>
                      <Text style={styles.calloutCategory}>{poi.description}</Text>
                    </View>
                  </Callout>
                </Marker>

                {/* Route lines for paths (if available) */}
                {poi.route && (poi.type === 'bikeRoute' || poi.type === 'runningPath') && (
                  <Polyline
                    coordinates={poi.route}
                    strokeColor={getPOIColor(poi.type)}
                    strokeWidth={4}
                  />
                )}
              </React.Fragment>
            )
          ))}
        </MapView>

        {/* Map Controls */}
        <View style={styles.mapControls}>
          <TouchableOpacity 
            style={styles.mapControlButton}
            onPress={() => {
              if (mapRef.current) {
                // Kullanıcı konumuna odaklan
                mapRef.current.animateToRegion({
                  latitude: userLocation.latitude,
                  longitude: userLocation.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }, 500);
              }
            }}
          >
            <Text style={styles.mapControlIcon}>📍</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.mapControlButton}
            onPress={() => {
              if (mapRef.current && currentRegion) {
                // Mevcut bölgeye göre daha yakın zoom
                const newDelta = {
                  latitudeDelta: currentRegion.latitudeDelta / 2, // Yarıya düşürerek yakınlaş
                  longitudeDelta: currentRegion.longitudeDelta / 2,
                };
                
                mapRef.current.animateToRegion({
                  latitude: currentRegion.latitude,
                  longitude: currentRegion.longitude,
                  ...newDelta
                }, 300);
              }
            }}
          >
            <Text style={styles.mapControlIcon}>+</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.mapControlButton}
            onPress={() => {
              if (mapRef.current && currentRegion) {
                // Mevcut bölgeye göre daha uzak zoom
                const newDelta = {
                  latitudeDelta: currentRegion.latitudeDelta * 2, // İki katına çıkararak uzaklaş
                  longitudeDelta: currentRegion.longitudeDelta * 2,
                };
                
                mapRef.current.animateToRegion({
                  latitude: currentRegion.latitude,
                  longitude: currentRegion.longitude,
                  ...newDelta
                }, 300);
              }
            }}
          >
            <Text style={styles.mapControlIcon}>-</Text>
          </TouchableOpacity>
        </View>

        {/* Map Info */}
        <View style={styles.mapInfoButton}>
          <TouchableOpacity
            onPress={() => setShowFiltersPanel(prev => !prev)}
          >
            <Text style={styles.mapInfoButtonText}>
              {showFiltersPanel ? "⬆️ Gizle" : "⬇️ Bilgi"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Map Info Panel - Collapsible */}
        {showFiltersPanel && (
          <View style={styles.mapInfoPanel}>
            <View style={styles.mapInfoRow}>
              <TouchableOpacity
                style={[styles.mapInfoAction, activePOITypes.length > 0 && styles.mapInfoActionActive]}
                onPress={() => 
                  activePOITypes.length > 0 
                  ? setActivePOITypes([]) 
                  : setActivePOITypes(["bikeRoute", "runningPath", "gym"])
                }
              >
                <Text style={styles.mapInfoActionText}>
                  {activePOITypes.length > 0 ? "🗺️ Tesisleri Gizle" : "🗺️ Tesisleri Göster"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.mapLegendRow}>
              <Text style={styles.mapLegendTitle}>Gösterilen Tesisler:</Text>
              <View style={styles.mapLegendItems}>
                <TouchableOpacity 
                  style={styles.mapLegendItem} 
                  onPress={() => togglePOIType("bikeRoute")}
                >
                  <View 
                    style={[
                      styles.mapLegendColor, 
                      { backgroundColor: poiColors.bikeRoute },
                      !activePOITypes.includes("bikeRoute") && styles.mapLegendColorInactive
                    ]} 
                  />
                  <Text 
                    style={[
                      styles.mapLegendText,
                      !activePOITypes.includes("bikeRoute") && styles.mapLegendTextInactive
                    ]}
                  >
                    🚴 Bisiklet
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.mapLegendItem} 
                  onPress={() => togglePOIType("runningPath")}
                >
                  <View 
                    style={[
                      styles.mapLegendColor, 
                      { backgroundColor: poiColors.runningPath },
                      !activePOITypes.includes("runningPath") && styles.mapLegendColorInactive
                    ]} 
                  />
                  <Text 
                    style={[
                      styles.mapLegendText,
                      !activePOITypes.includes("runningPath") && styles.mapLegendTextInactive
                    ]}
                  >
                    🏃 Koşu
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.mapLegendItem} 
                  onPress={() => togglePOIType("gym")}
                >
                  <View 
                    style={[
                      styles.mapLegendColor, 
                      { backgroundColor: poiColors.gym },
                      !activePOITypes.includes("gym") && styles.mapLegendColorInactive
                    ]} 
                  />
                  <Text 
                    style={[
                      styles.mapLegendText,
                      !activePOITypes.includes("gym") && styles.mapLegendTextInactive
                    ]}
                  >
                    🏋️ Spor Salonu
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Loading indicator */}
        {!isMapLoaded && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#34D399" />
          </View>
        )}

        {/* Empty state message */}
        {isMapLoaded && events.length === 0 && (
          <View style={styles.emptyOverlay}>
            <Text style={styles.emptyText}>
              {activeTab === "joined" 
                ? "Henüz katıldığınız bir etkinlik bulunmamaktadır."
                : "Bu filtreleme kriterlerine uygun etkinlik bulunamadı."}
            </Text>
          </View>
        )}

        {/* Legend */}
        {isMapLoaded && events.length > 0 && (
          <View style={styles.legendContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {uniqueCategories.map(category => (
                <View key={category} style={styles.legendItem}>
                  <View 
                    style={[
                      styles.legendColor, 
                      { backgroundColor: getMarkerColor(category) }
                    ]} 
                  />
                  <Text style={styles.legendText}>{category}</Text>
                </View>
              ))}
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: "#000" }]} />
                <Text style={styles.legendText}>Konumunuz</Text>
              </View>
              
              {/* POI legend items */}
              {showPOI && activePOITypes.map(type => (
                <View key={type} style={styles.legendItem}>
                  <View 
                    style={[
                      styles.legendColor, 
                      { backgroundColor: poiColors[type as keyof typeof poiColors] }
                    ]} 
                  />
                  <Text style={styles.legendText}>
                    {type === 'bikeRoute' ? 'Bisiklet Yolu' : 
                     type === 'runningPath' ? 'Koşu Parkuru' : 'Spor Salonu'}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 10,
    marginHorizontal: 16,
  },
  container: {
    height: 220,
    marginBottom: 0,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  emptyOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  emptyText: {
    color: '#6B7280',
    textAlign: 'center',
    fontSize: 12,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  legendContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 10,
    color: '#0F172A',
  },
  calloutContainer: {
    padding: 5,
    maxWidth: 150,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  calloutCategory: {
    fontSize: 10,
    color: '#6B7280',
  },
  distanceSliderContainer: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sliderLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 2,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  slider: {
    width: '100%',
    height: 30,
  },
  sliderMarkersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
    marginTop: -5,
  },
  sliderMarker: {
    fontSize: 10,
    color: '#64748B',
  },
  filterButtonContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    marginHorizontal: 8,
  },
  chevronUp: {
    transform: [{ rotate: '180deg' }],
  },
  filterPanel: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filterPanelTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
  },
  filterPanelItems: {
    marginTop: 4,
  },
  filterPanelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  filterPanelItemCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterPanelItemCheckboxInner: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  filterPanelItemText: {
    fontSize: 14,
    color: '#334155',
  },
  poiToggleContainer: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  poiToggleTitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 4,
  },
  poiToggleButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  poiToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  poiToggleButtonActive: {
    backgroundColor: '#F8FAFC',
  },
  poiToggleText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 4,
  },
  poiMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  poiMarkerEmoji: {
    fontSize: 18,
  },
  poiToggleIconEmoji: {
    fontSize: 16,
  },
  mapControls: {
    position: 'absolute',
    right: 10,
    top: 10,
    backgroundColor: 'transparent',
  },
  mapControlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  mapControlIcon: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  // Map Info styles
  mapInfoButton: {
    position: 'absolute',
    bottom: 36, // Legend üstüne
    right: 10,
    backgroundColor: 'white',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  mapInfoButtonText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '500',
  },
  mapInfoPanel: {
    position: 'absolute',
    bottom: 72, // Bilgi butonu + legend üstünde
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    padding: 10,
    elevation: 3,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  mapInfoRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  mapInfoAction: {
    backgroundColor: 'white',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  mapInfoActionActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#34D399',
  },
  mapInfoActionText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '500',
  },
  mapLegendRow: {
    marginTop: 2,
  },
  mapLegendTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
  },
  mapLegendItems: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  mapLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 2,
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 12,
  },
  mapLegendColor: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 3,
  },
  mapLegendColorInactive: {
    opacity: 0.5,
  },
  mapLegendText: {
    fontSize: 11,
    color: '#475569',
  },
  mapLegendTextInactive: {
    opacity: 0.7,
  },
});

export default EventMap; 