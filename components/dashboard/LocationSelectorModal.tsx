import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Modal,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Keyboard,
  Alert,
} from "react-native";
import { Text } from "@/components/ui/text";
import { X, Search, MapPin } from "lucide-react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { Button, ButtonText } from "@/components/ui/button";

interface LocationSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (
    locationName: string,
    coordinates: { latitude: number; longitude: number }
  ) => void;
}

export default function LocationSelectorModal({
  visible,
  onClose,
  onSelect,
}: LocationSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    name: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Haritanın mevcut bölgesini ve zoom seviyesini takip eden state
  const [currentRegion, setCurrentRegion] = useState({
    latitude: 39.925533, // Türkiye merkezi
    longitude: 32.866287,
    latitudeDelta: 5, // Başlangıçta orta seviye zoom
    longitudeDelta: 5,
  });

  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (visible) {
      getCurrentLocation();
      setSearchQuery("");
    }
  }, [visible]);

  const getCurrentLocation = async () => {
    setIsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Konum izni reddedildi");
        // Default konum Konya merkez
        const defaultLocation = {
          latitude: 37.874641,
          longitude: 32.493156,
        };
        setUserLocation(defaultLocation);
        setSelectedLocation({
          ...defaultLocation,
          name: "Konya Merkez",
        });

        // Haritayı varsayılan konuma odakla ama zoom seviyesini değiştirme
        setCurrentRegion((prev) => ({
          ...prev,
          latitude: defaultLocation.latitude,
          longitude: defaultLocation.longitude,
        }));

        return;
      }

      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const userLoc = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        setUserLocation(userLoc);

        // Kullanıcı konumunun adını bul
        const [address] = await Location.reverseGeocodeAsync(userLoc);
        const locationName = formatAddress(address);

        setSelectedLocation({
          ...userLoc,
          name: locationName,
        });

        // Haritayı kullanıcı konumuna odakla ama zoom seviyesini değiştirme
        setCurrentRegion((prev) => ({
          ...prev,
          latitude: userLoc.latitude,
          longitude: userLoc.longitude,
        }));
      } catch (error) {
        console.log("Konum alınamadı, varsayılan konum kullanılıyor");
        // Konum alınamazsa Konya merkez
        const defaultLocation = {
          latitude: 37.874641,
          longitude: 32.493156,
        };
        setUserLocation(defaultLocation);
        setSelectedLocation({
          ...defaultLocation,
          name: "Konya Merkez",
        });

        // Haritayı varsayılan konuma odakla ama zoom seviyesini değiştirme
        setCurrentRegion((prev) => ({
          ...prev,
          latitude: defaultLocation.latitude,
          longitude: defaultLocation.longitude,
        }));
      }
    } catch (error) {
      console.error("Konum alınamadı:", error);
      // Default konum
      const defaultLocation = {
        latitude: 37.874641,
        longitude: 32.493156,
      };
      setUserLocation(defaultLocation);
      setSelectedLocation({
        ...defaultLocation,
        name: "Konya Merkez",
      });

      // Haritayı varsayılan konuma odakla ama zoom seviyesini değiştirme
      setCurrentRegion((prev) => ({
        ...prev,
        latitude: defaultLocation.latitude,
        longitude: defaultLocation.longitude,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Harita bölgesi değişikliğini izleme
  const handleRegionChange = (region: any) => {
    setCurrentRegion(region);
  };

  // Adres bilgilerini formatlama
  const formatAddress = (
    address: Location.LocationGeocodedAddress | null
  ): string => {
    if (!address) return "Seçilen Konum";

    const parts = [
      address.name,
      address.street,
      address.district,
      address.city,
      address.region,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(", ") : "Seçilen Konum";
  };

  const handleMapPress = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setIsLoading(true);

    try {
      // Mevcut zoom seviyesini koruyarak sadece konumu güncelle
      const newRegion = {
        ...currentRegion,
        latitude,
        longitude,
      };

      // Haritayı yeni konuma odakla ama zoom seviyesini koru
      mapRef.current?.animateToRegion(newRegion, 300);

      const [location] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      const locationName = formatAddress(location);

      setSelectedLocation({
        latitude,
        longitude,
        name: locationName,
      });
    } catch (error) {
      console.error("Adres bulunamadı:", error);
      setSelectedLocation({
        latitude,
        longitude,
        name: "Seçilen Konum",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      return;
    }

    Keyboard.dismiss();
    setIsSearching(true);

    try {
      const locations = await Location.geocodeAsync(searchQuery);

      if (locations.length > 0) {
        const { latitude, longitude } = locations[0];

        // Arama sonuçlarında makul bir zoom seviyesi kullan
        const newRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.1, // Şehir seviyesi için uygun zoom
          longitudeDelta: 0.1,
        };

        // Haritayı arama konumuna odakla
        mapRef.current?.animateToRegion(newRegion, 500);
        setCurrentRegion(newRegion);

        // Bu konumun adresini bul
        const [address] = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        const locationName = formatAddress(address);

        setSelectedLocation({
          latitude,
          longitude,
          name: locationName || searchQuery,
        });
      } else {
        Alert.alert(
          "Uyarı",
          "Aradığınız konum bulunamadı. Lütfen başka bir arama yapın."
        );
      }
    } catch (error) {
      console.error("Arama hatası:", error);
      Alert.alert("Hata", "Konum araması sırasında bir hata oluştu.");
    } finally {
      setIsSearching(false);
    }
  };

  // Zoom seviyesini artırma fonksiyonu
  const zoomIn = () => {
    if (mapRef.current && selectedLocation) {
      // Mevcut konumu koruyarak, zoom seviyesini artır
      const zoomDelta = currentRegion.latitudeDelta / 2; // Zoom in: daha küçük delta = daha yakın zoom

      const newRegion = {
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        latitudeDelta: zoomDelta,
        longitudeDelta: zoomDelta,
      };

      mapRef.current.animateToRegion(newRegion, 300);
      setCurrentRegion(newRegion);
    }
  };

  // Zoom seviyesini azaltma fonksiyonu
  const zoomOut = () => {
    if (mapRef.current && selectedLocation) {
      // Mevcut konumu koruyarak, zoom seviyesini azalt
      const zoomDelta = currentRegion.latitudeDelta * 2; // Zoom out: daha büyük delta = daha uzak zoom

      const newRegion = {
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        latitudeDelta: zoomDelta,
        longitudeDelta: zoomDelta,
      };

      mapRef.current.animateToRegion(newRegion, 300);
      setCurrentRegion(newRegion);
    }
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onSelect(selectedLocation.name, {
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
      });
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Konum Seç</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#0F172A" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Konum ara..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
          >
            {isSearching ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Search size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text style={styles.loadingText}>Konum alınıyor...</Text>
          </View>
        ) : (
          <View style={styles.mapContainer}>
            <MapView
              ref={mapRef}
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              onPress={handleMapPress}
              moveOnMarkerPress={false}
              zoomEnabled={true}
              zoomControlEnabled={false}
              rotateEnabled={true}
              scrollEnabled={true}
              toolbarEnabled={true}
              minZoomLevel={3}
              maxZoomLevel={19}
              initialRegion={currentRegion}
              onRegionChangeComplete={handleRegionChange}
            >
              {selectedLocation && (
                <Marker
                  coordinate={{
                    latitude: selectedLocation.latitude,
                    longitude: selectedLocation.longitude,
                  }}
                  pinColor="#FF3B30"
                />
              )}
            </MapView>

            {/* Özel zoom kontrolleri */}
            <View style={styles.zoomControls}>
              <TouchableOpacity style={styles.zoomButton} onPress={zoomIn}>
                <Text style={styles.zoomButtonText}>+</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.zoomButton} onPress={zoomOut}>
                <Text style={styles.zoomButtonText}>−</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {selectedLocation && (
          <View style={styles.footer}>
            <View style={styles.selectedLocation}>
              <MapPin size={20} color="#4F46E5" />
              <Text style={styles.locationText} numberOfLines={2}>
                {selectedLocation.name}
              </Text>
            </View>
            <Button onPress={handleConfirm} style={styles.confirmButton}>
              <ButtonText>Konumu Seç</ButtonText>
            </Button>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    margin: 16,
    backgroundColor: "#F1F5F9",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#0F172A",
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  searchButton: {
    backgroundColor: "#4F46E5",
    padding: 10,
    borderRadius: 20,
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  mapContainer: {
    flex: 1,
    overflow: "hidden",
    position: "relative",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  selectedLocation: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#0F172A",
    flex: 1,
  },
  confirmButton: {
    width: "100%",
    borderRadius: 25,
    backgroundColor: "#4F46E5",
  },
  zoomControls: {
    position: "absolute",
    right: 16,
    top: 16,
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 8,
    padding: 4,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  zoomButton: {
    backgroundColor: "#4F46E5",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 4,
  },
  zoomButtonText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
    lineHeight: 24,
  },
});
