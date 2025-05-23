import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  View,
} from "react-native";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import {
  FormControl,
  FormControlLabel,
  FormControlError,
} from "@/components/ui/form-control";
import { Button, ButtonText } from "@/components/ui/button";
import { X, ChevronDown } from "lucide-react-native";
import { sportsApi } from "@/services/api/sports";

interface Sport {
  id: number;
  name: string;
  icon?: string;
}

interface SportSelectorProps {
  label: string;
  value: number;
  onChange: (sportId: number) => void;
  error?: string;
}

export default function SportSelector({
  label,
  value,
  onChange,
  error,
}: SportSelectorProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [sports, setSports] = useState<Sport[]>([]);
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);

  useEffect(() => {
    loadSports();
  }, []);

  useEffect(() => {
    if (value && sports.length > 0) {
      const sport = sports.find((s) => s.id === value);
      if (sport) {
        setSelectedSport(sport);
      }
    }
  }, [value, sports]);

  const loadSports = async () => {
    try {
      const response = await sportsApi.getAllSports();
      if (Array.isArray(response)) {
        setSports(response);
      }
    } catch (error) {
      console.error("Spor kategorileri yüklenirken hata:", error);
    }
  };

  const handleSelect = (sport: Sport) => {
    setSelectedSport(sport);
    onChange(sport.id);
    setIsVisible(false);
  };

  return (
    <>
      <FormControl isInvalid={!!error}>
        <FormControlLabel>{label}</FormControlLabel>
        <TouchableOpacity
          style={[styles.selector, error ? styles.selectorError : null]}
          onPress={() => setIsVisible(true)}
        >
          <Text style={styles.selectorText}>
            {selectedSport ? selectedSport.name : "Spor türü seçin"}
          </Text>
          <ChevronDown size={20} color="#6B7280" />
        </TouchableOpacity>
        {error && <FormControlError>{error}</FormControlError>}
      </FormControl>

      <Modal
        visible={isVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Box style={styles.modalContent}>
            <Box style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Spor Türü Seç</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsVisible(false)}
              >
                <X size={24} color="#0F172A" />
              </TouchableOpacity>
            </Box>

            <FlatList
              data={sports}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.sportItem,
                    selectedSport?.id === item.id && styles.selectedSportItem,
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={styles.sportItemText}>
                    {item.icon} {item.name}
                  </Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.sportList}
            />
          </Box>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 25,
    backgroundColor: "#F8FAFC",
    padding: 16,
    height: 56,
  },
  selectorError: {
    borderColor: "#EF4444",
  },
  selectorText: {
    fontSize: 16,
    color: "#0F172A",
  },
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
  sportList: {
    paddingBottom: 16,
  },
  sportItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  selectedSportItem: {
    backgroundColor: "#EFF6FF",
  },
  sportItemText: {
    fontSize: 16,
    color: "#0F172A",
  },
});
