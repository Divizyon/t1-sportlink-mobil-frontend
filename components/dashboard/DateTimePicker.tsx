import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
  TextInput,
} from "react-native";
import { Text } from "@/components/ui/text";
import {
  FormControl,
  FormControlLabel,
  FormControlError,
} from "@/components/ui/form-control";
import { format, parse, isValid } from "date-fns";
import { tr } from "date-fns/locale";
import {
  Calendar,
  Clock,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react-native";
import { Button, ButtonText } from "@/components/ui/button";

interface DateTimePickerProps {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  mode: "date" | "time";
  error?: string;
  minimumDate?: Date;
}

// Aylar listesi
const MONTHS_TR = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

// Günler listesi
const DAYS_TR = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

export default function CustomDateTimePicker({
  label,
  value,
  onChange,
  mode,
  error,
  minimumDate,
}: DateTimePickerProps) {
  const [isModalVisible, setModalVisible] = useState(false);

  // Tarih state'leri
  const [selectedDate, setSelectedDate] = useState<Date>(value || new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(value || new Date());

  // Saat state'leri
  const [hours, setHours] = useState<string>(
    value ? format(value, "HH") : format(new Date(), "HH")
  );
  const [minutes, setMinutes] = useState<string>(
    value ? format(value, "mm") : "00"
  );

  useEffect(() => {
    if (value) {
      setSelectedDate(value);
      setCurrentMonth(value);
      setHours(format(value, "HH"));
      setMinutes(format(value, "mm"));
    }
  }, [value]);

  const showModal = () => {
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
  };

  const handleConfirm = () => {
    // Tarih modu
    if (mode === "date") {
      onChange(selectedDate);
    }
    // Saat modu
    else {
      // Saati ve dakikayı sayısal değerlere dönüştürme
      const hoursValue = parseInt(hours, 10);
      const minutesValue = parseInt(minutes, 10);

      // Geçerli değerleri kontrol et
      if (
        isNaN(hoursValue) ||
        isNaN(minutesValue) ||
        hoursValue < 0 ||
        hoursValue > 23 ||
        minutesValue < 0 ||
        minutesValue > 59
      ) {
        return;
      }

      // Yeni tarih oluştur
      const date = new Date();
      date.setHours(hoursValue);
      date.setMinutes(minutesValue);
      date.setSeconds(0);
      date.setMilliseconds(0);

      onChange(date);
    }

    hideModal();
  };

  // Tarih formatlama
  const formatDate = (date: Date) => {
    if (mode === "date") {
      return format(date, "dd MMMM yyyy", { locale: tr });
    }
    return format(date, "HH:mm");
  };

  // Önceki aya git
  const goToPreviousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };

  // Sonraki aya git
  const goToNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };

  // Günleri oluştur
  const generateDays = () => {
    const days = [];
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // Ayın ilk gününü ve son gününü belirle
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Ayın ilk gününün haftanın hangi günü olduğunu belirle
    // Not: JavaScript'te 0=Pazar, 1=Pazartesi, ... 6=Cumartesi
    // Bizim listelemede 0=Pazartesi, ... 6=Pazar olacağı için dönüşüm yapıyoruz
    let firstDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (firstDayOfWeek === -1) firstDayOfWeek = 6; // Pazar için

    // Önceki ayın günleri için boşluklar
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    // Ayın günlerini oluştur
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(year, month, day);

      // Minimum tarihten küçükse devre dışı bırak
      const isDisabled = minimumDate ? date < minimumDate : false;
      days.push({ day, disabled: isDisabled });
    }

    return days;
  };

  // Saati yönet
  const handleHoursChange = (text: string) => {
    // Sadece sayısal değerleri kabul et
    if (/^\d{0,2}$/.test(text)) {
      setHours(text);
    }
  };

  // Dakikayı yönet
  const handleMinutesChange = (text: string) => {
    // Sadece sayısal değerleri kabul et
    if (/^\d{0,2}$/.test(text)) {
      setMinutes(text);
    }
  };

  // Tarih seçimini yönet
  const handleSelectDay = (day: number) => {
    const newDate = new Date(currentMonth);
    newDate.setDate(day);
    setSelectedDate(newDate);
  };

  // Saati onaylama
  const validateTime = () => {
    let hoursNum = parseInt(hours, 10);
    let minutesNum = parseInt(minutes, 10);

    // Geçerlilik kontrolü
    if (isNaN(hoursNum)) hoursNum = 0;
    if (isNaN(minutesNum)) minutesNum = 0;

    // Sınırları kontrol et
    if (hoursNum > 23) hoursNum = 23;
    if (minutesNum > 59) minutesNum = 59;

    // State'i güncelle
    setHours(hoursNum.toString().padStart(2, "0"));
    setMinutes(minutesNum.toString().padStart(2, "0"));
  };

  // Time picker görünümü
  const renderTimePicker = () => (
    <View style={styles.timePickerContainer}>
      <Text style={styles.timePickerTitle}>Saat Seçin</Text>

      <View style={styles.timeInputContainer}>
        <TextInput
          style={styles.timeInput}
          value={hours}
          onChangeText={handleHoursChange}
          keyboardType="numeric"
          maxLength={2}
          onBlur={validateTime}
        />
        <Text style={styles.timeSeparator}>:</Text>
        <TextInput
          style={styles.timeInput}
          value={minutes}
          onChangeText={handleMinutesChange}
          keyboardType="numeric"
          maxLength={2}
          onBlur={validateTime}
        />
      </View>

      <Text style={styles.timeHint}>24 saat formatında (00:00 - 23:59)</Text>
    </View>
  );

  // Takvim görünümü
  const renderCalendar = () => (
    <View style={styles.calendarContainer}>
      <View style={styles.calendarHeader}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>

        <Text style={styles.calendarTitle}>
          {MONTHS_TR[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </Text>

        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <ChevronRight size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.daysOfWeek}>
        {DAYS_TR.map((day, index) => (
          <Text key={index} style={styles.dayOfWeekText}>
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.daysContainer}>
        {generateDays().map((dayInfo, index) => {
          if (dayInfo === null) {
            return <View key={`empty-${index}`} style={styles.emptyDay} />;
          }

          const isSelected =
            selectedDate.getDate() === dayInfo.day &&
            selectedDate.getMonth() === currentMonth.getMonth() &&
            selectedDate.getFullYear() === currentMonth.getFullYear();

          return (
            <TouchableOpacity
              key={`day-${index}`}
              style={[
                styles.dayButton,
                isSelected && styles.selectedDay,
                dayInfo.disabled && styles.disabledDay,
              ]}
              onPress={() => !dayInfo.disabled && handleSelectDay(dayInfo.day)}
              disabled={dayInfo.disabled}
            >
              <Text
                style={[
                  styles.dayText,
                  isSelected && styles.selectedDayText,
                  dayInfo.disabled && styles.disabledDayText,
                ]}
              >
                {dayInfo.day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <FormControl isInvalid={!!error}>
      <FormControlLabel>{label}</FormControlLabel>
      <TouchableOpacity
        style={[styles.input, error ? styles.inputError : null]}
        onPress={showModal}
      >
        <View style={styles.inputContent}>
          {mode === "date" ? (
            <Calendar size={18} color="#6B7280" style={styles.icon} />
          ) : (
            <Clock size={18} color="#6B7280" style={styles.icon} />
          )}
          <Text style={styles.inputText}>
            {value
              ? formatDate(value)
              : mode === "date"
              ? "Tarih seçin"
              : "Saat seçin"}
          </Text>
        </View>
      </TouchableOpacity>
      {error && <FormControlError>{error}</FormControlError>}

      {/* Custom Modal */}
      <Modal
        transparent={true}
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={hideModal}
      >
        <TouchableWithoutFeedback onPress={hideModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {mode === "date" ? "Tarih Seç" : "Saat Seç"}
                  </Text>
                  <TouchableOpacity
                    onPress={hideModal}
                    style={styles.closeButton}
                  >
                    <X size={24} color="#333" />
                  </TouchableOpacity>
                </View>

                {mode === "date" ? renderCalendar() : renderTimePicker()}

                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={hideModal}
                  >
                    <Text style={styles.cancelButtonText}>İptal</Text>
                  </TouchableOpacity>
                  <Button style={styles.confirmButton} onPress={handleConfirm}>
                    <ButtonText>Onayla</ButtonText>
                  </Button>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </FormControl>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "white",
    height: 48,
    justifyContent: "center",
  },
  inputContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 10,
  },
  inputError: {
    borderColor: "#EF4444",
  },
  inputText: {
    fontSize: 14,
    color: "#0F172A",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    width: "85%",
    maxHeight: "80%",
    padding: 16,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
  },
  closeButton: {
    padding: 4,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  confirmButton: {
    backgroundColor: "#4e54c8",
    paddingHorizontal: 16,
  },
  cancelButton: {
    padding: 12,
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#64748B",
  },
  // Takvim stilleri
  calendarContainer: {
    marginVertical: 8,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  navButton: {
    padding: 8,
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },
  daysOfWeek: {
    flexDirection: "row",
    marginBottom: 8,
  },
  dayOfWeekText: {
    flex: 1,
    textAlign: "center",
    color: "#64748B",
    fontWeight: "600",
    fontSize: 13,
  },
  daysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  emptyDay: {
    width: "14.28%",
    aspectRatio: 1,
  },
  dayButton: {
    width: "14.28%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedDay: {
    backgroundColor: "#4e54c8",
    borderRadius: 16,
  },
  disabledDay: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: 14,
    color: "#0F172A",
  },
  selectedDayText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  disabledDayText: {
    color: "#94A3B8",
  },
  // Saat seçici stilleri
  timePickerContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  timePickerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 20,
  },
  timeInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  timeInput: {
    width: 60,
    height: 60,
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    fontSize: 26,
    textAlign: "center",
    color: "#0F172A",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  timeSeparator: {
    fontSize: 26,
    color: "#0F172A",
    marginHorizontal: 10,
  },
  timeHint: {
    marginTop: 10,
    color: "#64748B",
    fontSize: 14,
  },
});
