import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  fetchNews,
  fetchAnnouncements,
  News,
} from "../../services/newsService";

// Doğrudan renk tanımları
const colors = {
  primary: "#2ecc71",
  secondary: "#27ae60",
  background: "#f5f5f5",
  white: "#ffffff",
  text: "#333333",
  darkGray: "#7f8c8d",
  gray: "#bdc3c7",
  lightGray: "#ecf0f1",
  error: "#e74c3c",
};

export default function NewsTab() {
  const router = useRouter();
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSportId, setSelectedSportId] = useState<number | undefined>(
    undefined
  );
  const [activeTab, setActiveTab] = useState<"news" | "announcements">("news");

  // Spor kategorileri
  const sportCategories = [
    { id: undefined, name: "Tümü" },
    { id: 4, name: "Futbol" },
    { id: 5, name: "Basketbol" },
    { id: 6, name: "Voleybol" },
    { id: 7, name: "Tenis" },
  ];

  // Haberleri yükle
  const loadNews = async (
    page = 0,
    sportId = selectedSportId,
    shouldRefresh = false
  ) => {
    try {
      if (shouldRefresh) {
        setRefreshing(true);
      } else if (!refreshing) {
        setLoading(true);
      }

      // Hangi sekmedeyiz?
      const isAnnouncementsTab = activeTab === "announcements";

      console.log(
        `Veri yükleniyor: ${
          isAnnouncementsTab ? "Duyurular" : "Haberler"
        } (sayfa: ${page}, spor: ${sportId || "tümü"})`
      );

      if (isAnnouncementsTab) {
        // Duyurular sekmesindeysek, duyurular API'sini çağır
        const response = await fetchAnnouncements();

        console.log("Duyurular API yanıtı:", response);

        if (response.success) {
          console.log(`${response.data.length} duyuru yüklendi`);

          // Spor filtreleme uygulanabilir mi diye kontrol et
          const filteredAnnouncements = sportId
            ? response.data.filter((item) => item.sport_id === sportId)
            : response.data;

          console.log(
            `Filtreden sonra ${filteredAnnouncements.length} duyuru kaldı`
          );
          setNews(filteredAnnouncements);
          // Duyurular için sayfalama yok, tümü tek seferde geliyor
          setTotalPages(1);
          setError(null);
        } else {
          console.error("Duyurular yüklenirken API hatası:", response);
          setError("Duyurular yüklenirken bir hata oluştu.");
        }
      } else {
        // Haberler sekmesindeysek, haberler API'sini çağır
        const response = await fetchNews(page, 20, sportId);

        console.log("Haberler API yanıtı:", response);

        if (response.success) {
          console.log(
            `${response.data.length} haber yüklendi, toplam sayfa: ${response.pagination.totalPages}`
          );

          if (shouldRefresh || page === 0) {
            setNews(response.data);
          } else {
            setNews((prev) => [...prev, ...response.data]);
          }

          setTotalPages(response.pagination.totalPages);
          setError(null);
        } else {
          console.error("Haberler yüklenirken API hatası:", response);
          setError("Haberler yüklenirken bir hata oluştu.");
        }
      }
    } catch (err) {
      console.error(`Error loading ${activeTab}:`, err);
      setError(
        `${
          activeTab === "news" ? "Haberler" : "Duyurular"
        } yüklenirken bir hata oluştu.`
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // İlk yükleme
  useEffect(() => {
    loadNews();
  }, []);

  // Tab değiştiğinde verileri yeniden yükle
  useEffect(() => {
    setCurrentPage(0);
    setNews([]);
    loadNews(0, selectedSportId, true);
  }, [activeTab]);

  // Spor kategorisi değiştiğinde haberleri yeniden yükle
  useEffect(() => {
    setCurrentPage(0);
    loadNews(0, selectedSportId, true);
  }, [selectedSportId]);

  // Yenileme işlemi
  const handleRefresh = () => {
    setCurrentPage(0);
    loadNews(0, selectedSportId, true);
  };

  // Daha fazla haber yükle
  const handleLoadMore = () => {
    // Sadece Haberler sekmesinde sayfalama var
    if (
      activeTab === "news" &&
      currentPage < totalPages - 1 &&
      !loading &&
      !refreshing
    ) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      loadNews(nextPage);
    }
  };

  // Kategori değiştirme
  const handleCategoryChange = (sportId: number | undefined) => {
    setSelectedSportId(sportId);
  };

  // Tab değiştirme
  const handleTabChange = (tab: "news" | "announcements") => {
    if (tab !== activeTab) {
      setActiveTab(tab);
    }
  };

  const renderNewsItem = ({ item }: { item: News }) => (
    <TouchableOpacity
      style={styles.newsItem}
      onPress={() => router.push(`/news/${item.id}`)}
    >
      {item.image_url && (
        <Image
          source={{ uri: item.image_url }}
          style={styles.newsImage}
          resizeMode="cover"
        />
      )}
      <View style={styles.newsContent}>
        {item.Sports && (
          <View style={styles.categoryTag}>
            <Text style={styles.categoryText}>{item.Sports.name}</Text>
          </View>
        )}
        <Text style={styles.newsTitle}>{item.title}</Text>
        <Text style={styles.newsDate}>
          {new Date(
            item.published_date || item.created_at || ""
          ).toLocaleDateString()}
        </Text>
        <Text style={styles.newsExcerpt} numberOfLines={2}>
          {item.content}
        </Text>
        <View style={styles.readMoreContainer}>
          <Text style={styles.readMore}>Devamını Oku</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );

  // Duyuru öğesini render et
  const renderAnnouncementItem = ({ item }: { item: News }) => (
    <TouchableOpacity
      style={styles.newsItem}
      onPress={() =>
        router.push({
          pathname: `/news/${item.id}`,
          params: { type: "announcement" },
        })
      }
    >
      {item.image_url && (
        <Image
          source={{ uri: item.image_url }}
          style={styles.newsImage}
          resizeMode="cover"
        />
      )}
      <View style={styles.newsContent}>
        <Text style={styles.newsTitle}>{item.title}</Text>
        <Text style={styles.newsDate}>
          {new Date(item.created_at || "").toLocaleDateString()}
        </Text>
        <Text style={styles.newsExcerpt} numberOfLines={2}>
          {item.content}
        </Text>
        <View style={styles.readMoreContainer}>
          <Text style={styles.readMore}>Devamını Oku</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Haberler ve Duyurular</Text>
      </View>

      {/* Üst Tab Seçici */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "news" && styles.activeTabButton,
          ]}
          onPress={() => handleTabChange("news")}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === "news" && styles.activeTabText,
            ]}
          >
            Haberler
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "announcements" && styles.activeTabButton,
          ]}
          onPress={() => handleTabChange("announcements")}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === "announcements" && styles.activeTabText,
            ]}
          >
            Duyurular
          </Text>
        </TouchableOpacity>
      </View>

      {/* Kategori filtreleri - sadece haberler sekmesinde göster */}
      {activeTab === "news" && (
        <View style={styles.categoriesWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
            contentContainerStyle={styles.categoriesContent}
          >
            {sportCategories.map((category, index) => (
              <View
                key={category.id?.toString() || "all"}
                style={[
                  styles.categoryButtonContainer,
                  index === 0 && { marginLeft: 0 },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.categoryButton,
                    selectedSportId === category.id &&
                      styles.selectedCategoryButton,
                    index === 0 &&
                      selectedSportId === category.id && {
                        backgroundColor: "#4cd964",
                      },
                  ]}
                  onPress={() => handleCategoryChange(category.id)}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      selectedSportId === category.id &&
                        styles.selectedCategoryText,
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {loading && !refreshing && news.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error && news.length === 0 ? (
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={60}
            color={colors.error}
          />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Yeniden Dene</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={news}
          renderItem={
            activeTab === "news" ? renderNewsItem : renderAnnouncementItem
          }
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
            />
          }
          onEndReached={activeTab === "news" ? handleLoadMore : undefined}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            activeTab === "news" && currentPage < totalPages - 1 && !loading ? (
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={handleLoadMore}
              >
                <Text style={styles.loadMoreText}>Daha Fazla Göster</Text>
              </TouchableOpacity>
            ) : loading && news.length > 0 ? (
              <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingMoreText}>Yükleniyor...</Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="newspaper-outline"
                size={60}
                color={colors.gray}
              />
              <Text style={styles.emptyText}>
                {activeTab === "news"
                  ? "Hiç haber bulunamadı."
                  : "Hiç duyuru bulunamadı."}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.darkGray,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: "600",
  },
  categoriesWrapper: {
    backgroundColor: colors.white,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  categoriesContainer: {
    backgroundColor: colors.white,
  },
  categoriesContent: {
    paddingHorizontal: 16,
  },
  categoryButtonContainer: {
    marginHorizontal: 4,
  },
  categoryButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0", // Daha açık gri
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedCategoryButton: {
    backgroundColor: colors.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#505050", // Koyu gri
  },
  selectedCategoryText: {
    color: colors.white,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    flexGrow: 1,
  },
  newsItem: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 3,
    overflow: "hidden",
  },
  newsImage: {
    width: "100%",
    height: 180,
  },
  newsContent: {
    padding: 16,
  },
  categoryTag: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: "500",
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 6,
  },
  newsDate: {
    fontSize: 12,
    color: colors.darkGray,
    marginBottom: 8,
  },
  newsExcerpt: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  readMoreContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  readMore: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.primary,
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
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontWeight: "600",
    fontSize: 16,
  },
  loadMoreButton: {
    padding: 12,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 16,
  },
  loadMoreText: {
    color: colors.text,
    fontWeight: "500",
  },
  loadingMore: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  loadingMoreText: {
    color: colors.darkGray,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.darkGray,
    marginTop: 16,
  },
});
