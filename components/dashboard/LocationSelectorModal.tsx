import React, { useState, useEffect } from 'react';
import { StyleSheet, Modal, View, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';
import { X, Search, MapPin } from 'lucide-react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Button, ButtonText } from '@/components/ui/button';

interface LocationSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (locationName: string, coordinates: { latitude: number; longitude: number }) => void;
}

export default function LocationSelectorModal({
  visible,
  onClose,
  onSelect,
}: LocationSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    name: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    if (visible) {
      getCurrentLocation();
    }
  }, [visible]);

  const getCurrentLocation = async () => {
    setIsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Konum izni reddedildi');
        return;
      }

      const initialLocation = {
        latitude: 37.874641,
        longitude: 32.493156,
      };
      setUserLocation(initialLocation);
      setSelectedLocation({
        ...initialLocation,
        name: 'Seçilen Konum',
      });
    } catch (error) {
      console.error('Konum alınamadı:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMapPress = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    try {
      const [location] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      const locationName = location
        ? `${location.street || ''} ${location.name || ''}, ${location.district || ''}, ${location.city || ''}`
        : 'Seçilen Konum';

      setSelectedLocation({
        latitude,
        longitude,
        name: locationName.trim(),
      });
    } catch (error) {
      console.error('Adres bulunamadı:', error);
      setSelectedLocation({
        latitude,
        longitude,
        name: 'Seçilen Konum',
      });
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
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Konum Seç</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#0F172A" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Search size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Konum ara..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text style={styles.loadingText}>Konum alınıyor...</Text>
          </View>
        ) : (
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={userLocation ? {
                ...userLocation,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              } : undefined}
              onPress={handleMapPress}
            >
              {selectedLocation && (
                <Marker
                  coordinate={{
                    latitude: selectedLocation.latitude,
                    longitude: selectedLocation.longitude,
                  }}
                />
              )}
            </MapView>
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
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    margin: 16,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  mapContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  selectedLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#0F172A',
    flex: 1,
  },
  confirmButton: {
    width: '100%',
  },
});
