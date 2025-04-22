import React from "react";
import {
  StyleSheet,
  Modal,
  View,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Button, ButtonText } from "@/components/ui/button";
import { Star, X } from "lucide-react-native";

interface RatingModalProps {
  visible: boolean;
  eventTitle?: string;
  rating: number;
  comment: string;
  onChangeRating: (rating: number) => void;
  onChangeComment: (comment: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

const RatingModal: React.FC<RatingModalProps> = ({
  visible,
  eventTitle,
  rating,
  comment,
  onChangeRating,
  onChangeComment,
  onSubmit,
  onClose,
}) => {
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => onChangeRating(i)}
          style={{ padding: 5 }}
        >
          <Star
            size={24}
            color={i <= rating ? "#f59e0b" : "#e2e8f0"}
            fill={i <= rating ? "#f59e0b" : "none"}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Box style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#64748B" />
          </TouchableOpacity>

          <VStack style={styles.modalBody}>
            <Text style={styles.modalTitle}>Etkinliği Değerlendir</Text>
            {eventTitle && <Text style={styles.eventTitle}>{eventTitle}</Text>}

            <Box style={styles.ratingContainer}>
              <Text style={styles.ratingLabel}>Puanınız</Text>
              <HStack style={styles.starsContainer}>{renderStars()}</HStack>
            </Box>

            <Box style={styles.commentContainer}>
              <Text style={styles.commentLabel}>Yorumunuz</Text>
              <TextInput
                style={styles.commentInput}
                placeholder="Etkinlik hakkında düşüncelerinizi yazın..."
                value={comment}
                onChangeText={onChangeComment}
                multiline={true}
                numberOfLines={4}
                placeholderTextColor="#9CA3AF"
              />
            </Box>

            <Button style={styles.submitButton} onPress={onSubmit}>
              <ButtonText>Değerlendirmeyi Gönder</ButtonText>
            </Button>
          </VStack>
        </Box>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  closeButton: {
    position: "absolute",
    right: 16,
    top: 16,
    zIndex: 1,
  },
  modalBody: {
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 16,
    color: "#64748B",
    marginBottom: 20,
    textAlign: "center",
  },
  ratingContainer: {
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: "row",
  },
  commentContainer: {
    width: "100%",
    marginBottom: 24,
  },
  commentLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 12,
    height: 100,
    textAlignVertical: "top",
    fontSize: 14,
    color: "#0F172A",
  },
  submitButton: {
    width: "100%",
  },
});

export default RatingModal;
