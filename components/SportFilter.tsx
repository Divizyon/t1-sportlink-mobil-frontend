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
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sportFilter: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F0F2F5",
  },
  selectedSportFilter: {
    backgroundColor: "#E8F5E9",
  },
  sportIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  sportName: {
    fontSize: 14,
    color: "#616161",
  },
  selectedSportName: {
    color: "#4CAF50",
    fontWeight: "500",
  },
});
