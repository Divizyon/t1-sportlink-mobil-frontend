import Slider from "@react-native-community/slider";
import { ChevronDown, Filter } from "lucide-react-native";
import React, { useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from "react-native";
import MapView, {
  Callout,
  Marker,
  PROVIDER_DEFAULT,
  Polyline,
  Region,
} from "react-native-maps";

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
  type: "bikeRoute" | "runningPath" | "gym";
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
  distanceFilter?: number; // Only used for drawing circle, not for filtering
  showPOI?: boolean; // New prop to toggle POI visibility
}

// Categories to color mapping
const categoryColors: Record<string, string> = {
  Tümü: "#34D399",
  Futbol: "#34A853",
  Basketbol: "#EA4335",
  Yüzme: "#4285F4",
  Tenis: "#FBBC05",
  Voleybol: "#3F51B5",
  Koşu: "#FF6D01",
  Yoga: "#9C27B0",
  Bisiklet: "#FF5722",
  Okçuluk: "#795548",
  "Akıl Oyunları": "#00BCD4",
};

// Mesafe filtreleme seçenekleri
const distanceOptions = [5, 10, 15, 20, 25, 50];

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
  "Akıl Oyunları",
];

// For points of interest
const poiColors = {
  bikeRoute: "#34A853",
  runningPath: "#EA4335",
  gym: "#4285F4",
};

// Hard-coded points of interest - only show when showPOI is true
const pointsOfInterestData: PointOfInterest[] = [
  // Bisiklet rotaları
  {
    id: 101,
    title: "Meram Bisiklet Rotası",
    description: "Şehir manzaralı 5 km'lik rota",
    type: "bikeRoute",
    coordinates: { latitude: 37.855, longitude: 32.455 },
    route: [
      { latitude: 37.855, longitude: 32.455 },
      { latitude: 37.86, longitude: 32.46 },
      { latitude: 37.865, longitude: 32.465 },
      { latitude: 37.87, longitude: 32.47 },
      { latitude: 37.875, longitude: 32.475 },
    ],
  },
  {
    id: 102,
    title: "Selçuklu Bisiklet Yolu",
    description: "Park içinden geçen 3 km'lik rota",
    type: "bikeRoute",
    coordinates: { latitude: 37.885, longitude: 32.485 },
    route: [
      { latitude: 37.885, longitude: 32.485 },
      { latitude: 37.89, longitude: 32.49 },
      { latitude: 37.895, longitude: 32.495 },
      { latitude: 37.9, longitude: 32.5 },
    ],
  },
  // Koşu parkurları
  {
    id: 201,
    title: "Kültürpark Koşu Parkuru",
    description: "Yeşillikler içinde 2 km'lik koşu parkuru",
    type: "runningPath",
    coordinates: { latitude: 37.875, longitude: 32.492 },
    route: [
      { latitude: 37.875, longitude: 32.492 },
      { latitude: 37.878, longitude: 32.495 },
      { latitude: 37.881, longitude: 32.498 },
      { latitude: 37.884, longitude: 32.501 },
      { latitude: 37.887, longitude: 32.504 },
    ],
  },
  {
    id: 202,
    title: "Karatay Parkı Koşu Yolu",
    description: "Rahat koşulabilen düz parkur",
    type: "runningPath",
    coordinates: { latitude: 37.872, longitude: 32.505 },
    route: [
      { latitude: 37.872, longitude: 32.505 },
      { latitude: 37.875, longitude: 32.508 },
      { latitude: 37.878, longitude: 32.511 },
      { latitude: 37.881, longitude: 32.514 },
    ],
  },
  // Spor salonları
  {
    id: 301,
    title: "Selçuklu Belediyesi Spor Tesisi",
    description: "Tam donanımlı spor salonu",
    type: "gym",
    coordinates: { latitude: 37.883, longitude: 32.482 },
  },
  {
    id: 302,
    title: "Meram Fitness Center",
    description: "Fitness ve grup dersleri",
    type: "gym",
    coordinates: { latitude: 37.855, longitude: 32.465 },
  },
  {
    id: 303,
    title: "Konya Büyükşehir Spor Kompleksi",
    description: "Yüzme havuzu ve spor salonu",
    type: "gym",
    coordinates: { latitude: 37.875, longitude: 32.492 },
  },
];

