import React from "react";
import { StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";

interface FormButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "danger";
  isLoading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const FormButton: React.FC<FormButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  isLoading = false,
  disabled = false,
  icon,
  fullWidth = true,
}) => {
  const getButtonStyle = () => {
    switch (variant) {
      case "primary":
        return [styles.button, styles.primaryButton];
      case "secondary":
        return [styles.button, styles.secondaryButton];
      case "outline":
        return [styles.button, styles.outlineButton];
      case "danger":
        return [styles.button, styles.dangerButton];
      default:
        return [styles.button, styles.primaryButton];
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case "primary":
        return styles.primaryText;
      case "secondary":
        return styles.secondaryText;
      case "outline":
        return styles.outlineText;
      case "danger":
        return styles.dangerText;
      default:
        return styles.primaryText;
    }
  };

  return (
    <TouchableOpacity
      style={[
        getButtonStyle(),
        fullWidth && styles.fullWidth,
        disabled && styles.disabledButton,
      ]}
      onPress={onPress}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === "outline" ? "#4F46E5" : "#FFFFFF"}
          size="small"
        />
      ) : (
        <HStack style={styles.buttonContent}>
          {icon && <HStack style={styles.iconContainer}>{icon}</HStack>}
          <Text style={getTextStyle()}>{title}</Text>
        </HStack>
      )}
    </TouchableOpacity>
  );
};

interface FormButtonsProps {
  primaryTitle: string;
  onPrimaryPress: () => void;
  secondaryTitle: string;
  onSecondaryPress: () => void;
  isPrimaryLoading?: boolean;
  isSecondaryLoading?: boolean;
  primaryDisabled?: boolean;
  secondaryDisabled?: boolean;
}

export const FormButtons: React.FC<FormButtonsProps> = ({
  primaryTitle,
  onPrimaryPress,
  secondaryTitle,
  onSecondaryPress,
  isPrimaryLoading = false,
  isSecondaryLoading = false,
  primaryDisabled = false,
  secondaryDisabled = false,
}) => {
  return (
    <HStack style={styles.buttonsContainer}>
      <FormButton
        title={secondaryTitle}
        onPress={onSecondaryPress}
        variant="outline"
        isLoading={isSecondaryLoading}
        disabled={secondaryDisabled}
        fullWidth={false}
      />
      <FormButton
        title={primaryTitle}
        onPress={onPrimaryPress}
        variant="primary"
        isLoading={isPrimaryLoading}
        disabled={primaryDisabled}
        fullWidth={false}
      />
    </HStack>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: "#4F46E5",
  },
  secondaryButton: {
    backgroundColor: "#6B7280",
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#4F46E5",
  },
  dangerButton: {
    backgroundColor: "#EF4444",
  },
  disabledButton: {
    opacity: 0.5,
  },
  primaryText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  secondaryText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  outlineText: {
    color: "#4F46E5",
    fontWeight: "600",
    fontSize: 16,
  },
  dangerText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  fullWidth: {
    width: "100%",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    marginRight: 8,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    gap: 12,
  },
});
