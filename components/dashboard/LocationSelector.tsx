import React from "react";
import { StyleSheet, TouchableOpacity, Image, View } from "react-native";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { MapPin, ChevronDown, Tag } from "lucide-react-native";

interface LocationSelectorProps {
  label?: string;
  value: string;
  mapPreviewUrl?: string;
  onPress: () => void;
  error?: string;
  isCategory?: boolean;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  label,
  value,
  mapPreviewUrl,
  onPress,
  error,
  isCategory = false,
}) => {
  return (
    <Box style={styles.formGroup}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={[styles.locationSelector, error && styles.selectorError]}
        onPress={onPress}
      >
        <HStack style={styles.locationContent}>
          {isCategory ? (
            <Tag size={20} color="#10B981" style={styles.inputIcon} />
          ) : (
            <MapPin size={20} color="#10B981" style={styles.inputIcon} />
          )}
          <Text style={[styles.locationText, !value && styles.placeholderText]}>
            {value ||
              (isCategory ? "Kategori seçin" : "Etkinlik konumunu seçin")}
          </Text>
        </HStack>
        <ChevronDown size={20} color="#6B7280" />
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {!isCategory && value && mapPreviewUrl && (
        <Box style={styles.mapPreviewContainer}>
          <Image
            source={{ uri: mapPreviewUrl }}
            style={styles.mapPreview}
            resizeMode="cover"
          />
          <View style={styles.mapMarker} />
        </Box>
      )}
    </Box>
  );
};

const styles = StyleSheet.create({
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 6,
  },
  locationSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    backgroundColor: "white",
    padding: 12,
    height: 48,
  },
  selectorError: {
    borderColor: "#EF4444",
  },
  locationContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  inputIcon: {
    marginRight: 8,
  },
  locationText: {
    fontSize: 14,
    color: "#0F172A",
  },
  placeholderText: {
    color: "#9CA3AF",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 4,
  },
  mapPreviewContainer: {
    height: 150,
    marginTop: 12,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  mapPreview: {
    width: "100%",
    height: "100%",
  },
  mapMarker: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 20,
    height: 20,
    marginLeft: -10,
    marginTop: -20,
    borderRadius: 10,
    backgroundColor: "#10B981",
    borderWidth: 3,
    borderColor: "white",
  },
});

export default LocationSelector;
