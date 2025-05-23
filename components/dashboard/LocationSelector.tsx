import React from "react";
import { StyleSheet, TouchableOpacity, View, Dimensions } from "react-native";
import { Text } from "@/components/ui/text";
import {
  FormControl,
  FormControlLabel,
  FormControlError,
} from "@/components/ui/form-control";
import { MapPin } from "lucide-react-native";
import MapView, { Marker } from "react-native-maps";

interface LocationSelectorProps {
  label: string;
  value: string;
  onPress: () => void;
  error?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export default function LocationSelector({
  label,
  value,
  onPress,
  error,
  coordinates,
}: LocationSelectorProps) {
  return (
    <FormControl isInvalid={!!error}>
      <FormControlLabel>{label}</FormControlLabel>
      <TouchableOpacity
        style={[styles.selector, error ? styles.selectorError : null]}
        onPress={onPress}
      >
        <View style={styles.locationInfo}>
          <MapPin size={20} color="#6B7280" />
          <Text style={styles.selectorText}>{value || "Konum seçin"}</Text>
        </View>
      </TouchableOpacity>

      {coordinates && (
        <View style={styles.mapPreview}>
          <MapView
            style={styles.map}
            region={{
              latitude: coordinates.latitude,
              longitude: coordinates.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            initialRegion={{
              latitude: coordinates.latitude,
              longitude: coordinates.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
          >
            <Marker
              coordinate={{
                latitude: coordinates.latitude,
                longitude: coordinates.longitude,
              }}
            />
          </MapView>
        </View>
      )}

      {error && <FormControlError>{error}</FormControlError>}
    </FormControl>
  );
}

const styles = StyleSheet.create({
  selector: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 25,
    backgroundColor: "#F8FAFC",
    padding: 16,
    minHeight: 56,
  },
  selectorError: {
    borderColor: "#EF4444",
  },
  selectorText: {
    fontSize: 16,
    color: "#0F172A",
    marginLeft: 8,
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  mapPreview: {
    marginTop: 8,
    height: 200,
    borderRadius: 25,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  map: {
    width: "100%",
    height: "100%",
  },
});
