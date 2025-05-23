import React, { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { router } from "expo-router";
import { Box } from "@/components/ui/box";
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import {
  FormControl,
  FormControlLabel,
  FormControlError,
  FormControlLabelText,
} from "@/components/ui/form-control";
import LocationSelector from "@/components/dashboard/LocationSelector";
import LocationSelectorModal from "@/components/dashboard/LocationSelectorModal";
import CustomDateTimePicker from "@/components/dashboard/DateTimePicker";
import SportSelector from "@/components/dashboard/SportSelector";
import { showToast } from "@/src/utils/toastHelper";
import apiClient from "@/services/api";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  PenLine,
  Tag,
  Info,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import MapView from "react-native-maps";
import { Marker } from "react-native-maps";

interface CreateEventForm {
  title: string;
  description: string;
  sport_id: number;
  event_date: string;
  start_time: string;
  end_time: string;
  location_name: string;
  location_lat: number;
  location_long: number;
  max_participants: number;
}

const CreateEventScreen = () => {
  const [form, setForm] = useState<CreateEventForm>({
    title: "",
    description: "",
    sport_id: 0,
    event_date: "",
    start_time: "",
    end_time: "",
    location_name: "",
    location_lat: 37.874641,
    location_long: 32.493156,
    max_participants: 0,
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateEventForm, string>>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const totalSteps = 3;

  // Date states
  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);

  const validateStep = (step: number) => {
    const newErrors: Partial<Record<keyof CreateEventForm, string>> = {};

    if (step === 1) {
      if (!form.title.trim()) {
        newErrors.title = "Etkinlik başlığı gereklidir";
      }
      if (!form.description.trim()) {
        newErrors.description = "Etkinlik açıklaması gereklidir";
      }
      if (!form.sport_id) {
        newErrors.sport_id = "Spor türü seçilmelidir";
      }
    } else if (step === 2) {
      if (!eventDate) {
        newErrors.event_date = "Etkinlik tarihi gereklidir";
      }
      if (!startTime) {
        newErrors.start_time = "Başlangıç saati gereklidir";
      }
      if (!endTime) {
        newErrors.end_time = "Bitiş saati gereklidir";
      }

      // Başlangıç ve bitiş saati kontrolü
      if (startTime && endTime && startTime >= endTime) {
        newErrors.end_time = "Bitiş saati başlangıç saatinden sonra olmalıdır";
      }
    } else if (step === 3) {
      if (!form.location_name) {
        newErrors.location_name = "Konum seçilmelidir";
      }
      if (form.max_participants <= 0) {
        newErrors.max_participants =
          "Geçerli bir katılımcı sayısı girilmelidir";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => Math.min(prev + 1, totalSteps));
    } else {
      showToast("Lütfen gerekli alanları doldurun", "error");
    }
  };

  const handlePreviousStep = () => {
    setActiveStep((prev) => Math.max(prev - 1, 1));
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof CreateEventForm, string>> = {};

    if (!form.title.trim()) {
      newErrors.title = "Etkinlik başlığı gereklidir";
    }
    if (!form.description.trim()) {
      newErrors.description = "Etkinlik açıklaması gereklidir";
    }
    if (!form.sport_id) {
      newErrors.sport_id = "Spor türü seçilmelidir";
    }
    if (!eventDate) {
      newErrors.event_date = "Etkinlik tarihi gereklidir";
    }
    if (!startTime) {
      newErrors.start_time = "Başlangıç saati gereklidir";
    }
    if (!endTime) {
      newErrors.end_time = "Bitiş saati gereklidir";
    }
    if (!form.location_name) {
      newErrors.location_name = "Konum seçilmelidir";
    }
    if (form.max_participants <= 0) {
      newErrors.max_participants = "Geçerli bir katılımcı sayısı girilmelidir";
    }

    // Başlangıç ve bitiş saati kontrolü
    if (startTime && endTime && startTime >= endTime) {
      newErrors.end_time = "Bitiş saati başlangıç saatinden sonra olmalıdır";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showToast("Lütfen tüm gerekli alanları doldurun", "error");
      return;
    }

    // Tarihleri API formatına çevir
    const formattedEventDate = eventDate?.toISOString().split("T")[0];
    const formattedStartTime = startTime?.toISOString();
    const formattedEndTime = endTime?.toISOString();

    const submitData = {
      ...form,
      event_date: formattedEventDate,
      start_time: formattedStartTime,
      end_time: formattedEndTime,
    };

    setIsLoading(true);
    try {
      const response = await apiClient.post("/api/events", submitData);
      if (response.data.status === "success") {
        showToast("Etkinlik başarıyla oluşturuldu", "success");
        router.back();
      }
    } catch (error: any) {
      showToast(
        error.response?.data?.message ||
          "Etkinlik oluşturulurken bir hata oluştu",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationSelect = (
    locationName: string,
    coordinates: { latitude: number; longitude: number }
  ) => {
    setForm((prev) => ({
      ...prev,
      location_name: locationName,
      location_lat: coordinates.latitude,
      location_long: coordinates.longitude,
    }));
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicatorContainer}>
      {[...Array(totalSteps)].map((_, index) => (
        <View key={index} style={styles.stepIndicatorWrapper}>
          <View
            style={[
              styles.stepIndicator,
              activeStep > index ? styles.stepActive : {},
              activeStep === index + 1 ? styles.stepCurrent : {},
            ]}
          >
            <Text
              style={[
                styles.stepNumber,
                activeStep > index || activeStep === index + 1
                  ? styles.stepNumberActive
                  : {},
              ]}
            >
              {index + 1}
            </Text>
          </View>
          {index < totalSteps - 1 && (
            <View
              style={[
                styles.stepConnector,
                activeStep > index + 1 ? styles.stepConnectorActive : {},
              ]}
            />
          )}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Etkinlik Bilgileri</Text>

      <FormControl isInvalid={!!errors.title} style={styles.formGroup}>
        <FormControlLabel>
          <View style={styles.labelContainer}>
            <PenLine size={18} color="#4F46E5" />
            <FormControlLabelText style={styles.labelText}>
              Etkinlik Başlığı
            </FormControlLabelText>
          </View>
        </FormControlLabel>
        <View style={[styles.customInput, !!errors.title && styles.inputError]}>
          <TextInput
            placeholder="Etkinlik başlığını girin"
            value={form.title}
            onChangeText={(text: string) =>
              setForm((prev) => ({ ...prev, title: text }))
            }
            style={styles.textInput}
          />
        </View>
        {errors.title && <FormControlError>{errors.title}</FormControlError>}
      </FormControl>

      <FormControl isInvalid={!!errors.description} style={styles.formGroup}>
        <FormControlLabel>
          <View style={styles.labelContainer}>
            <Info size={18} color="#4F46E5" />
            <FormControlLabelText style={styles.labelText}>
              Açıklama
            </FormControlLabelText>
          </View>
        </FormControlLabel>
        <View
          style={[
            styles.customInput,
            !!errors.description && styles.inputError,
          ]}
        >
          <TextInput
            placeholder="Etkinlik açıklamasını girin"
            value={form.description}
            onChangeText={(text: string) =>
              setForm((prev) => ({ ...prev, description: text }))
            }
            multiline
            numberOfLines={4}
            style={[styles.textInput, styles.textArea]}
            textAlignVertical="top"
          />
        </View>
        {errors.description && (
          <FormControlError>{errors.description}</FormControlError>
        )}
      </FormControl>

      <FormControl isInvalid={!!errors.sport_id} style={styles.formGroup}>
        <FormControlLabel>
          <View style={styles.labelContainer}>
            <Tag size={18} color="#4F46E5" />
            <FormControlLabelText style={styles.labelText}>
              Spor Türü
            </FormControlLabelText>
          </View>
        </FormControlLabel>
        <SportSelector
          label=""
          value={form.sport_id}
          onChange={(sportId) =>
            setForm((prev) => ({ ...prev, sport_id: sportId }))
          }
          error={errors.sport_id}
        />
      </FormControl>

      <Button style={styles.nextButton} onPress={handleNextStep}>
        <ButtonText style={styles.buttonText}>Devam Et</ButtonText>
      </Button>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Zaman Bilgileri</Text>

      <FormControl isInvalid={!!errors.event_date} style={styles.formGroup}>
        <FormControlLabel>
          <View style={styles.labelContainer}>
            <Calendar size={18} color="#4F46E5" />
            <FormControlLabelText style={styles.labelText}>
              Etkinlik Tarihi
            </FormControlLabelText>
          </View>
        </FormControlLabel>
        <CustomDateTimePicker
          label=""
          value={eventDate}
          onChange={setEventDate}
          mode="date"
          minimumDate={new Date()}
          error={errors.event_date}
        />
      </FormControl>

      <FormControl isInvalid={!!errors.start_time} style={styles.formGroup}>
        <FormControlLabel>
          <View style={styles.labelContainer}>
            <Clock size={18} color="#4F46E5" />
            <FormControlLabelText style={styles.labelText}>
              Başlangıç Saati
            </FormControlLabelText>
          </View>
        </FormControlLabel>
        <CustomDateTimePicker
          label=""
          value={startTime}
          onChange={setStartTime}
          mode="time"
          error={errors.start_time}
        />
      </FormControl>

      <FormControl isInvalid={!!errors.end_time} style={styles.formGroup}>
        <FormControlLabel>
          <View style={styles.labelContainer}>
            <Clock size={18} color="#4F46E5" />
            <FormControlLabelText style={styles.labelText}>
              Bitiş Saati
            </FormControlLabelText>
          </View>
        </FormControlLabel>
        <CustomDateTimePicker
          label=""
          value={endTime}
          onChange={setEndTime}
          mode="time"
          error={errors.end_time}
        />
      </FormControl>

      <View style={styles.navigationButtons}>
        <Button
          variant="outline"
          style={styles.backButton}
          onPress={handlePreviousStep}
        >
          <ButtonText style={styles.backButtonText}>Geri</ButtonText>
        </Button>
        <Button style={styles.nextButton} onPress={handleNextStep}>
          <ButtonText style={styles.buttonText}>Devam Et</ButtonText>
        </Button>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Konum ve Katılım</Text>

      <FormControl isInvalid={!!errors.location_name} style={styles.formGroup}>
        <FormControlLabel>
          <View style={styles.labelContainer}>
            <MapPin size={18} color="#4F46E5" />
            <FormControlLabelText style={styles.labelText}>
              Konum
            </FormControlLabelText>
          </View>
        </FormControlLabel>

        {/* Konum adı girişi */}
        <View
          style={[
            styles.customInput,
            !!errors.location_name && styles.inputError,
            { marginBottom: 8 },
          ]}
        >
          <TextInput
            placeholder="Konum adını girin (örn. Spor Salonu)"
            value={form.location_name}
            onChangeText={(text) =>
              setForm((prev) => ({ ...prev, location_name: text }))
            }
            style={styles.textInput}
          />
        </View>

        {/* Harita üzerinden konum seçimi */}
        <TouchableOpacity
          style={[
            styles.mapSelector,
            !!errors.location_name && styles.inputError,
          ]}
          onPress={() => setIsLocationModalVisible(true)}
        >
          <View style={styles.locationInfo}>
            <MapPin size={20} color="#6B7280" />
            <Text style={styles.selectorText}>
              {form.location_lat && form.location_long
                ? `Haritadan seçildi (${form.location_lat.toFixed(
                    6
                  )}, ${form.location_long.toFixed(6)})`
                : "Haritadan konum seçin"}
            </Text>
          </View>
        </TouchableOpacity>

        {form.location_lat && form.location_long && (
          <View style={styles.mapPreview}>
            <MapView
              style={styles.map}
              region={{
                latitude: form.location_lat,
                longitude: form.location_long,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Marker
                coordinate={{
                  latitude: form.location_lat,
                  longitude: form.location_long,
                }}
              />
            </MapView>
          </View>
        )}

        {errors.location_name && (
          <FormControlError>{errors.location_name}</FormControlError>
        )}
      </FormControl>

      <FormControl
        isInvalid={!!errors.max_participants}
        style={styles.formGroup}
      >
        <FormControlLabel>
          <View style={styles.labelContainer}>
            <Users size={18} color="#4F46E5" />
            <FormControlLabelText style={styles.labelText}>
              Maksimum Katılımcı Sayısı
            </FormControlLabelText>
          </View>
        </FormControlLabel>
        <View
          style={[
            styles.customInput,
            !!errors.max_participants && styles.inputError,
          ]}
        >
          <TextInput
            placeholder="Maksimum katılımcı sayısını girin"
            value={
              form.max_participants.toString() === "0"
                ? ""
                : form.max_participants.toString()
            }
            onChangeText={(text) => {
              const number = parseInt(text) || 0;
              setForm((prev) => ({ ...prev, max_participants: number }));
            }}
            keyboardType="numeric"
            style={styles.textInput}
          />
        </View>
        {errors.max_participants && (
          <FormControlError>{errors.max_participants}</FormControlError>
        )}
      </FormControl>

      <View style={styles.navigationButtons}>
        <Button
          variant="outline"
          style={styles.backButton}
          onPress={handlePreviousStep}
        >
          <ButtonText style={styles.backButtonText}>Geri</ButtonText>
        </Button>
        <Button
          onPress={handleSubmit}
          isDisabled={isLoading}
          style={styles.createButton}
        >
          <ButtonText style={styles.buttonText}>
            {isLoading ? "Oluşturuluyor..." : "Etkinliği Oluştur"}
          </ButtonText>
          {isLoading && (
            <ActivityIndicator color="#ffffff" style={{ marginLeft: 10 }} />
          )}
        </Button>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <LinearGradient colors={["#4e54c8", "#8f94fb"]} style={styles.header}>
        <TouchableOpacity style={styles.backIcon} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yeni Etkinlik</Text>
        <View style={styles.headerPlaceholder} />
      </LinearGradient>

      <ScrollView style={styles.scrollContainer}>
        <Box style={styles.content}>
          {renderStepIndicator()}

          {activeStep === 1 && renderStep1()}
          {activeStep === 2 && renderStep2()}
          {activeStep === 3 && renderStep3()}
        </Box>
      </ScrollView>

      <LocationSelectorModal
        visible={isLocationModalVisible}
        onClose={() => setIsLocationModalVisible(false)}
        onSelect={handleLocationSelect}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },
  header: {
    height: 120,
    paddingTop: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  backIcon: {
    padding: 5,
  },
  headerPlaceholder: {
    width: 24,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 10,
  },
  stepIndicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    marginTop: 10,
  },
  stepIndicatorWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  stepNumber: {
    color: "#94A3B8",
    fontSize: 16,
    fontWeight: "600",
  },
  stepActive: {
    backgroundColor: "#4F46E5",
  },
  stepCurrent: {
    backgroundColor: "#4F46E5",
    borderWidth: 3,
    borderColor: "rgba(79, 70, 229, 0.3)",
  },
  stepNumberActive: {
    color: "#FFFFFF",
  },
  stepConnector: {
    height: 3,
    width: 40,
    backgroundColor: "#E2E8F0",
    marginHorizontal: -5,
  },
  stepConnectorActive: {
    backgroundColor: "#4F46E5",
  },
  stepContainer: {
    marginBottom: 30,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  labelText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: "500",
    color: "#334155",
  },
  customInput: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 25,
    backgroundColor: "#F8FAFC",
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: "center",
  },
  inputError: {
    borderColor: "#EF4444",
  },
  textInput: {
    fontSize: 16,
    color: "#0F172A",
  },
  textArea: {
    minHeight: 120,
    paddingTop: 8,
    textAlignVertical: "top",
  },
  nextButton: {
    backgroundColor: "#4F46E5",
    height: 50,
    borderRadius: 25,
    marginTop: 10,
  },
  createButton: {
    backgroundColor: "#4F46E5",
    height: 50,
    borderRadius: 25,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  backButton: {
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    borderColor: "#4F46E5",
    borderWidth: 1,
  },
  backButtonText: {
    color: "#4F46E5",
    fontSize: 16,
    fontWeight: "600",
  },
  mapSelector: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 25,
    backgroundColor: "#F8FAFC",
    padding: 16,
    minHeight: 56,
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectorText: {
    fontSize: 16,
    color: "#0F172A",
    marginLeft: 8,
  },
  mapPreview: {
    marginTop: 8,
    height: 200,
    borderRadius: 25,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  map: {
    width: "100%",
    height: "100%",
  },
});

export default CreateEventScreen;
