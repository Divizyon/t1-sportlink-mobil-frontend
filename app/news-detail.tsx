import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Clipboard,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { ChevronLeft, Calendar, Share2 } from "lucide-react-native";
import { fetchNewsById } from "@/services/newsService";
import { showToast } from "@/src/utils/toastHelper";
import LoadingAnimation from "@/components/animations/LoadingAnimations";

export default function NewsDetailScreen() {
  const params = useLocalSearchParams();
  const { id } = params;

  const [news, setNews] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Haber ID'si bulunamadı");
      setLoading(false);
      return;
    }

    const loadNewsDetail = async () => {
      try {
        setLoading(true);
        const response = await fetchNewsById(id.toString());

        if (response.success && response.data) {
          setNews(response.data);
        } else {
          setError("Haber bulunamadı");
        }
      } catch (error) {
        console.error("Haber detayları yüklenirken hata:", error);
        setError("Haber yüklenirken bir hata oluştu");
      } finally {
        setLoading(false);
      }
    };

    loadNewsDetail();
  }, [id]);

  const handleGoBack = () => {
    router.back();
  };

  const handleShare = async () => {
    if (!news) return;

    try {
      const shareTitle = news.title;
      const shareMessage = `${shareTitle}\n\nSportLink uygulamasından paylaşıldı`;

      // Clipboard API kullanarak metin kopyala
      await Clipboard.setString(shareMessage);
      showToast("Haber metni panoya kopyalandı", "success");
    } catch (error) {
      console.error("Kopyalama hatası:", error);
      showToast("Kopyalama işlemi başarısız oldu", "error");
    }
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <LoadingAnimation size={80} />
          <Text style={styles.loadingText}>Haber yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <ChevronLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Haber Detayı</Text>
          <View style={styles.placeholderRight} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={handleGoBack} style={styles.goBackButton}>
            <Text style={styles.goBackText}>Geri Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Haber Detayı</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Share2 size={20} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.imageContainer}>
          {news?.image_url ? (
            <Image
              source={{ uri: news.image_url }}
              style={styles.newsImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.newsImage, styles.placeholderImage]}>
              <Text style={styles.placeholderText}>SportLink</Text>
            </View>
          )}
          {news?.Sports && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {news.Sports.name || "Genel"}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.newsContent}>
          <Text style={styles.newsTitle}>{news?.title}</Text>

          <View style={styles.metaInfo}>
            <View style={styles.dateContainer}>
              <Calendar size={16} color="#64748B" />
              <Text style={styles.dateText}>
                {formatDate(news?.published_date || news?.created_at)}
              </Text>
            </View>
            {news?.source && (
              <Text style={styles.sourceText}>Kaynak: {news.source}</Text>
            )}
          </View>

          <Text style={styles.newsBody}>{news?.content}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  shareButton: {
    padding: 8,
  },
  placeholderRight: {
    width: 40,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 240,
  },
  newsImage: {
    width: "100%",
    height: "100%",
  },
  categoryBadge: {
    position: "absolute",
    bottom: 16,
    left: 16,
    backgroundColor: "rgba(16, 185, 129, 0.85)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  newsContent: {
    padding: 16,
  },
  newsTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 12,
    lineHeight: 28,
  },
  metaInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: 14,
    color: "#64748B",
    marginLeft: 6,
  },
  sourceText: {
    fontSize: 14,
    color: "#64748B",
    fontStyle: "italic",
  },
  newsBody: {
    fontSize: 16,
    color: "#334155",
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748B",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    color: "#EF4444",
    textAlign: "center",
    marginBottom: 16,
  },
  goBackButton: {
    backgroundColor: "#10B981",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  goBackText: {
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
});
