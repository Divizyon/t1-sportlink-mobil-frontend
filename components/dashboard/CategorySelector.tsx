import React from "react";
import { StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Text } from "@/components/ui/text";

// Tema renkleri - daha koyu, yumuşak yeşil
const theme = {
  primary: "#10B981", // Daha koyu, yumuşak yeşil (eski: #34D399)
  primaryLight: "#D1FAE5", // Açık yeşil (eski: #ECFDF5)
  primaryDark: "#059669", // Koyu yeşil (eski: #10B981)
  background: "#FFFFFF", // Arka plan
  text: "#0F172A", // Ana metin
  textSecondary: "#64748B", // İkincil metin
};

interface Category {
  id: number;
  name: string;
  icon: string;
}

interface CategorySelectorProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoriesContainer}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryItem,
            selectedCategory === category.name && styles.selectedCategory,
          ]}
          onPress={() => onSelectCategory(category.name)}
        >
          <Text style={styles.categoryIcon}>{category.icon}</Text>
          <Text
            style={[
              styles.categoryName,
              selectedCategory === category.name && styles.selectedCategoryText,
            ]}
          >
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  categoriesContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  categoryItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 10,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
  },
  selectedCategory: {
    backgroundColor: theme.primary,
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: "500",
    color: theme.text,
  },
  selectedCategoryText: {
    color: "white",
  },
});

export default CategorySelector;
