import React, { useState } from "react";
import {
  View,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Switch,
  Modal,
  Image,
} from "react-native";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { router } from "expo-router";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Users,
  Tag,
  Info,
  Search,
  ChevronDown,
  CheckCircle,
  Building,
  FileText,
  Camera,
} from "lucide-react-native";

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

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.scrollView}>
          {/* Header */}
          <Box style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleCancel}>
              <ArrowLeft size={24} color="#0F0F0F" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Yeni Etkinlik</Text>
            <View style={{ width: 24 }} />
          </Box>

          {/* Form */}
          <VStack style={styles.form}>
            {/* Etkinlik Adı */}
            <Box style={styles.formGroup}>
              <Text style={styles.label}>Etkinlik Adı</Text>
              <TextInput
                style={styles.input}
                placeholder="Etkinlik adını girin"
                value={formData.title}
                onChangeText={(text) => handleInputChange("title", text)}
                placeholderTextColor="#9CA3AF"
              />
            </Box>

            {/* Açıklama */}
            <Box style={styles.formGroup}>
              <Text style={styles.label}>Açıklama</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Etkinlik açıklamasını girin"
                multiline={true}
                numberOfLines={4}
                value={formData.description}
                onChangeText={(text) => handleInputChange("description", text)}
                placeholderTextColor="#9CA3AF"
              />
            </Box>

            {/* Konum */}
            <Box style={styles.formGroup}>
              <Text style={styles.label}>Konum</Text>
              <TouchableOpacity
                style={styles.locationSelector}
                onPress={() => setShowLocationModal(true)}
              >
                <HStack style={styles.locationContent}>
                  <MapPin size={20} color="#4F46E5" style={styles.inputIcon} />
                  <Text
                    style={[
                      styles.locationText,
                      !formData.location && styles.placeholderText,
                    ]}
                  >
                    {formData.location || "Etkinlik konumunu seçin"}
                  </Text>
                </HStack>
                <ChevronDown size={20} color="#6B7280" />
              </TouchableOpacity>

              {formData.location && (
                <Box style={styles.mapPreviewContainer}>
                  <Image
                    source={{ uri: selectedLocationImage }}
                    style={styles.mapPreview}
                    resizeMode="cover"
                  />
                  <View style={styles.mapMarker} />
                </Box>
              )}
            </Box>

            {/* Tarih ve Saat */}
            <HStack style={styles.rowFormGroup}>
              <Box style={styles.formGroupHalf}>
                <Text style={styles.label}>Tarih</Text>
                <Box style={styles.inputWithIcon}>
                  <Calendar
                    size={20}
                    color="#4F46E5"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.iconInput}
                    placeholder="GG/AA/YYYY"
                    value={formData.date}
                    onChangeText={(text) => handleInputChange("date", text)}
                    placeholderTextColor="#9CA3AF"
                  />
                </Box>
              </Box>

              <Box style={styles.formGroupHalf}>
                <Text style={styles.label}>Saat</Text>
                <Box style={styles.inputWithIcon}>
                  <Clock size={20} color="#4F46E5" style={styles.inputIcon} />
                  <TextInput
                    style={styles.iconInput}
                    placeholder="HH:MM"
                    value={formData.time}
                    onChangeText={(text) => handleInputChange("time", text)}
                    placeholderTextColor="#9CA3AF"
                  />
                </Box>
              </Box>
            </HStack>

            {/* Katılımcı Sayısı */}
            <Box style={styles.formGroup}>
              <Text style={styles.label}>Maksimum Katılımcı Sayısı</Text>
              <Box style={styles.inputWithIcon}>
                <Users size={20} color="#4F46E5" style={styles.inputIcon} />
                <TextInput
                  style={styles.iconInput}
                  placeholder="Maksimum katılımcı sayısı"
                  keyboardType="number-pad"
                  value={formData.maxParticipants}
                  onChangeText={(text) =>
                    handleInputChange("maxParticipants", text)
                  }
                  placeholderTextColor="#9CA3AF"
                />
              </Box>
            </Box>

            {/* Kategori */}
            <Box style={styles.formGroup}>
              <Text style={styles.label}>Kategori</Text>
              <TouchableOpacity
                style={styles.categorySelector}
                onPress={() => setShowCategoryModal(true)}
              >
                <HStack style={styles.categoryContent}>
                  <Tag size={20} color="#4F46E5" style={styles.inputIcon} />
                  <Text
                    style={[
                      styles.categoryText,
                      !formData.category && styles.placeholderText,
                    ]}
                  >
                    {formData.category || "Etkinlik kategorisi"}
                  </Text>
                </HStack>
                <ChevronDown size={20} color="#6B7280" />
              </TouchableOpacity>
            </Box>

            {/* Gereksinimler */}
            <Box style={styles.formGroup}>
              <Text style={styles.label}>Gereksinimler</Text>
              <Box style={styles.inputWithIcon}>
                <FileText size={20} color="#4F46E5" style={styles.inputIcon} />
                <TextInput
                  style={[styles.iconInput, { height: 80 }]}
                  placeholder="Katılımcıların getirmesi gerekenler"
                  multiline={true}
                  numberOfLines={3}
                  value={formData.requirements}
                  onChangeText={(text) =>
                    handleInputChange("requirements", text)
                  }
                  placeholderTextColor="#9CA3AF"
                />
              </Box>
            </Box>

            {/* Spor Kulübü Etkinliği */}
            <Box style={styles.formGroup}>
              <HStack style={styles.toggleContainer}>
                <Text style={styles.label}>Spor Kulübü Etkinliği</Text>
                <Switch
                  value={formData.isClubEvent}
                  onValueChange={(value) =>
                    handleInputChange("isClubEvent", value)
                  }
                  trackColor={{ false: "#E4E4E7", true: "#4F46E5" }}
                  thumbColor="#ffffff"
                  ios_backgroundColor="#E4E4E7"
                />
              </HStack>

              {formData.isClubEvent && (
                <VStack style={styles.clubInfoContainer}>
                  <Box style={styles.formSubGroup}>
                    <Text style={styles.subLabel}>Kulüp Adı</Text>
                    <Box style={styles.inputWithIcon}>
                      <Building
                        size={20}
                        color="#4F46E5"
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.iconInput}
                        placeholder="Kulüp adını girin"
                        value={formData.clubName}
                        onChangeText={(text) =>
                          handleInputChange("clubName", text)
                        }
                        placeholderTextColor="#9CA3AF"
                      />
                    </Box>
                  </Box>

                  <Box style={styles.formSubGroup}>
                    <Text style={styles.subLabel}>Kulüp Hakkında</Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Kulüp hakkında kısa bilgi"
                      multiline={true}
                      numberOfLines={3}
                      value={formData.clubInfo}
                      onChangeText={(text) =>
                        handleInputChange("clubInfo", text)
                      }
                      placeholderTextColor="#9CA3AF"
                    />
                  </Box>
                </VStack>
              )}
            </Box>

            {/* Etkinlik Görsel Yükleme */}
            <Box style={styles.formGroup}>
              <Text style={styles.label}>Etkinlik Görseli</Text>
              <TouchableOpacity style={styles.imageUploadButton}>
                <Camera size={24} color="#4F46E5" />
                <Text style={styles.imageUploadText}>Etkinlik Görseli Ekle</Text>
              </TouchableOpacity>
            </Box>

            {/* Buttons */}
            <Box style={styles.buttonGroup}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Kaydet</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
            </Box>
          </VStack>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Category Modal */}
      <Modal
        visible={showCategoryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Kategori Seçin</Text>

            <VStack style={styles.categoriesList}>
              {sportCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryItem,
                    formData.category === category.name && styles.selectedCategoryItem,
                  ]}
                  onPress={() => handleSelectCategory(category.name)}
                >
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <Text style={styles.categoryItemText}>{category.name}</Text>
                  {formData.category === category.name && (
                    <CheckCircle size={20} color="#4F46E5" />
                  )}
                </TouchableOpacity>
              ))}
            </VStack>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCategoryModal(false)}
            >
              <Text style={styles.closeButtonText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Location Modal */}
      <Modal
        visible={showLocationModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Konum Seçin</Text>

            <Box style={styles.searchContainer}>
              <Search size={20} color="#6B7280" />
              <TextInput
                style={styles.searchInput}
                placeholder="Konum ara..."
                placeholderTextColor="#9CA3AF"
              />
            </Box>

            <ScrollView style={styles.locationList}>
              <TouchableOpacity
                style={styles.locationItem}
                onPress={handleSelectLocation}
              >
                <MapPin size={20} color="#4F46E5" />
                <VStack style={styles.locationItemInfo}>
                  <Text style={styles.locationItemTitle}>
                    Konya Spor Kompleksi
                  </Text>
                  <Text style={styles.locationItemSubtitle}>
                    Selçuklu, Konya
                  </Text>
                </VStack>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.locationItem}
                onPress={handleSelectLocation}
              >
                <MapPin size={20} color="#4F46E5" />
                <VStack style={styles.locationItemInfo}>
                  <Text style={styles.locationItemTitle}>
                    Meram Spor Salonu
                  </Text>
                  <Text style={styles.locationItemSubtitle}>Meram, Konya</Text>
                </VStack>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.locationItem}
                onPress={handleSelectLocation}
              >
                <MapPin size={20} color="#4F46E5" />
                <VStack style={styles.locationItemInfo}>
                  <Text style={styles.locationItemTitle}>Karatay Stadyumu</Text>
                  <Text style={styles.locationItemSubtitle}>
                    Karatay, Konya
                  </Text>
                </VStack>
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowLocationModal(false)}
            >
              <Text style={styles.closeButtonText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F0F0F",
  },
  backButton: {
    padding: 4,
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
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#1F2937",
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  iconInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: "#1F2937",
  },
  buttonGroup: {
    marginTop: 32,
    gap: 12,
  },
  saveButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#4F46E5",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#4B5563",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 16,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
    color: "#1F2937",
    textAlign: "center",
  },
  categoriesList: {
    marginBottom: 20,
    gap: 12,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
  },
  selectedCategoryItem: {
    borderColor: "#4F46E5",
    backgroundColor: "#EEF2FF",
  },
  categoryIcon: {
    marginRight: 16,
    fontSize: 24,
  },
  categoryItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
  },
  closeButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#1F2937",
  },
  locationList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#F9FAFB",
  },
  locationItemInfo: {
    marginLeft: 16,
    flex: 1,
  },
  locationItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  locationItemSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  mapPreviewContainer: {
    height: 180,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 12,
  },
  mapPreview: {
    flex: 1,
  },
  mapMarker: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 3,
    borderColor: "#4F46E5",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -10 }, { translateY: -10 }],
  },
  categorySelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
  },
  categoryContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryText: {
    fontSize: 16,
    color: "#1F2937",
  },
  placeholderText: {
    color: "#9CA3AF",
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
  formSubGroup: {
    gap: 8,
  },
  subLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#4B5563",
  },
  imageUploadButton: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 12,
  },
  imageUploadText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4B5563",
  },
  locationSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
  },
  locationContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 16,
    color: "#1F2937",
  },
});
