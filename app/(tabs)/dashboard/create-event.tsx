import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
  View,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { useRouter } from "expo-router";
import { Users, Calendar, Clock } from "lucide-react-native";
import {
  FormHeader,
  FormInput,
  FormTextArea,
  LocationSelector,
  CategorySelectorModal,
  LocationSelectorModal,
} from "@/components/dashboard";

// Örnek konum verileri - gerçek uygulamada API'dan gelir
const mockLocations = [
  {
    id: 1,
    name: "Konya Spor Kompleksi",
    address: "Selçuklu, Konya",
    distance: "1.2 km",
    image: "https://picsum.photos/600/200",
    coordinates: {
      latitude: 37.8651,
      longitude: 32.4932,
    },
  },
  {
    id: 2,
    name: "Meram Futbol Sahası",
    address: "Meram, Konya",
    distance: "2.5 km",
    image: "https://picsum.photos/600/201",
    coordinates: {
      latitude: 37.8583,
      longitude: 32.4482,
    },
  },
  {
    id: 3,
    name: "Selçuklu Kapalı Spor Salonu",
    address: "Selçuklu, Konya",
    distance: "3.7 km",
    image: "https://picsum.photos/600/202",
    coordinates: {
      latitude: 37.874,
      longitude: 32.4921,
    },
  },
  {
    id: 4,
    name: "Konya Atatürk Stadyumu",
    address: "Selçuklu, Konya",
    distance: "4.1 km",
    image: "https://picsum.photos/600/203",
    coordinates: {
      latitude: 37.8691,
      longitude: 32.4862,
    },
  },
];

// Kategori listesi
const sportCategories = [
  { id: 1, name: "Tümü", icon: "🏆" },
  { id: 2, name: "Futbol", icon: "⚽" },
  { id: 3, name: "Basketbol", icon: "🏀" },
  { id: 4, name: "Yüzme", icon: "🏊" },
  { id: 5, name: "Tenis", icon: "🎾" },
  { id: 6, name: "Voleybol", icon: "🏐" },
];

