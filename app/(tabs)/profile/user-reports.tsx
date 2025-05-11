import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { ArrowLeft, Clock, AlertCircle } from "lucide-react-native";
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
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#f39c12"; // Amber
      case "resolved":
        return "#2ecc71"; // Yeşil
      case "rejected":
        return "#e74c3c"; // Kırmızı
      default:
        return "#7f8c8d"; // Gri
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
      {/* Başlık */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Raporlarım</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Raporlarınız yükleniyor...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <AlertCircle size={50} color="#e74c3c" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchUserReports}
          >
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      ) : reports.length === 0 ? (
        <View style={styles.emptyContainer}>
          <AlertCircle size={50} color="#7f8c8d" />
          <Text style={styles.emptyText}>Henüz rapor oluşturmadınız</Text>
          <Text style={styles.emptySubText}>
            Etkinlik detay sayfasındaki bayrak simgesine tıklayarak uygunsuz
            etkinlikleri raporlayabilirsiniz.
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          <Text style={styles.sectionTitle}>
            Gönderilen Raporlar ({reports.length})
          </Text>

          {reports.map((report) => (
            <View key={report.id} style={styles.reportCard}>
              <View style={styles.reportHeader}>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{getEventTitle(report)}</Text>
                  <View style={styles.dateContainer}>
                    <Clock size={14} color="#7f8c8d" />
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
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 16,
  },
  reportCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 4,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  reportDate: {
    fontSize: 14,
    color: "#64748B",
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  separator: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 12,
  },
  reportContent: {
    marginTop: 4,
  },
  reasonLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748B",
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 15,
    color: "#0F172A",
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "#e74c3c",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#3498db",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
    textAlign: "center",
  },
  emptySubText: {
    marginTop: 8,
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },
});

export default UserReportsScreen;
