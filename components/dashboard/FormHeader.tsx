import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { ArrowLeft } from "lucide-react-native";

interface FormHeaderProps {
  title: string;
  onBack: () => void;
}

const FormHeader: React.FC<FormHeaderProps> = ({ title, onBack }) => {
  return (
    <Box style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <ArrowLeft size={24} color="#0F0F0F" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <Box style={{ width: 24 }} />
    </Box>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
  },
});

export default FormHeader;
