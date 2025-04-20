import React from "react";
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  StyleProp,
  TextStyle,
  ViewStyle,
} from "react-native";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";

interface FormTextAreaProps extends TextInputProps {
  label: string;
  error?: string;
  numberOfLines?: number;
  isSubInput?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

const FormTextArea: React.FC<FormTextAreaProps> = ({
  label,
  error,
  numberOfLines = 4,
  style,
  isSubInput = false,
  containerStyle,
  ...rest
}) => {
  return (
    <Box style={[styles.formGroup, containerStyle]}>
      <Text style={[styles.label, isSubInput && styles.subLabel]}>{label}</Text>
      <Box style={[styles.inputContainer, error && styles.inputError]}>
        <TextInput
          style={[
            styles.input,
            { height: 24 * numberOfLines },
            isSubInput && styles.subInput,
            style as StyleProp<TextStyle>,
          ]}
          multiline
          numberOfLines={numberOfLines}
          textAlignVertical="top"
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
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    backgroundColor: "white",
  },
  input: {
    fontSize: 14,
    color: "#0F172A",
    padding: 12,
  },
  subInput: {
    fontSize: 13,
    padding: 10,
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

export default FormTextArea;
