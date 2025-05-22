import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  News,
  fetchNewsById,
  fetchAnnouncementById,
} from "../../../services/newsService";

// Direkt renk tanımları
const colors = {
  primary: "#10b981",
  primaryLight: "#a7f3d0",
  primaryDark: "#059669",
  secondary: "#059669",
  background: "#ffffff",
  white: "#ffffff",
  text: "#1e293b",
  darkGray: "#4a5568",
  gray: "#a0aec0",
  lightGray: "#f1f5f9",
  error: "#ef4444",
  success: "#10b981",
  gradient1: "#10b981",
  gradient2: "#059669",
};

const NewsDetailScreen = () => {
  const { id, type } = useLocalSearchParams<{ id: string; type?: string }>();
  const router = useRouter();
  const [newsItem, setNewsItem] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const isAnnouncement = type === "announcement";

  useEffect(() => {
    const loadDetail = async () => {
      try {
        setLoading(true);

        // ID'ye göre içeriği çek (duyuru veya haber)
        const response = isAnnouncement
          ? await fetchAnnouncementById(id as string)
          : await fetchNewsById(id as string);

        if (response.success && response.data) {
          setNewsItem(response.data);
          setError("");
        } else {
          setError(isAnnouncement ? "Duyuru bulunamadı" : "Haber bulunamadı");
        }
      } catch (err) {
        console.error(
          `Error fetching ${isAnnouncement ? "announcement" : "news"} detail:`,
          err
        );
        setError(
          `${isAnnouncement ? "Duyuru" : "Haber"} yüklenirken bir hata oluştu`
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadDetail();
    }
  }, [id, isAnnouncement]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar style="light" />
        <LinearGradient
          colors={[colors.gradient1, colors.gradient2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {isAnnouncement ? "Duyuru Detayı" : "Haber Detayı"}
            </Text>
            <View style={styles.placeholder} />
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !newsItem) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar style="light" />
        <LinearGradient
          colors={[colors.gradient1, colors.gradient2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {isAnnouncement ? "Duyuru Detayı" : "Haber Detayı"}
            </Text>
            <View style={styles.placeholder} />
          </View>
        </LinearGradient>
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={60}
            color={colors.error}
          />
          <Text style={styles.errorText}>{error || "İçerik bulunamadı"}</Text>
          <TouchableOpacity
            style={styles.backToListButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backToListText}>
              {isAnnouncement ? "Duyurulara Dön" : "Haberlere Dön"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[colors.gradient1, colors.gradient2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {newsItem.title}
          </Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {newsItem.image_url ? (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: newsItem.image_url }}
              style={styles.heroImage}
              resizeMode="cover"
              loadingIndicatorSource={require("../../../assets/images/logo.png")}
              progressiveRenderingEnabled={true}
            />
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.5)"]}
              style={styles.imageGradient}
            />
          </View>
        ) : (
          <View style={styles.noImageSpacer} />
        )}

        <View
          style={[
            styles.contentContainer,
            !newsItem.image_url && styles.contentContainerNoImage,
          ]}
        >
          {!isAnnouncement && newsItem.Sports && (
            <View style={styles.categoryContainer}>
              <View style={styles.categoryTag}>
                <Text style={styles.categoryText}>{newsItem.Sports.name}</Text>
              </View>
            </View>
          )}

          <Text style={styles.title}>{newsItem.title}</Text>

          <View style={styles.metaContainer}>
            <Text style={styles.date}>
              {new Date(
                newsItem.published_date ||
                  newsItem.created_at ||
                  newsItem.createdAt ||
                  ""
              ).toLocaleDateString()}
            </Text>

            {!isAnnouncement && newsItem.source && (
              <View style={styles.sourceContainer}>
                <Text style={styles.sourceLabel}>Kaynak: </Text>
                <Text style={styles.source}>{newsItem.source}</Text>
              </View>
            )}

            {!isAnnouncement && newsItem.source_url && (
              <TouchableOpacity style={styles.visitSourceButton}>
                <Text style={styles.visitSourceText}>Kaynağı Ziyaret Et</Text>
                <Ionicons
                  name="open-outline"
                  size={16}
                  color={colors.primary}
                />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.divider} />

          <Text style={styles.content}>{newsItem.content}</Text>

          {!isAnnouncement && newsItem.tags && newsItem.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              <Text style={styles.tagsLabel}>Etiketler:</Text>
              <View style={styles.tagsList}>
                {newsItem.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 18,
    paddingBottom: 15,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 5,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.white,
    flex: 1,
    textAlign: "center",
    marginHorizontal: 8,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  placeholder: {
    width: 36,
  },
  scrollView: {
    flex: 1,
    marginTop: 0,
  },
  imageContainer: {
    width: "100%",
    overflow: "hidden",
    height: 240,
    backgroundColor: colors.lightGray,
  },
  heroImage: {
    width: "100%",
    height: 240,
    borderRadius: 0,
    marginTop: 0,
  },
  imageGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
  },
  contentContainer: {
    padding: 16,
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginHorizontal: 0,
    marginTop: -20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    paddingTop: 20,
  },
  contentContainerNoImage: {
    marginTop: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  categoryContainer: {
    marginBottom: 12,
  },
  categoryTag: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.white,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 12,
    lineHeight: 28,
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 16,
    marginTop: 8,
  },
  date: {
    fontSize: 14,
    color: colors.darkGray,
    marginRight: 12,
    fontStyle: "italic",
  },
  sourceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    marginTop: 4,
  },
  sourceLabel: {
    fontSize: 14,
    color: colors.darkGray,
  },
  source: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
  },
  visitSourceButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.lightGray,
    borderRadius: 20,
  },
  visitSourceText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.primary,
    marginRight: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.lightGray,
    marginVertical: 16,
  },
  content: {
    fontSize: 16,
    lineHeight: 26,
    color: colors.text,
    textAlign: "justify",
  },
  tagsContainer: {
    marginTop: 20,
  },
  tagsLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.darkGray,
    marginBottom: 8,
  },
  tagsList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: colors.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: colors.darkGray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.darkGray,
    textAlign: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  backToListButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 50,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  backToListText: {
    color: colors.white,
    fontWeight: "600",
    fontSize: 16,
  },
  noImageSpacer: {
    height: 20,
  },
});

export default NewsDetailScreen;
