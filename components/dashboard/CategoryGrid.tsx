import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { ChevronRight } from "lucide-react-native";
import FootballAnimation from "../animations/FootballAnimation";
import BicycleAnimation from "../animations/BicycleAnimation";
import BasketballAnimation from "../animations/BasketballAnimation";
import WalkingAnimation from "../animations/WalkingAnimation";
import YogaAnimation from "../animations/YogaAnimation";
import RunningAnimation from "../animations/RunningAnimation";

export type Category = {
  id: number;
  name: string;
  icon: string;
};

interface CategoryGridProps {
  title: string;
  categories: Category[];
  onCategoryPress: (category: Category) => void;
  onSeeAllPress?: () => void;
  columns?: number;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({
  title,
  categories,
  onCategoryPress,
  onSeeAllPress,
  columns = 4,
}) => {
  const [activeAnimation, setActiveAnimation] = useState<number | null>(null);

  // Kategori renkleri
  const categoryColors = [
    "#F97316", // Turuncu
    "#22C55E", // Yeşil
    "#3B82F6", // Mavi
    "#A855F7", // Mor
    "#EC4899", // Pembe
    "#14B8A6", // Turkuaz
    "#F59E0B", // Sarı
    "#6366F1", // İndigo
  ];

  const handleCategoryPress = (category: Category) => {
    const needsAnimation = 
      category.name.toLowerCase() === "futbol" || 
      category.name.toLowerCase() === "bisiklet" ||
      category.name.toLowerCase() === "basketbol" ||
      category.name.toLowerCase() === "yürüyüş" ||
      category.name.toLowerCase() === "yoga" ||
      category.name.toLowerCase() === "koşu";

    if (needsAnimation) {
      setActiveAnimation(category.id);
      // 1 saniye sonra animasyonu durdur ve yönlendirmeyi yap
      setTimeout(() => {
        setActiveAnimation(null);
        onCategoryPress(category);
      }, 1000);
    } else {
      // Animasyon gerektirmeyen kategoriler için direkt yönlendirme yap
      onCategoryPress(category);
    }
  };

  const renderItem = ({ item, index }: { item: Category; index: number }) => {
    const isFootball = item.name.toLowerCase() === "futbol";
    const isBicycle = item.name.toLowerCase() === "bisiklet";
    const isBasketball = item.name.toLowerCase() === "basketbol";
    const isWalking = item.name.toLowerCase() === "yürüyüş";
    const isYoga = item.name.toLowerCase() === "yoga";
    const isRunning = item.name.toLowerCase() === "koşu";
    const showAnimation = activeAnimation === item.id;

    return (
      <TouchableOpacity
        style={[
          styles.categoryItem,
          { backgroundColor: categoryColors[index % categoryColors.length] },
        ]}
        onPress={() => handleCategoryPress(item)}
      >
        <View style={styles.iconContainer}>
          {isFootball && showAnimation ? (
            <FootballAnimation play={showAnimation} style={styles.animation} />
          ) : isBicycle && showAnimation ? (
            <BicycleAnimation play={showAnimation} style={styles.animation} />
          ) : isBasketball && showAnimation ? (
            <BasketballAnimation play={showAnimation} style={styles.animation} />
          ) : isWalking ? (
            <WalkingAnimation play={showAnimation} style={styles.animation} />
          ) : isYoga && showAnimation ? (
            <YogaAnimation play={showAnimation} style={styles.animation} />
          ) : isRunning ? (
            <RunningAnimation play={showAnimation} style={styles.animation} />
          ) : (
            <Text style={styles.icon}>{item.icon}</Text>
          )}
        </View>
        <Text style={styles.categoryName} numberOfLines={1}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {onSeeAllPress && (
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={onSeeAllPress}
          >
            <Text style={styles.seeAllText}>Tümünü Gör</Text>
            <ChevronRight size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={categories}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={columns}
        scrollEnabled={false}
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
    marginBottom: 10,
    paddingHorizontal: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeAllText: {
    color: "#666",
    marginRight: 4,
  },
  gridContainer: {
    paddingHorizontal: 10,
  },
  categoryItem: {
    flex: 1,
    margin: 5,
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 90,
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  icon: {
    fontSize: 24,
  },
  animation: {
    width: 40,
    height: 40,
  },
  categoryName: {
    color: "white",
    fontSize: 12,
    textAlign: "center",
    fontWeight: "500",
  },
});

export default CategoryGrid;
