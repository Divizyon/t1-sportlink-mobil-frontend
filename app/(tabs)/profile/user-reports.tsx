import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import {
  ArrowLeft,
  Clock,
  AlertCircle,
  Flag,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { eventsApi } from "@/services/api/events";

interface UserReport {
  id: number;
  report_reason: string;
  report_date: string;
  status: "pending" | "resolved" | "rejected";
  event_id: string | null;
  event_title?: string;
}

const UserReportsScreen = () => {
  const router = useRouter();
  const [reports, setReports] = useState<UserReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Kullanıcı raporlarını getir
  const fetchUserReports = async () => {
    try {
      setLoading(true);
      setError(null);

      const reportsData = await eventsApi.getUserReports();
      console.log("Alınan raporlar:", reportsData);

      setReports(reportsData);
    } catch (err) {
      console.error("Raporları getirme hatası:", err);
      setError(
        "Raporlar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
      );
    } finally {
      setLoading(false);
    }
  };

  // Sayfa yüklendiğinde raporları getir
  useEffect(() => {
    fetchUserReports();
  }, []);

  // Sayfanın başına dön
  const handleBack = () => {
    router.back();
  };

  // Tarih formatını düzenle
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Raporun durumunu Türkçe olarak göster
  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "İnceleniyor";
      case "resolved":
        return "Çözüldü";
      case "rejected":
        return "Reddedildi";
      default:
        return "Bilinmiyor";
    }
  };

  // Raporun durum rengini belirle
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "pending":
        return "#F39C12"; // Turuncu
      case "resolved":
        return "#2ECC71"; // Yeşil
      case "rejected":
        return "#E74C3C"; // Kırmızı
      default:
        return "#95A5A6"; // Gri
    }
  };

  // Durum ikonu belirle
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <AlertTriangle size={16} color="#FFF" />;
      case "resolved":
        return <CheckCircle2 size={16} color="#FFF" />;
      case "rejected":
        return <XCircle size={16} color="#FFF" />;
      default:
        return null;
    }
  };

  // Etkinlik başlığını belirle
  const getEventTitle = (report: UserReport) => {
    if (report.event_title) {
      return report.event_title;
    }

    // Eğer event_id varsa ve null değilse göster
    if (report.event_id) {
      return `Etkinlik #${report.event_id}`;
    }

    // Hiçbir bilgi yoksa sadece "Etkinlik" göster
    return "Etkinlik";
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Başlık */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Raporlarım</Text>
        <View style={{ width: 22 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4e54c8" />
          <Text style={styles.loadingText}>Raporlarınız yükleniyor...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <AlertCircle size={60} color="#e74c3c" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchUserReports}
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      ) : reports.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Flag size={60} color="#7f8c8d" />
          <Text style={styles.emptyText}>Henüz rapor oluşturmadınız</Text>
          <Text style={styles.emptySubText}>
            Etkinlik detay sayfasındaki bayrak simgesine tıklayarak uygunsuz
            etkinlikleri raporlayabilirsiniz.
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
        >
          <View style={styles.sectionTitleContainer}>
            <Flag size={20} color="#4e54c8" style={{ marginRight: 8 }} />
            <Text style={styles.sectionTitle}>
              Gönderilen Raporlar ({reports.length})
            </Text>
          </View>

          {reports.map((report) => (
            <View key={report.id} style={styles.reportCard}>
              <View style={styles.reportHeader}>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{getEventTitle(report)}</Text>
                  <View style={styles.dateContainer}>
                    <Clock size={14} color="#64748B" />
                    <Text style={styles.reportDate}>
                      {formatDate(report.report_date)}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(report.status) },
                  ]}
                >
                  {getStatusIcon(report.status)}
                  <Text style={styles.statusText}>
                    {getStatusText(report.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.separator} />

              <View style={styles.reportContent}>
                <Text style={styles.reasonLabel}>Rapor Sebebi:</Text>
                <Text style={styles.reasonText}>{report.report_reason}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

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
    paddingVertical: 14,
    marginTop: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
    marginTop: 10,
    borderRadius: 100,
    backgroundColor: "#F1F5F9",
  },
  headerTitle: {
    fontSize: 18,
    marginTop: 10,
    fontWeight: "700",
    color: "#0F172A",
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4e54c8",
  },
  reportCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  eventInfo: {
    flex: 1,
    marginRight: 12,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  reportDate: {
    fontSize: 14,
    color: "#64748B",
    marginLeft: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 4,
  },
  separator: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 14,
  },
  reportContent: {
    marginTop: 4,
  },
  reasonLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 8,
  },
  reasonText: {
    fontSize: 15,
    color: "#334155",
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748B",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "#e74c3c",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#4e54c8",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    backgroundColor: "#FFFFFF",
  },
  emptyText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
  },
  emptySubText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: "90%",
  },
});

export default UserReportsScreen;
