import React from "react";
import { StyleSheet, TouchableOpacity, Text, View } from "react-native";
import { Plus } from "lucide-react-native";

interface CreateEventButtonProps {
  onPress: () => void;
}

const CreateEventButton: React.FC<CreateEventButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.createButton} onPress={onPress}>
      <View style={styles.buttonContent}>
        <Text style={styles.buttonText}>Etkinlik oluştur</Text>
        <Plus size={24} color="white" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  createButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#10B981",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 28,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    marginRight: 8,
    fontSize: 16,
  },
});

export default CreateEventButton;
