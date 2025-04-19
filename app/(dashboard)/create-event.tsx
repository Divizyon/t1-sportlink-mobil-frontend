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
  StatusBar,
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
  Home,
  User,
  MessageCircle,
  Settings,
  Plus,
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
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.scrollView}>
          {/* Header */}
          <Box style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleCancel}>
              <ArrowLeft size={20} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Yeni Etkinlik</Text>
            <View style={{ width: 20 }} />
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
                  <MapPin size={20} color="#666" style={styles.inputIcon} />
                  <Text
                    style={[
                      styles.locationText,
                      !formData.location && styles.placeholderText,
                    ]}
                  >
                    {formData.location || "Etkinlik konumunu seçin"}
                  </Text>
                </HStack>
                <ChevronDown size={16} color="#666" />
              </TouchableOpacity>
            </Box>

            {/* Tarih ve Saat */}
            <HStack style={styles.rowFormGroup}>
              <Box style={styles.formGroupHalf}>
                <Text style={styles.label}>Tarih</Text>
                <Box style={styles.inputWithIcon}>
                  <Calendar
                    size={20}
                    color="#666"
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
                  <Clock
                    size={20}
                    color="#666"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.iconInput}
                    placeholder="HH:MM"
                    value={formData.time}
                    onChangeText={(text) => handleInputChange("time", text)}
                  />
                </Box>
              </Box>
            </HStack>

            {/* Maksimum Katılımcı Sayısı */}
            <Box style={styles.formGroup}>
              <Text style={styles.label}>Maksimum Katılımcı Sayısı</Text>
              <Box style={styles.inputWithIcon}>
                <Users
                  size={20}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.iconInput}
                  placeholder="Maksimum katılımcı sayısı"
                  keyboardType="numeric"
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
                <HStack style={styles.locationContent}>
                  <Tag
                    size={20}
                    color="#666"
                    style={styles.inputIcon}
                  />
                  <Text
                    style={[
                      styles.locationText,
                      !formData.category && styles.placeholderText,
                    ]}
                  >
                    {formData.category || "Etkinlik kategorisi"}
                  </Text>
                </HStack>
                <ChevronDown size={16} color="#666" />
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

            {/* Create Button */}
            <Button style={styles.createButton} onPress={handleSave}>
              <ButtonText style={styles.createButtonText}>
                Etkinlik Oluştur
              </ButtonText>
            </Button>
          </VStack>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modals */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showCategoryModal}
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Kategori Seçin</Text>
            <ScrollView style={styles.modalScroll}>
              {sportCategories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.categoryItem}
                  onPress={() => handleSelectCategory(cat.name)}
                >
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  <Text style={styles.categoryName}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCategoryModal(false)}
            >
              <Text style={styles.closeButtonText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showLocationModal}
        onRequestClose={() => setShowLocationModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Konum Seçin</Text>
            <Box style={styles.searchBox}>
              <Search size={20} color="#666" />
              <TextInput
                style={styles.searchInput}
                placeholder="Konum ara..."
              />
            </Box>
            <ScrollView style={styles.modalScroll}>
              <TouchableOpacity
                style={styles.locationItem}
                onPress={handleSelectLocation}
              >
                <MapPin size={20} color="#666" />
                <Text style={styles.locationItemText}>
                  Konya Spor Kompleksi, Selçuklu
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.locationItem}
                onPress={handleSelectLocation}
              >
                <MapPin size={20} color="#666" />
                <Text style={styles.locationItemText}>
                  Meram Spor Salonu, Meram
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.locationItem}
                onPress={handleSelectLocation}
              >
                <MapPin size={20} color="#666" />
                <Text style={styles.locationItemText}>
                  Selçuk Üniversitesi Spor Tesisleri
                </Text>
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
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  form: {
    padding: 16,
    gap: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  rowFormGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12,
  },
  formGroupHalf: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    backgroundColor: "#F7F7F7",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#EBEBEB",
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F7F7",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EBEBEB",
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  iconInput: {
    flex: 1,
    padding: 14,
    fontSize: 16,
    color: "#333",
  },
  locationSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F7F7F7",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#EBEBEB",
  },
  categorySelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F7F7F7",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#EBEBEB",
  },
  locationContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 16,
    color: "#333",
  },
  placeholderText: {
    color: "#999",
  },
  eventTypeContainer: {
    flexDirection: "row",
    gap: 12,
  },
  eventTypeButton: {
    flex: 1,
    backgroundColor: "#F7F7F7",
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#EBEBEB",
  },
  selectedEventType: {
    backgroundColor: "#6366F1",
    borderColor: "#6366F1",
  },
  eventTypeText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
  },
  selectedEventTypeText: {
    color: "#FFFFFF",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  modalScroll: {
    maxHeight: 300,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  categoryName: {
    fontSize: 16,
    color: "#333",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F7F7",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  locationItemText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
  },
  closeButton: {
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 16,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  createButton: {
    backgroundColor: "#6366F1",
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 20,
    marginBottom: 20,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
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
});
