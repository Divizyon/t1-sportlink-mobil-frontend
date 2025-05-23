import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { ChevronRight } from "lucide-react-native";

export type Category = {
  id: number;
  name: string;
  icon: string;
};

type CategoryGridProps = {
  title: string;
  categories: Category[];
  onCategoryPress: (category: Category) => void;
  onSeeAllPress?: () => void;
  columns?: number;
};

const CategoryGrid: React.FC<CategoryGridProps> = ({
  title,
  categories,
  onCategoryPress,
  onSeeAllPress,
  columns = 4,
}) => {
  // Kategori renkleri
  const categoryColors = [
    "#F97316", // Turuncu
    "#22C55E", // Yeşil
    "#3B82F6", // Mavi
    "#EAB308", // Sarı
    "#EC4899", // Pembe
    "#8B5CF6", // Mor
    "#14B8A6", // Turkuaz
    "#EF4444", // Kırmızı
  ];

  // Kategori için renk seçimi
  const getCategoryColor = (index: number) => {
    return categoryColors[index % categoryColors.length];
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
      </View>

      <FlatList
        data={categories}
        numColumns={columns}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[
              styles.categoryItem,
              { backgroundColor: `${getCategoryColor(index)}15` }, // %15 opaklıkta arka plan
              { width: `${100 / columns - 2}%` }, // Sütun sayısına göre genişlik
            ]}
            onPress={() => onCategoryPress(item)}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: getCategoryColor(index) },
              ]}
            >
              <Text style={styles.categoryIcon}>{item.icon}</Text>
            </View>
            <Text style={styles.categoryName} numberOfLines={1}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.gridContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeAllText: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "600",
    marginRight: 2,
  },
  gridContainer: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  categoryItem: {
    flex: 1,
    margin: "1%",
    aspectRatio: 1,
    borderRadius: 10,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  categoryIcon: {
    fontSize: 18,
  },
  categoryName: {
    fontSize: 10,
    fontWeight: "600",
    color: "#0F172A",
    textAlign: "center",
  },
});

export default CategoryGrid;
