import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { MessageSquare, Send, Star } from "lucide-react-native";

interface Review {
  id: number;
  user: {
    name: string;
    avatar: string;
  };
  rating: number;
  content: string;
  date: string;
}

interface EventReviewsProps {
  eventId: number;
  reviews?: Review[];
}

const StarRating = ({
  rating,
  maxRating = 5,
  size = 18,
  color = "#F59E0B",
  onRatingChange,
}: {
  rating: number;
  maxRating?: number;
  size?: number;
  color?: string;
  onRatingChange?: (rating: number) => void;
}) => {
  return (
    <HStack style={styles.starContainer}>
      {Array.from({ length: maxRating }).map((_, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => onRatingChange && onRatingChange(index + 1)}
          style={{ padding: 2 }}
        >
          <Star
            size={size}
            color={color}
            fill={index < rating ? color : "transparent"}
          />
        </TouchableOpacity>
      ))}
    </HStack>
  );
};

const EventReviews: React.FC<EventReviewsProps> = ({
  eventId,
  reviews: initialReviews = [],
}) => {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);

  const handleSubmitReview = () => {
    if (comment.trim() === "") {
      Alert.alert("Uyarı", "Lütfen bir yorum yazınız.");
      return;
    }

    if (rating === 0) {
      Alert.alert("Uyarı", "Lütfen bir puan veriniz.");
      return;
    }

    // Gerçek uygulamada, burada API çağrısı yapılır
    const newReview: Review = {
      id: reviews.length + 1,
      user: {
        name: "Sen",
        avatar: "https://randomuser.me/api/portraits/men/1.jpg",
      },
      rating,
      content: comment,
      date: new Date().toLocaleDateString("tr-TR"),
    };

    setReviews([newReview, ...reviews]);
    setComment("");
    setRating(0);
  };

  return (
    <Box style={styles.container}>
      {/* Yorum Başlığı */}

      {/* Yorum Ekleme */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={100}
      >
        <Box style={styles.addCommentContainer}>
          <Text style={styles.ratingLabel}>Puan Ver</Text>
          <StarRating rating={rating} onRatingChange={setRating} />

          <HStack style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Yorumunuzu yazın..."
              placeholderTextColor="#A1A1AA"
              value={comment}
              onChangeText={setComment}
              multiline
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                comment.trim() === "" || rating === 0
                  ? styles.sendButtonDisabled
                  : null,
              ]}
              disabled={comment.trim() === "" || rating === 0}
              onPress={handleSubmitReview}
            >
              <Send
                size={18}
                color={
                  comment.trim() === "" || rating === 0 ? "#A1A1AA" : "#FFFFFF"
                }
              />
            </TouchableOpacity>
          </HStack>
        </Box>
      </KeyboardAvoidingView>

      {/* Yorum Listesi */}
      <Box style={styles.reviewsContainer}>
        {reviews.length === 0 ? (
          <Text style={styles.noReviews}>
            Henüz yorum yapılmamış. İlk yorumu sen yap!
          </Text>
        ) : (
          reviews.map((review, index) => (
            <Box
              key={review.id}
              style={[
                styles.reviewItem,
                index !== reviews.length - 1 && styles.reviewItemBorder,
              ]}
            >
              <HStack style={styles.reviewHeader}>
                <HStack style={styles.userInfo}>
                  <Image
                    source={{ uri: review.user.avatar }}
                    style={styles.avatar}
                  />
                  <Text style={styles.username}>{review.user.name}</Text>
                </HStack>
                <Text style={styles.date}>{review.date}</Text>
              </HStack>

              <StarRating rating={review.rating} size={14} />

              <Text style={styles.reviewContent}>{review.content}</Text>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  header: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },
  addCommentContainer: {
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748B",
    marginBottom: 8,
  },
  starContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  commentInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 80,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 12,
    fontSize: 14,
    color: "#0F172A",
  },
  sendButton: {
    backgroundColor: "#10B981",
    borderRadius: 12,
    padding: 12,
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#E2E8F0",
  },
  reviewsContainer: {
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  noReviews: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    padding: 20,
  },
  reviewItem: {
    paddingVertical: 12,
  },
  reviewItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  username: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  date: {
    fontSize: 12,
    color: "#94A3B8",
  },
  rating: {
    marginBottom: 8,
  },
  reviewContent: {
    fontSize: 14,
    lineHeight: 20,
    color: "#64748B",
    marginTop: 8,
  },
});

export default EventReviews;
