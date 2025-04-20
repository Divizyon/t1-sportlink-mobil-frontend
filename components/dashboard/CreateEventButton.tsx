import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import { Plus } from "lucide-react-native";

interface CreateEventButtonProps {
  onPress: () => void;
}

const CreateEventButton: React.FC<CreateEventButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.createButton} onPress={onPress}>
      <Plus size={24} color="white" style={styles.createIcon} />
      <Text style={styles.createText}>Etkinlik Oluştur</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  createButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#4F46E5",
    borderRadius: 28,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  createIcon: {
    marginRight: 8,
  },
  createText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default CreateEventButton;
