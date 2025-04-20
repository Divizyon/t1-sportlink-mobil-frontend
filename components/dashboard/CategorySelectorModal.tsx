import React from "react";
import {
  StyleSheet,
  Modal,
  FlatList,
  TouchableOpacity,
  View,
} from "react-native";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { Button, ButtonText } from "@/components/ui/button";
import { X, Check } from "lucide-react-native";

interface Category {
  id: number;
  name: string;
  icon: string;
}

interface CategorySelectorModalProps {
  visible: boolean;
  categories: Category[];
  selectedCategory: string;
  onSelect: (category: string) => void;
  onClose: () => void;
}

const CategorySelectorModal: React.FC<CategorySelectorModalProps> = ({
  visible,
  categories,
  selectedCategory,
  onSelect,
  onClose,
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Box style={styles.modalOverlay}>
        <Box style={styles.modalContent}>
          <HStack style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Kategori Seçin</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#64748B" />
            </TouchableOpacity>
          </HStack>

          <FlatList
            data={categories}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.categoryItem}
                onPress={() => onSelect(item.name)}
              >
                <HStack style={styles.categoryContent}>
                  <Text style={styles.categoryIcon}>{item.icon}</Text>
                  <Text style={styles.categoryName}>{item.name}</Text>
                </HStack>
                {selectedCategory === item.name && (
                  <Check size={20} color="#4F46E5" />
                )}
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.categoriesList}
          />

          <Button style={styles.doneButton} onPress={onClose}>
            <ButtonText>Tamam</ButtonText>
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
  },
  closeButton: {
    padding: 4,
  },
  categoriesList: {
    paddingBottom: 16,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  categoryContent: {
    alignItems: "center",
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    color: "#0F172A",
  },
  doneButton: {
    marginTop: 8,
  },
});

export default CategorySelectorModal;
