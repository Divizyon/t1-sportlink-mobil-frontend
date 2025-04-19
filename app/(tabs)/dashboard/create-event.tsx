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
    eventType: "Spor",
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
              <ArrowLeft size={24} color="#333" />
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
              />
            </Box>

            {/* Etkinlik Türü */}
            <Box style={styles.formGroup}>
              <Text style={styles.label}>Etkinlik Türü</Text>
              <HStack style={styles.eventTypeContainer}>
                <TouchableOpacity
                  style={[
                    styles.eventTypeButton,
                    formData.eventType === "Spor" && styles.selectedEventType,
                  ]}
                  onPress={() => handleInputChange("eventType", "Spor")}
                >
                  <Text
                    style={[
                      styles.eventTypeText,
                      formData.eventType === "Spor" &&
                        styles.selectedEventTypeText,
                    ]}
                  >
                    Spor
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.eventTypeButton,
                    formData.eventType === "Buluşma" &&
                      styles.selectedEventType,
                  ]}
                  onPress={() => handleInputChange("eventType", "Buluşma")}
                >
                  <Text
                    style={[
                      styles.eventTypeText,
                      formData.eventType === "Buluşma" &&
                        styles.selectedEventTypeText,
                    ]}
                  >
                    Buluşma
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.eventTypeButton,
                    formData.eventType === "Kurs" && styles.selectedEventType,
                  ]}
                  onPress={() => handleInputChange("eventType", "Kurs")}
                >
                  <Text
                    style={[
                      styles.eventTypeText,
                      formData.eventType === "Kurs" &&
                        styles.selectedEventTypeText,
                    ]}
                  >
                    Kurs
                  </Text>
                </TouchableOpacity>
              </HStack>
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
                  <MapPin size={20} color="#047857" style={styles.inputIcon} />
                  <Text
                    style={[
                      styles.locationText,
                      !formData.location && styles.placeholderText,
                    ]}
                  >
                    {formData.location || "Etkinlik konumunu seçin"}
                  </Text>
                </HStack>
                <ChevronDown size={20} color="#666" />
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
                    color="#047857"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.iconInput}
                    placeholder="GG/AA/YYYY"
                    value={formData.date}
                    onChangeText={(text) => handleInputChange("date", text)}
                  />
                </Box>
              </Box>

              <Box style={styles.formGroupHalf}>
                <Text style={styles.label}>Saat</Text>
                <Box style={styles.inputWithIcon}>
                  <Clock size={20} color="#047857" style={styles.inputIcon} />
                  <TextInput
                    style={styles.iconInput}
                    placeholder="HH:MM"
                    value={formData.time}
                    onChangeText={(text) => handleInputChange("time", text)}
                  />
                </Box>
              </Box>
            </HStack>

            {/* Katılımcı Sayısı */}
            <Box style={styles.formGroup}>
              <Text style={styles.label}>Maksimum Katılımcı Sayısı</Text>
              <Box style={styles.inputWithIcon}>
                <Users size={20} color="#047857" style={styles.inputIcon} />
                <TextInput
                  style={styles.iconInput}
                  placeholder="Maksimum katılımcı sayısı"
                  keyboardType="number-pad"
                  value={formData.maxParticipants}
                  onChangeText={(text) =>
                    handleInputChange("maxParticipants", text)
                  }
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
                  <Tag size={20} color="#047857" style={styles.inputIcon} />
                  <Text
                    style={[
                      styles.categoryText,
                      !formData.category && styles.placeholderText,
                    ]}
                  >
                    {formData.category || "Etkinlik kategorisi"}
                  </Text>
                </HStack>
                <ChevronDown size={20} color="#666" />
              </TouchableOpacity>
            </Box>

            {/* Gereksinimler */}
            <Box style={styles.formGroup}>
              <Text style={styles.label}>Gereksinimler</Text>
              <Box style={styles.inputWithIcon}>
                <FileText size={20} color="#047857" style={styles.inputIcon} />
                <TextInput
                  style={[styles.iconInput, { height: 80 }]}
                  placeholder="Katılımcıların getirmesi gerekenler"
                  multiline={true}
                  numberOfLines={3}
                  value={formData.requirements}
                  onChangeText={(text) =>
                    handleInputChange("requirements", text)
                  }
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
                  trackColor={{ false: "#e2e8f0", true: "#047857" }}
                  thumbColor="#fff"
                />
              </HStack>

              {formData.isClubEvent && (
                <VStack style={styles.clubInfoContainer}>
                  <Box style={styles.formSubGroup}>
                    <Text style={styles.subLabel}>Kulüp Adı</Text>
                    <Box style={styles.inputWithIcon}>
                      <Building
                        size={20}
                        color="#047857"
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.iconInput}
                        placeholder="Kulüp adını girin"
                        value={formData.clubName}
                        onChangeText={(text) =>
                          handleInputChange("clubName", text)
                        }
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
                    />
                  </Box>
                </VStack>
              )}
            </Box>

            {/* Etkinlik Görsel Yükleme */}
            <Box style={styles.formGroup}>
              <Text style={styles.label}>Etkinlik Görseli</Text>
              <TouchableOpacity style={styles.imageUploadButton}>
                <Camera size={24} color="#047857" />
                <Text style={styles.imageUploadText}>Görsel Ekle</Text>
              </TouchableOpacity>
            </Box>

            {/* Buttons */}
            <Box style={styles.buttonGroup}>
              <Button style={styles.saveButton} onPress={handleSave}>
                <ButtonText style={styles.saveButtonText}>Kaydet</ButtonText>
              </Button>

              <Button style={styles.cancelButton} onPress={handleCancel}>
                <ButtonText style={styles.cancelButtonText}>İptal</ButtonText>
              </Button>
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
                  style={styles.categoryItem}
                  onPress={() => handleSelectCategory(category.name)}
                >
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <Text style={styles.categoryItemText}>{category.name}</Text>
                  {formData.category === category.name && (
                    <CheckCircle size={20} color="#047857" />
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
              <Search size={20} color="#666" />
              <TextInput
                style={styles.searchInput}
                placeholder="Konum ara..."
              />
            </Box>

            <ScrollView style={styles.locationList}>
              <TouchableOpacity
                style={styles.locationItem}
                onPress={handleSelectLocation}
              >
                <MapPin size={20} color="#047857" />
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
                <MapPin size={20} color="#047857" />
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
                <MapPin size={20} color="#047857" />
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
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  backButton: {
    padding: 4,
  },
  form: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  rowFormGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  formGroupHalf: {
    width: "48%",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#333",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  iconInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: "#333",
  },
  buttonGroup: {
    marginTop: 24,
    gap: 12,
  },
  saveButton: {
    backgroundColor: "#047857",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  categoriesList: {
    marginBottom: 16,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  categoryIcon: {
    marginRight: 12,
    fontSize: 20,
  },
  categoryItemText: {
    fontSize: 16,
    color: "#333",
  },
  closeButton: {
    backgroundColor: "#047857",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: "#333",
  },
  locationList: {
    flex: 1,
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  locationItemInfo: {
    marginLeft: 12,
  },
  locationItemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  locationItemSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  mapPreviewContainer: {
    height: 200,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    overflow: "hidden",
  },
  mapPreview: {
    flex: 1,
  },
  mapMarker: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#047857",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -10 }, { translateY: -10 }],
  },
  eventTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  eventTypeButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
  },
  selectedEventType: {
    backgroundColor: "#047857",
  },
  eventTypeText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  selectedEventTypeText: {
    color: "#fff",
  },
  categorySelector: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
  },
  categoryContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryText: {
    fontSize: 16,
    color: "#333",
  },
  placeholderText: {
    color: "#666",
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  clubInfoContainer: {
    marginBottom: 20,
  },
  formSubGroup: {
    marginBottom: 12,
  },
  subLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#333",
  },
  imageUploadButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  imageUploadText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  locationSelector: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
  },
  locationContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 16,
    color: "#333",
  },
});
