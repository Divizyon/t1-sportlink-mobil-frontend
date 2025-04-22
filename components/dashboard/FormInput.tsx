import React from "react";
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  StyleProp,
  TextStyle,
  ViewStyle,
} from "react-native";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { LucideIcon } from "lucide-react-native";

interface FormInputProps extends TextInputProps {
  label: string;
  icon?: React.ReactNode;
  error?: string;
  isSubInput?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  icon,
  error,
  style,
  isSubInput = false,
  containerStyle,
  ...rest
}) => {
  return (
    <Box style={[styles.formGroup, containerStyle]}>
      <Text style={[styles.label, isSubInput && styles.subLabel]}>{label}</Text>
      <Box style={[styles.inputContainer, error && styles.inputError]}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <TextInput
          style={[
            styles.input,
            icon ? styles.inputWithIcon : undefined,
            isSubInput && styles.subInput,
            style as StyleProp<TextStyle>,
          ]}
          placeholderTextColor="#9CA3AF"
          {...rest}
        />
      </Box>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </Box>
  );
};

const styles = StyleSheet.create({
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 6,
  },
  subLabel: {
    fontSize: 12,
    color: "#64748B",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    backgroundColor: "white",
  },
  iconContainer: {
    paddingLeft: 12,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 14,
    color: "#0F172A",
    paddingHorizontal: 12,
  },
  subInput: {
    height: 40,
    fontSize: 13,
  },
  inputWithIcon: {
    paddingLeft: 8,
  },
  inputError: {
    borderColor: "#EF4444",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 4,
  },
});

export default FormInput;
