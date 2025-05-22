import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

interface TimeFilterOption {
  id: string;
  name: string;
}

interface TimeFilterProps {
  filters: TimeFilterOption[];
  selectedFilter: string;
  onSelectFilter: (filterName: string) => void;
}

export const TimeFilter: React.FC<TimeFilterProps> = ({
  filters,
  selectedFilter,
  onSelectFilter,
}) => {
  return (
    <View style={styles.container}>
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter.id}
          style={[
            styles.filter,
            selectedFilter === filter.name && styles.selectedFilter,
          ]}
          onPress={() => onSelectFilter(filter.name)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filterText,
              selectedFilter === filter.name && styles.selectedFilterText,
            ]}
          >
            {filter.name}
          </Text>
          {selectedFilter === filter.name && <View style={styles.indicator} />}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 10,
  },
  filter: {
    marginRight: 24,
    paddingVertical: 6,
    position: "relative",
  },
  selectedFilter: {},
  filterText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  selectedFilterText: {
    color: "#10b981",
    fontWeight: "600",
  },
  indicator: {
    position: "absolute",
    bottom: -2,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "#10b981",
    borderRadius: 1.5,
  },
});
