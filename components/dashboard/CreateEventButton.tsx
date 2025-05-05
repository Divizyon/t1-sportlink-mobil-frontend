import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Plus } from "lucide-react-native";

interface CreateEventButtonProps {
  onPress: () => void;
}

const CreateEventButton: React.FC<CreateEventButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.createButton} onPress={onPress}>
      <Plus size={24} color="white" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  createButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#10B981",
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});

export default CreateEventButton;
