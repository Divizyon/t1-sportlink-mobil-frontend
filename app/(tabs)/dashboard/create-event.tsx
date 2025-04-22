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
} from "react-native";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { useRouter } from "expo-router";
import { Users } from "lucide-react-native";
import {
  FormHeader,
  FormInput,
  FormTextArea,
  LocationSelector,
  CategorySelectorModal,
  LocationSelectorModal,
} from "@/components/dashboard";

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
    date: "",
    time: "",
    maxParticipants: "",
    category: "",
    requirements: "",
    isClubEvent: false,
    clubName: "",
    clubInfo: "",
  });

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
      formData.time.trim() !== "" &&
      formData.maxParticipants.trim() !== "" &&
      formData.category.trim() !== ""
    );
  }, [formData]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSelectCategory = (category: string) => {
    handleInputChange("category", category);
    setShowCategoryModal(false);
  };

  const handleSelectLocation = () => {
    // Gerçek uygulamada konum servisi kullanılabilir
    setShowLocationModal(false);
    handleInputChange("location", "Konya Spor Kompleksi, Selçuklu");
  };

  const handleSave = () => {
    console.log("Etkinlik kaydedildi:", formData);
    router.back();
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
            <LocationSelector
              label="Konum"
              value={formData.location}
              mapPreviewUrl={selectedLocationImage}
              onPress={() => setShowLocationModal(true)}
            />

            {/* Tarih ve Saat */}
            <HStack style={styles.rowFormGroup}>
              <FormInput
                label="Tarih"
                placeholder="GG/AA/YYYY"
                value={formData.date}
                onChangeText={(text: string) => handleInputChange("date", text)}
                containerStyle={styles.formGroupHalf}
              />

              <FormInput
                label="Saat"
                placeholder="HH:MM"
                value={formData.time}
                onChangeText={(text: string) => handleInputChange("time", text)}
                containerStyle={styles.formGroupHalf}
              />
            </HStack>

            {/* Katılımcı Sayısı */}
            <FormInput
              label="Maksimum Katılımcı Sayısı"
              placeholder="Maksimum katılımcı sayısı"
              value={formData.maxParticipants}
              onChangeText={(text: string) =>
                handleInputChange("maxParticipants", text)
              }
              keyboardType="number-pad"
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
        onSelect={handleSelectLocation}
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
});