export default function CreateEventScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    locationCoordinates: {
      latitude: 0,
      longitude: 0,
    },
    date: "",
    startTime: "",
    endTime: "",
    maxParticipants: "",
    category: "",
    requirements: "",
    isClubEvent: false,
    clubName: "",
    clubInfo: "",
  });
  const [dateError, setDateError] = useState("");
  const [startTimeError, setStartTimeError] = useState("");
  const [endTimeError, setEndTimeError] = useState("");

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedLocationImage, setSelectedLocationImage] = useState(
    "https://picsum.photos/600/200"
  );

  // Form validasyonu
  const isFormValid = useMemo(() => {
    return (
      formData.title.trim() !== "" &&
      formData.description.trim() !== "" &&
      formData.location.trim() !== "" &&
      formData.date.trim() !== "" &&
      !dateError &&
      formData.startTime.trim() !== "" &&
      !startTimeError &&
      formData.endTime.trim() !== "" &&
      !endTimeError &&
      formData.maxParticipants.trim() !== "" &&
      formData.category.trim() !== ""
    );
  }, [formData, dateError, startTimeError, endTimeError]);

  const handleInputChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSelectCategory = (category: string) => {
    handleInputChange("category", category);
    setShowCategoryModal(false);
  };

  const handleSelectLocation = (
    location: string,
    coordinates: { latitude: number; longitude: number }
  ) => {
    // Konum seçildikten sonra modal kapatılır ve konum bilgileri güncellenir
    setShowLocationModal(false);
    handleInputChange("location", location);
    handleInputChange("locationCoordinates", coordinates);

    // Seçilen konumun harita görüntüsünü güncelle
    const selectedLocation = mockLocations.find((loc) => loc.name === location);
    if (selectedLocation?.image) {
      setSelectedLocationImage(selectedLocation.image);
    }
  };

  const handleDateChange = (text: string) => {
    // Sadece sayılar ve / karakterini kabul et
    const formattedText = text.replace(/[^0-9/]/g, "");

    // Otomatik / ekle
    let finalText = formattedText;
    if (
      formattedText.length === 2 &&
      !formattedText.includes("/") &&
      formData.date.length !== 3
    ) {
      finalText = formattedText + "/";
    } else if (
      formattedText.length === 5 &&
      formattedText.split("/").length === 2 &&
      formData.date.length !== 6
    ) {
      finalText = formattedText + "/";
    }

    handleInputChange("date", finalText);

    // Format doğrulama
    if (finalText.length > 0 && finalText.length < 10) {
      setDateError("Tarih formatı: GG/AA/YYYY olmalıdır");
    } else if (finalText.length === 10) {
      // Tarih geçerliliğini kontrol et
      const parts = finalText.split("/");
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);

      const isValidDate =
        day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 2023;

      if (!isValidDate) {
        setDateError("Geçerli bir tarih giriniz");
      } else {
        setDateError("");
      }
    } else {
      setDateError("");
    }
  };

  const handleTimeChange = (text: string, field: "startTime" | "endTime") => {
    // Sadece sayılar ve : karakterini kabul et
    const formattedText = text.replace(/[^0-9:]/g, "");

    // Otomatik : ekle
    let finalText = formattedText;
    if (
      formattedText.length === 2 &&
      !formattedText.includes(":") &&
      formData[field].length !== 3
    ) {
      finalText = formattedText + ":";
    }

    handleInputChange(field, finalText);

    // Format doğrulama
    const setError =
      field === "startTime" ? setStartTimeError : setEndTimeError;

    if (finalText.length > 0 && finalText.length < 5) {
      setError("Saat formatı: HH:MM olmalıdır");
    } else if (finalText.length === 5) {
      // Saat geçerliliğini kontrol et
      const parts = finalText.split(":");
      const hour = parseInt(parts[0], 10);
      const minute = parseInt(parts[1], 10);

      const isValidTime =
        hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;

      if (!isValidTime) {
        setError("Geçerli bir saat giriniz");
      } else {
        setError("");

        // Başlangıç ve bitiş saatleri arasındaki ilişkiyi kontrol et
        if (field === "endTime" && formData.startTime) {
          const startParts = formData.startTime.split(":");
          const startHour = parseInt(startParts[0], 10);
          const startMinute = parseInt(startParts[1], 10);

          if (
            hour < startHour ||
            (hour === startHour && minute <= startMinute)
          ) {
            setError("Bitiş saati başlangıç saatinden sonra olmalıdır");
          }
        }
      }
    } else {
      setError("");
    }
  };

  const handleMaxParticipantsChange = (text: string) => {
    // Sadece sayıları kabul et
    const formattedText = text.replace(/[^0-9]/g, "");
    handleInputChange("maxParticipants", formattedText);
  };

  const handleSave = () => {
    if (isFormValid) {
      console.log("Etkinlik kaydedildi:", formData);
      router.back();
    } else {
      Alert.alert("Hata", "Lütfen tüm alanları doğru şekilde doldurun.");
    }
  };

  const handleCancel = () => {
    router.back();
  };

  // Kulüp etkinliği toggle bileşeni
  const ClubEventToggle = () => (
    <Box style={styles.formGroup}>
      <HStack style={styles.toggleContainer}>
        <Text style={styles.label}>Spor Kulübü Etkinliği</Text>
        <Switch
          value={formData.isClubEvent}
          onValueChange={(value) => handleInputChange("isClubEvent", value)}
          trackColor={{ false: "#E4E4E7", true: "#4F46E5" }}
          thumbColor="#ffffff"
          ios_backgroundColor="#E4E4E7"
        />
      </HStack>
      {formData.isClubEvent && (
        <VStack style={styles.clubInfoContainer}>
          <FormInput
            label="Kulüp Adı"
            placeholder="Kulüp adını girin"
            value={formData.clubName}
            onChangeText={(text: string) => handleInputChange("clubName", text)}
            isSubInput={true}
          />

          <FormTextArea
            label="Kulüp Hakkında"
            placeholder="Kulüp hakkında kısa bilgi"
            value={formData.clubInfo}
            onChangeText={(text: string) => handleInputChange("clubInfo", text)}
            numberOfLines={3}
            isSubInput={true}
          />
        </VStack>
      )}
    </Box>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.scrollView}>
          <FormHeader title="Yeni Etkinlik" onBack={handleCancel} />

          <VStack style={styles.form}>
            {/* Temel Bilgiler */}
            <FormInput
              label="Etkinlik Adı"
              placeholder="Etkinlik adını girin"
              value={formData.title}
              onChangeText={(text: string) => handleInputChange("title", text)}
            />

            <FormTextArea
              label="Açıklama"
              placeholder="Etkinlik açıklamasını girin"
              value={formData.description}
              onChangeText={(text: string) =>
                handleInputChange("description", text)
              }
              numberOfLines={4}
            />

            {/* Konum */}
            <Box style={styles.formGroup}>
              <Text style={styles.label}>Konum</Text>
              <FormInput
                label=""
                placeholder="Konum bilgisini manuel girin"
                value={formData.location}
                onChangeText={(text: string) =>
                  handleInputChange("location", text)
                }
                containerStyle={{ marginBottom: 10 }}
              />
              <Text style={styles.subLabel}>veya haritadan seçin</Text>
              <LocationSelector
                value={formData.location || "Konum seç"}
                mapPreviewUrl={selectedLocationImage}
                onPress={() => setShowLocationModal(true)}
              />
            </Box>

            {/* Tarih ve Saat */}
            <Box style={styles.formGroup}>
              <Text style={styles.label}>Tarih</Text>
              <FormInput
                label=""
                placeholder="GG/AA/YYYY"
                value={formData.date}
                onChangeText={handleDateChange}
                error={dateError}
                keyboardType="numeric"
                icon={<Calendar size={20} color="#4F46E5" />}
              />
            </Box>

            <HStack style={styles.rowFormGroup}>
              <FormInput
                label="Başlangıç Saati"
                placeholder="HH:MM"
                value={formData.startTime}
                onChangeText={(text: string) =>
                  handleTimeChange(text, "startTime")
                }
                error={startTimeError}
                keyboardType="numeric"
                icon={<Clock size={20} color="#4F46E5" />}
                containerStyle={styles.formGroupHalf}
              />

              <FormInput
                label="Bitiş Saati"
                placeholder="HH:MM"
                value={formData.endTime}
                onChangeText={(text: string) =>
                  handleTimeChange(text, "endTime")
                }
                error={endTimeError}
                keyboardType="numeric"
                icon={<Clock size={20} color="#4F46E5" />}
                containerStyle={styles.formGroupHalf}
              />
            </HStack>

            {/* Katılımcı Sayısı */}
            <FormInput
              label="Maksimum Katılımcı Sayısı"
              placeholder="Maksimum katılımcı sayısı"
              value={formData.maxParticipants}
              onChangeText={handleMaxParticipantsChange}
              keyboardType="numeric"
              icon={<Users size={20} color="#4F46E5" />}
            />

            {/* Kategori */}
            <Box style={styles.formGroup}>
              <Text style={styles.label}>Kategori</Text>
              <LocationSelector
                value={formData.category || "Etkinlik kategorisi"}
                onPress={() => setShowCategoryModal(true)}
                isCategory={true}
              />
            </Box>

            {/* Gereksinimler */}
            <FormTextArea
              label="Gereksinimler"
              placeholder="Katılımcıların getirmesi gerekenler"
              value={formData.requirements}
              onChangeText={(text: string) =>
                handleInputChange("requirements", text)
              }
              numberOfLines={3}
            />

            {/* Kulüp Bilgileri */}
            <ClubEventToggle />

            {/* Kaydet ve İptal Butonları */}
            <HStack style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.saveButton,
                  !isFormValid && styles.disabledButton,
                ]}
                onPress={handleSave}
                disabled={!isFormValid}
              >
                <Text style={styles.saveButtonText}>Kaydet</Text>
              </TouchableOpacity>
            </HStack>
          </VStack>
        </ScrollView>
      </KeyboardAvoidingView>

      <CategorySelectorModal
        visible={showCategoryModal}
        categories={sportCategories}
        selectedCategory={formData.category}
        onSelect={handleSelectCategory}
        onClose={() => setShowCategoryModal(false)}
      />

      <LocationSelectorModal
        visible={showLocationModal}
        onSelect={(
          location: string,
          coordinates: { latitude: number; longitude: number }
        ) => handleSelectLocation(location, coordinates)}
        onClose={() => setShowLocationModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  rowFormGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 12,
  },
  formGroupHalf: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#1F2937",
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  clubInfoContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 40,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButton: {
    backgroundColor: "#4F46E5",
  },
  cancelButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButtonText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "#A5B4FC",
    opacity: 0.7,
  },
  subLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748B",
    marginBottom: 8,
  },
});
