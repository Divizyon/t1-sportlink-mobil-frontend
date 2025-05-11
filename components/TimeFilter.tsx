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
        >
          <Text
            style={[
              styles.filterText,
              selectedFilter === filter.name && styles.selectedFilterText,
            ]}
          >
            {filter.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  filter: {
    marginRight: 16,
    paddingBottom: 4,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  selectedFilter: {
    borderBottomColor: "#4CAF50",
  },
  filterText: {
    fontSize: 14,
    color: "#757575",
  },
  selectedFilterText: {
    color: "#4CAF50",
    fontWeight: "500",
  },
});