// Custom map styling to make it look more polished
const customMapStyle = [
  {
    elementType: "geometry",
    stylers: [
      {
        color: "#f5f5f5",
      },
    ],
  },
  {
    elementType: "labels.icon",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#616161",
      },
    ],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [
      {
        color: "#f5f5f5",
      },
    ],
  },
  {
    featureType: "administrative.land_parcel",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#bdbdbd",
      },
    ],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [
      {
        color: "#eeeeee",
      },
    ],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#757575",
      },
    ],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [
      {
        color: "#e5e5e5",
      },
    ],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#9e9e9e",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [
      {
        color: "#ffffff",
      },
    ],
  },
  {
    featureType: "road.arterial",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#757575",
      },
    ],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [
      {
        color: "#dadada",
      },
    ],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#616161",
      },
    ],
  },
  {
    featureType: "road.local",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#9e9e9e",
      },
    ],
  },
  {
    featureType: "transit.line",
    elementType: "geometry",
    stylers: [
      {
        color: "#e5e5e5",
      },
    ],
  },
  {
    featureType: "transit.station",
    elementType: "geometry",
    stylers: [
      {
        color: "#eeeeee",
      },
    ],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [
      {
        color: "#c9c9c9",
      },
    ],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#9e9e9e",
      },
    ],
  },
];

