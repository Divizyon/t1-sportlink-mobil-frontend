import React, { useState } from "react";
import {
  StyleSheet,
  Modal,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Button, ButtonText } from "@/components/ui/button";
import { X, Search, MapPin, Check } from "lucide-react-native";

interface Location {
  id: number;
  name: string;
  address: string;
  distance?: string;
  image?: string;
}

interface LocationSelectorModalProps {
  visible: boolean;
  onSelect: (location: string) => void;
  onClose: () => void;
}

// Örnek konum verileri - gerçek uygulamada API'dan gelir
const mockLocations: Location[] = [
  {
    id: 1,
    name: "Konya Spor Kompleksi",
    address: "Selçuklu, Konya",
    distance: "1.2 km",
    image: "https://picsum.photos/600/200",
  },
  {
    id: 2,
    name: "Meram Futbol Sahası",
    address: "Meram, Konya",
    distance: "2.5 km",
    image: "https://picsum.photos/600/201",
  },
  {
    id: 3,
    name: "Selçuklu Kapalı Spor Salonu",
    address: "Selçuklu, Konya",
    distance: "3.7 km",
    image: "https://picsum.photos/600/202",
  },
  {
    id: 4,
    name: "Konya Atatürk Stadyumu",
    address: "Selçuklu, Konya",
    distance: "4.1 km",
    image: "https://picsum.photos/600/203",
  },
];

const LocationSelectorModal: React.FC<LocationSelectorModalProps> = ({
  visible,
  onSelect,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );

  const filteredLocations = searchQuery
    ? mockLocations.filter(
        (location) =>
          location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          location.address.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : mockLocations;

  const handleSelectLocation = (location: Location) => {
    setSelectedLocation(location);
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onSelect(selectedLocation.name);
    }
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Box style={styles.modalOverlay}>
        <Box style={styles.modalContent}>
          <HStack style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Konum Seçin</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#64748B" />
            </TouchableOpacity>
          </HStack>

          {/* Arama kutusu */}
          <Box style={styles.searchContainer}>
            <Search size={20} color="#64748B" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Konum ara..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                style={styles.clearButton}
              >
                <X size={16} color="#64748B" />
              </TouchableOpacity>
            )}
          </Box>

          {/* Konum listesi */}
          <FlatList
            data={filteredLocations}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.locationItem,
                  selectedLocation?.id === item.id &&
                    styles.selectedLocationItem,
                ]}
                onPress={() => handleSelectLocation(item)}
              >
                <HStack style={styles.locationContent}>
                  <MapPin
                    size={20}
                    color="#4F46E5"
                    style={styles.locationIcon}
                  />
                  <VStack style={styles.locationInfo}>
                    <Text style={styles.locationName}>{item.name}</Text>
                    <Text style={styles.locationAddress}>
                      {item.address} {item.distance && `(${item.distance})`}
                    </Text>
                  </VStack>
                  {selectedLocation?.id === item.id && (
                    <Check size={20} color="#4F46E5" />
                  )}
                </HStack>

                {item.image && selectedLocation?.id === item.id && (
                  <Box style={styles.mapPreviewContainer}>
                    <Image
                      source={{ uri: item.image }}
                      style={styles.mapPreview}
                      resizeMode="cover"
                    />
                  </Box>
                )}
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.locationList}
          />

          <Button
            style={styles.confirmButton}
            onPress={handleConfirm}
            disabled={!selectedLocation}
          >
            <ButtonText>Konum Seç</ButtonText>
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
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
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: "#0F172A",
  },
  clearButton: {
    padding: 8,
  },
  locationList: {
    paddingBottom: 16,
  },
  locationItem: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: "#F8FAFC",
  },
  selectedLocationItem: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#4F46E5",
  },
  locationContent: {
    alignItems: "center",
  },
  locationIcon: {
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },
  locationAddress: {
    fontSize: 14,
    color: "#64748B",
  },
  mapPreviewContainer: {
    height: 120,
    marginTop: 12,
    borderRadius: 8,
    overflow: "hidden",
  },
  mapPreview: {
    width: "100%",
    height: "100%",
  },
  confirmButton: {
    marginTop: 8,
  },
});

export default LocationSelectorModal;
