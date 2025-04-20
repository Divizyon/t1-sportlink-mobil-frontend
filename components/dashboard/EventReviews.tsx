import React from "react";
import { StyleSheet, View } from "react-native";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Star } from "lucide-react-native";

interface Review {
  id: number;
  userName: string;
  rating: number;
  comment: string;
}

interface EventReviewsProps {
  reviews: Review[];
  averageRating: number;
}

const EventReviews: React.FC<EventReviewsProps> = ({
  reviews,
  averageRating,
}) => {
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={16}
          color={i <= rating ? "#F59E0B" : "#E2E8F0"}
          fill={i <= rating ? "#F59E0B" : "none"}
          style={{ marginRight: 4 }}
        />
      );
    }
    return stars;
  };

  return (
    <Box style={styles.section}>
      <Text style={styles.sectionTitle}>Değerlendirmeler</Text>

      <HStack style={styles.ratingOverview}>
        <VStack style={styles.averageRating}>
          <Text style={styles.ratingValue}>{averageRating.toFixed(1)}</Text>
          <HStack>{renderStars(Math.round(averageRating))}</HStack>
          <Text style={styles.ratingCount}>{reviews.length} değerlendirme</Text>
        </VStack>

        <VStack style={styles.ratingBars}>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = reviews.filter((r) => r.rating === star).length;
            const percentage = reviews.length
              ? (count / reviews.length) * 100
              : 0;

            return (
              <HStack key={star} style={styles.ratingBarRow}>
                <Text style={styles.ratingBarLabel}>{star}</Text>
                <Star size={12} color="#F59E0B" fill="#F59E0B" />
                <View style={styles.ratingBarContainer}>
                  <View
                    style={[styles.ratingBar, { width: `${percentage}%` }]}
                  />
                </View>
                <Text style={styles.ratingBarCount}>{count}</Text>
              </HStack>
            );
          })}
        </VStack>
      </HStack>

      <VStack style={styles.reviewsContainer}>
        {reviews.map((review) => (
          <Box key={review.id} style={styles.reviewItem}>
            <HStack style={styles.reviewHeader}>
              <Text style={styles.reviewerName}>{review.userName}</Text>
              <HStack>{renderStars(review.rating)}</HStack>
            </HStack>
            <Text style={styles.reviewComment}>{review.comment}</Text>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

const styles = StyleSheet.create({
  section: {
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 16,
  },
  ratingOverview: {
    marginBottom: 24,
  },
  averageRating: {
    alignItems: "center",
    width: 100,
    marginRight: 16,
  },
  ratingValue: {
    fontSize: 36,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  ratingCount: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 8,
  },
  ratingBars: {
    flex: 1,
    gap: 6,
  },
  ratingBarRow: {
    alignItems: "center",
  },
  ratingBarLabel: {
    width: 16,
    fontSize: 12,
    color: "#64748B",
    textAlign: "right",
    marginRight: 4,
  },
  ratingBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: "hidden",
  },
  ratingBar: {
    height: "100%",
    backgroundColor: "#F59E0B",
    borderRadius: 4,
  },
  ratingBarCount: {
    width: 20,
    fontSize: 12,
    color: "#64748B",
  },
  reviewsContainer: {
    gap: 16,
  },
  reviewItem: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 12,
  },
  reviewHeader: {
    justifyContent: "space-between",
    marginBottom: 8,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  reviewComment: {
    fontSize: 14,
    color: "#334155",
    lineHeight: 20,
  },
});

export default EventReviews;
