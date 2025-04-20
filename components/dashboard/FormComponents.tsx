import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  TextInput,
  View,
  Image,
} from "react-native";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { ChevronLeft, Calendar, Clock } from "lucide-react-native";

interface FormHeaderProps {
  title: string;
  onBack: () => void;
}

export const FormHeader: React.FC<FormHeaderProps> = ({ title, onBack }) => {
  return (
    <HStack style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <ChevronLeft size={24} color="#1F2937" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={{ width: 40 }} />
    </HStack>
  );
};

interface FormInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: "default" | "number-pad" | "email-address" | "phone-pad";
  icon?: React.ReactNode;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = "default",
  icon,
}) => {
  return (
    <Box style={styles.formGroup}>
      <Text style={styles.label}>{label}</Text>
      {icon ? (
        <Box style={styles.inputWithIcon}>
          {icon}
          <TextInput
            style={styles.iconInput}
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
            placeholderTextColor="#9CA3AF"
          />
        </Box>
      ) : (
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          placeholderTextColor="#9CA3AF"
        />
      )}
    </Box>
  );
};

interface FormTextAreaProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  numberOfLines?: number;
}

export const FormTextArea: React.FC<FormTextAreaProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  numberOfLines = 4,
}) => {
  return (
    <Box style={styles.formGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, styles.textArea, { height: numberOfLines * 24 }]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        multiline={true}
        numberOfLines={numberOfLines}
        textAlignVertical="top"
        placeholderTextColor="#9CA3AF"
      />
    </Box>
  );
};

interface LocationSelectorProps {
  label: string;
  value: string;
  mapPreviewUrl: string;
  onPress: () => void;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  label,
  value,
  mapPreviewUrl,
  onPress,
}) => {
  return (
    <Box style={styles.formGroup}>
      <Text style={styles.label}>{label}</Text>

      <TouchableOpacity onPress={onPress}>
        <Box style={styles.locationContainer}>
          {value ? (
            <>
              <Image
                source={{ uri: mapPreviewUrl }}
                style={styles.locationImage}
              />
              <Box style={styles.locationTextContainer}>
                <Text style={styles.locationText}>{value}</Text>
              </Box>
            </>
          ) : (
            <Box style={styles.locationPlaceholder}>
              <Text style={styles.placeholderText}>
                Konum seçmek için dokunun
              </Text>
            </Box>
          )}
        </Box>
      </TouchableOpacity>
    </Box>
  );
};

interface FormDateTimeProps {
  dateLabel?: string;
  datePlaceholder?: string;
  dateValue: string;
  onDateChange: (text: string) => void;
  timeLabel?: string;
  timePlaceholder?: string;
  timeValue: string;
  onTimeChange: (text: string) => void;
}

export const FormDateTime: React.FC<FormDateTimeProps> = ({
  dateLabel = "Tarih",
  datePlaceholder = "GG/AA/YYYY",
  dateValue,
  onDateChange,
  timeLabel = "Saat",
  timePlaceholder = "HH:MM",
  timeValue,
  onTimeChange,
}) => {
  return (
    <HStack style={styles.rowFormGroup}>
      <Box style={styles.formGroupHalf}>
        <Text style={styles.label}>{dateLabel}</Text>
        <Box style={styles.inputWithIcon}>
          <Calendar size={20} color="#4F46E5" style={styles.inputIcon} />
          <TextInput
            style={styles.iconInput}
            placeholder={datePlaceholder}
            value={dateValue}
            onChangeText={onDateChange}
            placeholderTextColor="#9CA3AF"
          />
        </Box>
      </Box>

      <Box style={styles.formGroupHalf}>
        <Text style={styles.label}>{timeLabel}</Text>
        <Box style={styles.inputWithIcon}>
          <Clock size={20} color="#4F46E5" style={styles.inputIcon} />
          <TextInput
            style={styles.iconInput}
            placeholder={timePlaceholder}
            value={timeValue}
            onChangeText={onTimeChange}
            placeholderTextColor="#9CA3AF"
          />
        </Box>
      </Box>
    </HStack>
  );
};

const styles = StyleSheet.create({
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
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
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
  locationContainer: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  locationImage: {
    width: "100%",
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  locationTextContainer: {
    padding: 16,
    backgroundColor: "#F9FAFB",
  },
  locationText: {
    fontSize: 16,
    color: "#1F2937",
  },
  locationPlaceholder: {
    backgroundColor: "#F9FAFB",
    padding: 16,
    height: 120,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "#9CA3AF",
    fontSize: 16,
  },
});
