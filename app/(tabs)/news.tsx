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
  Platform,
  TextInput,
  Linking,
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
import { LinearGradient } from "expo-linear-gradient";

// Yumuşak yeşil tonlarla modern renk paleti
const colors = {
  primary: "#10b981", // Ana yeşil ton
  primaryLight: "#a7f3d0", // Açık yeşil
  primaryDark: "#059669", // Koyu yeşil
  secondary: "#059669", // Turkuaz tonu
  background: "#ffffff", // Arka plan
  white: "#ffffff",
  text: "#1e293b",
  darkGray: "#4a5568",
  gray: "#a0aec0",
  lightGray: "#f1f5f9",
  error: "#ef4444",
  success: "#10b981",
  cardBg: "#ffffff", // Kart arka planı
  gradient1: "#10b981",
  gradient2: "#059669",
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
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  // Arama temizleme
  const handleClearSearch = () => {
    setSearchQuery("");
  };

  // Arama filtrelemesi
  useEffect(() => {
    if (searchQuery.trim() === "") return;

    // Basit arama filtrelemesi
    const filteredResults = news.filter(
      (item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.content &&
          item.content.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (filteredResults.length > 0) {
      setNews(filteredResults);
    }
  }, [searchQuery]);

  const renderNewsItem = ({ item }: { item: News }) => (
    <TouchableOpacity
      style={styles.newsItem}
      onPress={() => {
        // Eğer haberin source_url değeri varsa ve boş değilse dış bağlantıya git
        if (item.source_url && item.source_url.trim() !== "") {
          Linking.openURL(item.source_url);
        } else {
          // Aksi halde normal detay sayfasına git
          router.push(`/news/${item.id}`);
        }
      }}
    >
      <View style={styles.cardContent}>
        <View style={styles.imageContainer}>
          {item.image_url ? (
            <Image
              source={{ uri: item.image_url }}
              style={styles.newsImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="newspaper" size={40} color={colors.gray} />
            </View>
          )}
          {item.Sports && (
            <View style={styles.categoryTagOverlay}>
              <Text style={styles.categoryText}>{item.Sports.name}</Text>
            </View>
          )}
        </View>

        <View style={styles.newsContent}>
          <Text style={styles.newsTitle} numberOfLines={2}>
            {item.title}
          </Text>

          <Text style={styles.newsDate}>
            {new Date(
              item.published_date || item.created_at || ""
            ).toLocaleDateString("tr-TR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>

          <Text style={styles.newsExcerpt} numberOfLines={3}>
            {item.content}
          </Text>

          <View style={styles.readMoreContainer}>
            <Text style={styles.readMore}>
              {item.source_url && item.source_url.trim() !== ""
                ? "Kaynağa Git"
                : "Devamını Oku"}
            </Text>
            <Ionicons
              name={
                item.source_url && item.source_url.trim() !== ""
                  ? "open-outline"
                  : "chevron-forward"
              }
              size={16}
              color={colors.primary}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Duyuru öğesini render et
  const renderAnnouncementItem = ({ item }: { item: News }) => (
    <TouchableOpacity
      style={styles.newsItem}
      onPress={() => {
        // Eğer duyurunun source_url değeri varsa ve boş değilse dış bağlantıya git
        if (item.source_url && item.source_url.trim() !== "") {
          Linking.openURL(item.source_url);
        } else {
          // Aksi halde normal detay sayfasına git
          router.push({
            pathname: `/news/${item.id}`,
            params: { type: "announcement" },
          });
        }
      }}
    >
      <View style={styles.cardContent}>
        <View style={styles.imageContainer}>
          {item.image_url ? (
            <Image
              source={{ uri: item.image_url }}
              style={styles.newsImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="megaphone" size={40} color={colors.gray} />
            </View>
          )}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.5)"]}
            style={styles.imageGradient}
          />
        </View>

        <View style={styles.newsContent}>
          <Text style={styles.newsTitle} numberOfLines={2}>
            {item.title}
          </Text>

          <Text style={styles.newsDate}>
            {new Date(item.created_at || "").toLocaleDateString("tr-TR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>

          <Text style={styles.newsExcerpt} numberOfLines={3}>
            {item.content}
          </Text>

          <View style={styles.readMoreContainer}>
            <Text style={styles.readMore}>
              {item.source_url && item.source_url.trim() !== ""
                ? "Kaynağa Git"
                : "Devamını Oku"}
            </Text>
            <Ionicons
              name={
                item.source_url && item.source_url.trim() !== ""
                  ? "open-outline"
                  : "chevron-forward"
              }
              size={16}
              color={colors.primary}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

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
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Haberler ve Duyurular</Text>
            <TouchableOpacity
              style={styles.searchIconContainer}
              onPress={() => setShowSearch((prevState) => !prevState)}
            >
              <Ionicons name="search" size={22} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Arama Bölümü */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons
              name="search"
              size={20}
              color={colors.gray}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Ara..."
              placeholderTextColor={colors.gray}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={handleClearSearch}>
                <Ionicons name="close-circle" size={20} color={colors.gray} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      <View style={styles.content}>
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
                <TouchableOpacity
                  key={category.id?.toString() || "all"}
                  style={[
                    styles.categoryButton,
                    selectedSportId === category.id &&
                      styles.selectedCategoryButton,
                    index === 0 && { marginLeft: 0 },
                  ]}
                  onPress={() => handleCategoryChange(category.id)}
                >
                  {index === 0 && (
                    <Ionicons
                      name="grid-outline"
                      size={14}
                      color={
                        selectedSportId === category.id
                          ? colors.white
                          : colors.darkGray
                      }
                      style={{ marginRight: 4 }}
                    />
                  )}
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
              ))}
            </ScrollView>
          </View>
        )}

        {loading && !refreshing && news.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>
              {activeTab === "news" ? "Haberler" : "Duyurular"} yükleniyor...
            </Text>
          </View>
        ) : error && news.length === 0 ? (
          <View style={styles.errorContainer}>
            <LinearGradient
              colors={["rgba(252,129,129,0.1)", "rgba(252,129,129,0.05)"]}
              style={styles.errorGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <Ionicons name="alert-circle" size={60} color={colors.error} />
            <Text style={styles.errorTitle}>Bir Sorun Oluştu</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRefresh}
            >
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
                tintColor={colors.primary}
              />
            }
            onEndReached={activeTab === "news" ? handleLoadMore : undefined}
            onEndReachedThreshold={0.3}
            ListFooterComponent={
              activeTab === "news" &&
              currentPage < totalPages - 1 &&
              !loading ? (
                <TouchableOpacity
                  style={styles.loadMoreButton}
                  onPress={handleLoadMore}
                >
                  <Text style={styles.loadMoreText}>Daha Fazla Göster</Text>
                  <Ionicons
                    name="chevron-down"
                    size={16}
                    color={colors.white}
                    style={{ marginLeft: 5 }}
                  />
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
                <LinearGradient
                  colors={["rgba(72,187,120,0.1)", "rgba(72,187,120,0.05)"]}
                  style={styles.emptyGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <Ionicons
                  name={activeTab === "news" ? "newspaper" : "megaphone"}
                  size={60}
                  color={colors.primary}
                  style={{ opacity: 0.8 }}
                />
                <Text style={styles.emptyTitle}>
                  {activeTab === "news"
                    ? "Hiç haber bulunamadı"
                    : "Hiç duyuru bulunamadı"}
                </Text>
                <Text style={styles.emptyText}>
                  {activeTab === "news"
                    ? "Daha sonra tekrar kontrol edin"
                    : "Yeni duyurular eklendiğinde burada görünecek"}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    flex: 1,
    marginTop: -10,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: colors.white,
    overflow: "hidden",
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingTop: 15,
    paddingBottom: 18,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 10,
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 10 : 5,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.white,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 0.5,
  },
  searchIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
    marginTop: 8,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.lightGray,
    borderRadius: 30,
    paddingHorizontal: 16,
    height: 50,
    shadowColor: "#64748b",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: 5,
  },
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    flexDirection: "row",
    marginTop: 16,
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    paddingHorizontal: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTabButton: {
    borderBottomColor: colors.primary,
    backgroundColor: "transparent",
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.darkGray,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: "600",
  },
  categoriesWrapper: {
    backgroundColor: colors.white,
    paddingVertical: 15,
    marginBottom: 10,
  },
  categoriesContainer: {
    backgroundColor: colors.white,
  },
  categoriesContent: {
    paddingHorizontal: 20,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 50,
    backgroundColor: colors.lightGray,
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedCategoryButton: {
    backgroundColor: colors.primary,
  },
  categoryButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.darkGray,
  },
  selectedCategoryText: {
    color: colors.white,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 5,
    paddingBottom: 40,
  },
  newsItem: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    overflow: "hidden",
  },
  cardContent: {
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 180,
  },
  imageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
  },
  newsImage: {
    width: "100%",
    height: "100%",
  },
  categoryTagOverlay: {
    position: "absolute",
    left: 12,
    top: 12,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#e6f7ef",
    justifyContent: "center",
    alignItems: "center",
  },
  newsContent: {
    padding: 16,
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
    lineHeight: 24,
  },
  newsDate: {
    fontSize: 12,
    color: colors.gray,
    marginBottom: 10,
  },
  newsExcerpt: {
    fontSize: 14,
    color: colors.darkGray,
    lineHeight: 20,
    marginBottom: 12,
  },
  readMoreContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  readMore: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: colors.darkGray,
    marginTop: 15,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    marginTop: 50,
    position: "relative",
    overflow: "hidden",
  },
  errorGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.error,
    marginVertical: 15,
  },
  errorText: {
    fontSize: 16,
    color: colors.darkGray,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 50,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonText: {
    color: colors.white,
    fontWeight: "600",
    fontSize: 16,
  },
  loadMoreButton: {
    flexDirection: "row",
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loadMoreText: {
    color: colors.white,
    fontWeight: "600",
    fontSize: 15,
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
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    marginTop: 50,
    position: "relative",
    overflow: "hidden",
  },
  emptyGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
    textAlign: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: colors.darkGray,
    textAlign: "center",
  },
  categoryText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: "600",
  },
});
