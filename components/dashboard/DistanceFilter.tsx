import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { Filter } from "lucide-react-native";

// Tema renkleri - daha açık, yumuşak yeşil
const theme = {
  primary: "#34D399", // Açık, yumuşak yeşil
  primaryLight: "#ECFDF5", // Çok açık yeşil
  primaryDark: "#10B981", // Orta yeşil
  secondary: "#F3F4F6", // Arka plan gri
  border: "#E2E8F0", // Kenar rengi
  background: "#FFFFFF", // Kart arkaplanı
  text: "#0F172A", // Ana metin
  textSecondary: "#64748B", // İkincil metin
};

interface DistanceFilterProps {
  distance: number;
  onDistanceChange: (distance: number) => void;
}

const DistanceFilter: React.FC<DistanceFilterProps> = ({
  distance,
  onDistanceChange,
}) => {
  // Mesafe aralıkları
  const distanceOptions = [5, 10, 15, 20];

  return (
    <Box style={styles.filterSection}>
      <HStack style={styles.filterHeader}>
        <HStack style={styles.filterTitle}>
          <Filter size={18} color={theme.text} style={{ marginRight: 6 }} />
          <Text style={styles.filterTitleText}>Mesafe Filtresi</Text>
        </HStack>
        <Text style={styles.filterValue}>{distance} km</Text>
      </HStack>

      <View style={styles.sliderContainer}>
        <View style={styles.sliderTrack}>
          <View
            style={[styles.sliderFill, { width: `${(distance / 20) * 100}%` }]}
          />
          <View style={styles.sliderMarkers}>
            {distanceOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.sliderMarker,
                  distance >= option && styles.sliderMarkerActive,
                ]}
                onPress={() => onDistanceChange(option)}
              />
            ))}
          </View>
        </View>
        <HStack style={styles.sliderLabels}>
          <Text style={styles.sliderLabel}>5km</Text>
          <Text style={styles.sliderLabel}>10km</Text>
          <Text style={styles.sliderLabel}>15km</Text>
          <Text style={styles.sliderLabel}>20km</Text>
        </HStack>
      </View>
    </Box>
  );
};

const styles = StyleSheet.create({
  filterSection: {
    backgroundColor: theme.background,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  filterTitle: {
    flexDirection: "row",
    alignItems: "center",
  },
  filterTitleText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.text,
  },
  filterValue: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.primary,
  },
  sliderContainer: {
    paddingHorizontal: 8,
  },
  sliderTrack: {
    height: 4,
    backgroundColor: theme.border,
    borderRadius: 2,
    marginBottom: 8,
    position: "relative",
  },
  sliderFill: {
    height: 4,
    backgroundColor: theme.primary,
    borderRadius: 2,
    position: "absolute",
    left: 0,
    top: 0,
  },
  sliderMarkers: {
    flexDirection: "row",
    justifyContent: "space-between",
    position: "absolute",
    width: "100%",
    height: 4,
  },
  sliderMarker: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.background,
    borderWidth: 2,
    borderColor: theme.border,
    marginTop: -6,
  },
  sliderMarkerActive: {
    borderColor: theme.primary,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  sliderLabel: {
    fontSize: 12,
    color: theme.textSecondary,
  },
});

export default DistanceFilter;
