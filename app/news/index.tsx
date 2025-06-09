import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, Calendar } from "lucide-react-native";
import { fetchNews, News } from "@/services/newsService";
import { showToast } from "@/src/utils/toastHelper";
import LoadingAnimation from "@/components/animations/LoadingAnimations";

export default function NewsScreen() {
  const router = useRouter();
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async (refresh = false) => {
    try {
      if (refresh) {
        setPage(0);
        setHasMore(true);
      }

      if (!hasMore && !refresh) return;

      setLoading(true);
      const currentPage = refresh ? 0 : page;

      const response = await fetchNews(currentPage, 10);

      if (response.success && Array.isArray(response.data)) {
        // Yenileme durumunda listeyi sıfırla, değilse mevcut listeye ekle
        const newsList = refresh ? response.data : [...news, ...response.data];
        setNews(newsList);

        // Daha fazla haber var mı kontrol et
        setHasMore(response.data.length === 10);

        // Başarılı olduysa sayfa numarasını arttır
        if (!refresh) {
          setPage(currentPage + 1);
        }
      } else {
        console.error("Haberler alınamadı:", response);
        setError("Haberler yüklenirken bir hata oluştu");
      }
    } catch (error) {
      console.error("Haberler yüklenirken hata:", error);
      setError("Haberler yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadNews(true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadNews();
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleNewsPress = (newsId: number) => {
    router.push({
      pathname: "/news-detail",
      params: { id: newsId.toString() },
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";

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

  const renderNewsItem = ({ item }: { item: News }) => (
    <TouchableOpacity
      style={styles.newsCard}
      onPress={() => handleNewsPress(item.id)}
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

        <View style={styles.newsFooter}>
          <View style={styles.dateContainer}>
            <Calendar size={14} color="#64748B" />
            <Text style={styles.dateText}>
              {formatDate(item.published_date || item.created_at)}
            </Text>
          </View>

          {item.source && <Text style={styles.sourceText}>{item.source}</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loading || refreshing) return null;

    return (
      <View style={styles.footerLoader}>
        <LoadingAnimation size={30} />
        <Text style={styles.loadingMoreText}>Daha fazla yükleniyor...</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Haberler</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading && news.length === 0 && !refreshing ? (
        <View style={styles.loadingContainer}>
          <LoadingAnimation size={80} />
          <Text style={styles.loadingText}>Haberler yükleniyor...</Text>
        </View>
      ) : error && !news.length ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            onPress={() => loadNews(true)}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={news}
          renderItem={renderNewsItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Henüz haber yok</Text>
              </View>
            ) : null
          }
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#10B981"]}
              tintColor="#10B981"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  newsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    height: 180,
    position: "relative",
  },
  newsImage: {
    width: "100%",
    height: "100%",
  },
  categoryBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(16, 185, 129, 0.85)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  categoryText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  newsContent: {
    padding: 16,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 12,
    lineHeight: 22,
  },
  newsFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: 12,
    color: "#64748B",
    marginLeft: 6,
  },
  sourceText: {
    fontSize: 12,
    color: "#64748B",
    fontStyle: "italic",
  },
  footerLoader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
  },
  loadingMoreText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#64748B",
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#10B981",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  placeholderImage: {
    backgroundColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748B",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    marginTop: 16,
  },
});
