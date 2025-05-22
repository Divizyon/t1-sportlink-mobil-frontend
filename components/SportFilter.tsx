import React from "react";
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from "react-native";

interface Sport {
  id: string;
  name: string;
  icon: string;
}

interface SportFilterProps {
  sports: Sport[];
  selectedSport: string;
  onSelectSport: (sportName: string) => void;
}

export const SportFilter: React.FC<SportFilterProps> = ({
  sports,
  selectedSport,
  onSelectSport,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {sports.map((sport) => (
        <TouchableOpacity
          key={sport.id}
          style={[
            styles.sportFilter,
            selectedSport === sport.name && styles.selectedSportFilter,
          ]}
          onPress={() => onSelectSport(sport.name)}
          activeOpacity={0.7}
        >
          <Text style={styles.sportIcon}>{sport.icon}</Text>
          <Text
            style={[
              styles.sportName,
              selectedSport === sport.name && styles.selectedSportName,
            ]}
          >
            {sport.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sportFilter: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 30,
    backgroundColor: "#f1f5f9",
    shadowColor: "#64748b",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedSportFilter: {
    backgroundColor: "#dcfce7",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sportIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  sportName: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  selectedSportName: {
    color: "#10b981",
    fontWeight: "600",
  },
});