const EventMap = ({
  userLocation,
  events = [],
  onMarkerPress,
  activeTab = "nearby",
  distanceFilter = 50,
  showPOI = true, // Default to showing POIs
}: EventMapProps) => {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [activePOITypes, setActivePOITypes] = useState<string[]>([
    "bikeRoute",
    "runningPath",
    "gym",
  ]);
  const mapRef = useRef<MapView>(null);
  const [currentRegion, setCurrentRegion] = useState<Region>({
    latitude: userLocation.latitude,
    longitude: userLocation.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  // Get POI emoji based on type
  const getPOIEmoji = (type: "bikeRoute" | "runningPath" | "gym") => {
    switch (type) {
      case "bikeRoute":
        return "🚴";
      case "runningPath":
        return "🏃";
      case "gym":
        return "🏋️";
      default:
        return "📍";
    }
  };

  // Get POI marker color based on type
  const getPOIColor = (type: "bikeRoute" | "runningPath" | "gym") => {
    return poiColors[type];
  };

  // Filter POIs based on active types
  const pointsOfInterest = showPOI ? pointsOfInterestData : [];

  const getMarkerColor = (category: string) => {
    return categoryColors[category] || "#34D399"; // Default to theme.primary if category not found
  };

  const handleMapReady = () => {
    setIsMapLoaded(true);
    
    // When map is ready, center on either the user or first event
    if (mapRef.current) {
      if (events.length > 0) {
        const eventLocs = events.map(e => ({
          latitude: e.coordinates.latitude,
          longitude: e.coordinates.longitude
        }));
        
        // Add user location to the points to fit
        const pointsToFit = [
          {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude
          },
          ...eventLocs
        ];
        
        // Fit map to show all points with padding
        mapRef.current.fitToCoordinates(pointsToFit, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true
        });
      } else {
        // If no events, just center on user
        mapRef.current.animateToRegion({
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05
        }, 500);
      }
    }
  };

  // Draw a circle on the map to represent the distance filter
  const drawDistanceCircle = (distance: number) => {
    // Update the map region to reflect the new distance, but only if significantly different
    if (mapRef.current) {
      // Calculate appropriate delta values based on distance
      // Rough approximation: 1 degree ~ 111 km
      const delta = distance / 55;
      
      // Only animate if the change is significant to reduce unnecessary refreshes
      const currentRegionDelta = (currentRegion.latitudeDelta + currentRegion.longitudeDelta) / 2;
      const deltaChange = Math.abs(delta - currentRegionDelta);
      
      // Only animate if change is significant (more than 5% change)
      if (deltaChange / currentRegionDelta > 0.05) {
        mapRef.current.animateToRegion({
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: delta,
          longitudeDelta: delta,
        }, 300);
      }
    }
  };

  // Get the appropriate title based on active tab
  const getMapTitle = () => {
    if (activeTab === "joined") {
      return "Katıldığınız Etkinlikler";
    }
    return "Yakınındaki Etkinlikler";
  };

  // Toggle POI visibility
  const togglePOIType = (type: string) => {
    setActivePOITypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // Update map based on distance changes
  useEffect(() => {
    if (isMapLoaded && mapRef.current) {
      drawDistanceCircle(distanceFilter);
    }
  }, [isMapLoaded, distanceFilter]);

  // Update map when new events arrive
  useEffect(() => {
    if (isMapLoaded && mapRef.current && events.length > 0) {
      // Re-center map if needed
      if (events.length === 1) {
        // Single event - zoom closer
        mapRef.current.animateToRegion({
          latitude: events[0].coordinates.latitude,
          longitude: events[0].coordinates.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }, 500);
      } else if (events.length > 1) {
        // Multiple events - fit them all
        const eventLocs = events.map(e => ({
          latitude: e.coordinates.latitude,
          longitude: e.coordinates.longitude
        }));
        
        // Add user location to the points to fit
        const pointsToFit = [
          {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude
          },
          ...eventLocs
        ];
        
        // Fit map to show all points with padding
        mapRef.current.fitToCoordinates(pointsToFit, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true
        });
      }
    }
  }, [events, isMapLoaded]);

  const handleRegionChange = (region: Region) => {
    setCurrentRegion(region);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{getMapTitle()}</Text>

      {/* Map Container - simplified */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          initialRegion={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          showsUserLocation
          showsMyLocationButton
          showsCompass
          customMapStyle={customMapStyle}
          onMapReady={handleMapReady}
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
          {events.map((event, index) => (
            <Marker
              key={`event-${event.id}-${index}`}
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
          {showPOI && pointsOfInterest.map(
            (poi: PointOfInterest, index: number) =>
              activePOITypes.includes(poi.type) && (
                <React.Fragment key={`poi-${poi.id}-${index}`}>
                  {/* Marker for point */}
                  <Marker
                    coordinate={poi.coordinates}
                    title={poi.title}
                    description={poi.description}
                  >
                    <View
                      style={[
                        styles.poiMarker,
                        { backgroundColor: getPOIColor(poi.type) },
                      ]}
                    >
                      <Text style={styles.poiMarkerEmoji}>
                        {getPOIEmoji(poi.type)}
                      </Text>
                    </View>
                    <Callout>
                      <View style={styles.calloutContainer}>
                        <Text style={styles.calloutTitle}>{poi.title}</Text>
                        <Text style={styles.calloutCategory}>
                          {poi.description}
                        </Text>
                      </View>
                    </Callout>
                  </Marker>

                  {/* Route lines for paths (if available) */}
                  {poi.route &&
                    (poi.type === "bikeRoute" ||
                      poi.type === "runningPath") && (
                      <Polyline
                        key={`route-${poi.id}-${index}`}
                        coordinates={poi.route}
                        strokeColor={getPOIColor(poi.type)}
                        strokeWidth={4}
                      />
                    )}
                </React.Fragment>
              )
          )}
        </MapView>

        {/* Distance radius indicator - still useful to show the current filter */}
        {activeTab === "nearby" && (
          <View style={styles.distanceIndicator}>
            <View style={styles.radiusCircle} />
            <Text style={styles.radiusText}>{distanceFilter} km</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 300,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 10,
    marginHorizontal: 16,
  },
  mapContainer: {
    height: 250,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  map: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  calloutContainer: {
    padding: 5,
    maxWidth: 150,
  },
  calloutTitle: {
    fontWeight: "bold",
    fontSize: 12,
  },
  calloutCategory: {
    fontSize: 10,
    color: "#6B7280",
  },
  
  // POI marker styles
  poiMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  poiMarkerEmoji: {
    fontSize: 14,
  },
  
  // The distance indicator at bottom right
  distanceIndicator: {
    position: 'absolute',
    right: 10,
    bottom: 80,
    backgroundColor: 'rgba(16, 185, 129, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 100,
  },
  radiusCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginRight: 4,
  },
  radiusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default EventMap;
