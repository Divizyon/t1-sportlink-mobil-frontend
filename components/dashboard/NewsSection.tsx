import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { ChevronRight } from "lucide-react-native";
import { router } from "expo-router";
import { News } from "@/services/newsService";
import LoadingAnimation from "../animations/LoadingAnimations";

interface NewsSectionProps {
  title: string;
  news: News[];
  onNewsPress: (newsId: number) => void;
  onSeeAllPress?: () => void;
  emptyMessage?: string;
  loading?: boolean;
}

const NewsSection: React.FC<NewsSectionProps> = ({
  title,
  news,
  onNewsPress,
  onSeeAllPress,
  emptyMessage = "Şu an haber bulunmuyor",
  loading = false,
}) => {
  const handleSeeAllPress = () => {
    if (onSeeAllPress) {
      onSeeAllPress();
    } else {
      router.push("/news");
    }
  };

  // Haber kartı bileşeni
  const NewsCard = ({ item }: { item: News }) => {
    return (
      <TouchableOpacity
        style={styles.newsCard}
        onPress={() => onNewsPress(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.imageContainer}>
          {item.image_url ? (
            <Image
              source={{ uri: item.image_url }}
              style={styles.newsImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.newsImage, styles.placeholderImage]}>
              <Text style={styles.placeholderText}>SportLink</Text>
            </View>
          )}
          {item.Sports && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {item.Sports.name || "Genel"}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.newsContent}>
          <Text style={styles.newsTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.newsDate}>
            {formatDate(item.published_date || item.created_at || "")}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Tarih formatını düzenleme
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date);
    } catch (error) {
      return dateString;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity
          onPress={handleSeeAllPress}
          style={styles.seeAllButton}
        >
          <Text style={styles.seeAllText}>Tümünü Gör</Text>
          <ChevronRight size={16} color="#10B981" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <View style={styles.centerLoadingContainer}>
            <LoadingAnimation size={60} />
            <Text style={styles.centerLoadingText}>Haberler yükleniyor...</Text>
          </View>
          {/* Skeleton loading placeholders */}
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[1, 2, 3]}
            keyExtractor={(item) => item.toString()}
            renderItem={() => (
              <View style={styles.skeletonCard}>
                <View style={styles.skeletonImage} />
                <View style={styles.skeletonContent}>
                  <View style={styles.skeletonTitle} />
                  <View style={styles.skeletonText} />
                </View>
              </View>
            )}
            contentContainerStyle={styles.listContent}
          />
        </View>
      ) : news.length > 0 ? (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={news}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <NewsCard item={item} />}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
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
  listContent: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  emptyContainer: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    marginHorizontal: 16,
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
  },
  loadingContainer: {
    height: 200,
  },
  centerLoadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  centerLoadingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#10B981",
    marginTop: 12,
  },
  skeletonCard: {
    width: 250,
    height: 180,
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    marginRight: 12,
    overflow: "hidden",
  },
  skeletonImage: {
    height: 120,
    backgroundColor: "#E2E8F0",
  },
  skeletonContent: {
    padding: 12,
  },
  skeletonTitle: {
    height: 18,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    marginBottom: 8,
    width: "80%",
  },
  skeletonText: {
    height: 12,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    marginBottom: 6,
    width: "60%",
  },
  newsCard: {
    width: 250,
    height: 200,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginRight: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    height: 120,
    position: "relative",
  },
  newsImage: {
    width: "100%",
    height: "100%",
  },
  categoryBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(16, 185, 129, 0.85)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  newsContent: {
    padding: 12,
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 6,
    lineHeight: 18,
  },
  newsDate: {
    fontSize: 12,
    color: "#64748B",
  },
  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});

export default NewsSection;
