import React, { useState } from "react";
import {
  View,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  MoreHorizontal,
  MessageSquare,
  UserCheck,
  Users,
  Star,
  Flag,
  Building,
  CheckCircle,
  Info,
} from "lucide-react-native";

// Örnek veri - gerçek uygulamada bu veri API'dan gelir
const eventDetail = {
  id: 1,
  title: "Basketbol Maçı",
  type: "Spor",
  category: "Basketbol",
  date: "23 Ekim",
  time: "11:00-13:00",
  location: "Konya Basket Sahası",
  coordinates: {
    latitude: 37.8651,
    longitude: 32.4932,
  },
  distance: "1.2 km",
  participants: [
    "https://randomuser.me/api/portraits/women/68.jpg",
    "https://randomuser.me/api/portraits/men/75.jpg",
    "https://randomuser.me/api/portraits/women/28.jpg",
  ],
  participantCount: 10,
  maxParticipants: 12,
  rating: 4.5,
  reviews: [
    {
      id: 1,
      userName: "Ahmet K.",
      rating: 5,
      comment: "Harika bir etkinlikti!",
    },
    {
      id: 2,
      userName: "Zeynep T.",
      rating: 4,
      comment: "Eğlenceliydi ama biraz kalabalıktı.",
    },
  ],
  isJoined: false,
  organizer: {
    id: 1,
    name: "Konya Spor Kulübü",
    isVerified: true,
    logoUrl: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  description:
    "Basketbol severler için haftalık dostluk maçı. Her seviyeden oyuncular katılabilir.",
  requirements: "Spor ayakkabı ve rahat kıyafet getirmeniz yeterli.",
  tags: ["Spor", "Basketbol"],
  notes: "Maç bitiminde sosyal bir etkinlik düzenlenecektir.",
};

export default function EventDetailsScreen() {
  const params = useLocalSearchParams();
  const eventId = params.id;

  const [isJoined, setIsJoined] = useState(eventDetail.isJoined);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");

  // Gerçek uygulamada burada eventId'ye göre veri çekilir
  console.log("Etkinlik ID:", eventId);

  const handleBack = () => {
    router.back();
  };

  const handleToggleJoin = () => {
    // Gerçek uygulamada, burada API çağrısı yapılır
    setIsJoined(!isJoined);
    Alert.alert(
      !isJoined ? "Katılım Onaylandı" : "Katılım İptal Edildi",
      !isJoined ? "Etkinliğe başarıyla katıldınız!" : "Etkinlikten ayrıldınız.",
      [{ text: "Tamam", onPress: () => console.log("OK") }]
    );
  };

  const handleRateEvent = () => {
    setShowRatingModal(true);
  };

  const submitRating = () => {
    // Gerçek uygulamada, burada API çağrısı yapılır
    console.log(`Event ${eventId} rated: ${rating}, comment: ${reviewComment}`);
    setShowRatingModal(false);
    setRating(0);
    setReviewComment("");

    Alert.alert(
      "Değerlendirme Gönderildi",
      "Geri bildiriminiz için teşekkür ederiz!",
      [{ text: "Tamam", onPress: () => console.log("OK") }]
    );
  };

  const renderStars = (count: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => setRating(i)}
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
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <Box style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Etkinlik Detayı</Text>
          <TouchableOpacity style={styles.moreButton}>
            <MoreHorizontal size={24} color="#333" />
          </TouchableOpacity>
        </Box>

        {/* Event Title and Info */}
        <VStack style={styles.eventHeaderSection}>
          <Text style={styles.eventTitle}>{eventDetail.title}</Text>
          <Text style={styles.eventDescription}>{eventDetail.description}</Text>

          {/* Tags */}
          <HStack style={styles.tagContainer}>
            {eventDetail.tags.map((tag, index) => (
              <Box key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </Box>
            ))}
          </HStack>
        </VStack>

        {/* Organizer */}
        <Box style={styles.section}>
          <HStack style={styles.organizerContainer}>
            <Image
              source={{ uri: eventDetail.organizer.logoUrl }}
              style={styles.organizerLogo}
            />
            <VStack style={{ flex: 1, marginLeft: 12 }}>
              <HStack style={{ alignItems: "center" }}>
                <Text style={styles.organizerName}>
                  {eventDetail.organizer.name}
                </Text>
                {eventDetail.organizer.isVerified && (
                  <CheckCircle
                    size={16}
                    color="#047857"
                    style={{ marginLeft: 6 }}
                  />
                )}
              </HStack>
              <Text style={styles.organizerType}>Spor Kulübü</Text>
            </VStack>
          </HStack>
        </Box>

        {/* Participants */}
        <Box style={styles.section}>
          <HStack style={styles.sectionHeader}>
            <HStack style={{ alignItems: "center" }}>
              <Users size={20} color="#333" style={{ marginRight: 6 }} />
              <Text style={styles.sectionTitle}>Katılımcılar</Text>
            </HStack>
            <Text style={styles.countText}>
              {eventDetail.participantCount}/{eventDetail.maxParticipants}{" "}
              katılımcı
            </Text>
          </HStack>

          <HStack style={styles.participantsContainer}>
            {eventDetail.participants.map((participant, index) => (
              <Image
                key={index}
                source={{ uri: participant }}
                style={styles.participantImage}
              />
            ))}
            {isJoined && (
              <Box style={styles.youAvatar}>
                <Text style={styles.youText}>Sen</Text>
              </Box>
            )}
            {eventDetail.participantCount > 3 && (
              <Box style={styles.moreAvatar}>
                <Text style={styles.moreText}>
                  +{eventDetail.participantCount - 3}
                </Text>
              </Box>
            )}
          </HStack>
        </Box>

        {/* Date and Time */}
        <Box style={styles.infoSection}>
          <HStack style={styles.infoItem}>
            <Calendar size={22} color="#047857" style={styles.infoIcon} />
            <Text style={styles.infoText}>{eventDetail.date}</Text>
          </HStack>

          <HStack style={styles.infoItem}>
            <Clock size={22} color="#047857" style={styles.infoIcon} />
            <Text style={styles.infoText}>{eventDetail.time}</Text>
          </HStack>

          <HStack style={styles.infoItem}>
            <MapPin size={22} color="#047857" style={styles.infoIcon} />
            <Text style={styles.infoText}>{eventDetail.location}</Text>
          </HStack>

          <HStack style={styles.infoItem}>
            <Building size={22} color="#047857" style={styles.infoIcon} />
            <Text style={styles.infoText}>{eventDetail.organizer.name}</Text>
          </HStack>
        </Box>

        {/* Map */}
        <Box style={styles.mapSection}>
          <Image
            source={{ uri: "https://picsum.photos/600/200" }}
            style={styles.mapImage}
            resizeMode="cover"
          />
          <View style={styles.mapMarker} />
        </Box>

        {/* Requirements */}
        <Box style={styles.requirementsSection}>
          <HStack style={{ alignItems: "center", marginBottom: 10 }}>
            <Info size={20} color="#333" style={{ marginRight: 6 }} />
            <Text style={styles.requirementsTitle}>Gereksinimler</Text>
          </HStack>
          <Text style={styles.requirementsText}>
            {eventDetail.requirements}
          </Text>
        </Box>

        {/* Reviews */}
        <Box style={styles.reviewsSection}>
          <HStack style={styles.sectionHeader}>
            <HStack style={{ alignItems: "center" }}>
              <Star
                size={20}
                color="#f59e0b"
                fill="#f59e0b"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.sectionTitle}>Değerlendirmeler</Text>
            </HStack>
            <Text style={styles.ratingText}>⭐ {eventDetail.rating}</Text>
          </HStack>

          <VStack style={styles.reviewsList}>
            {eventDetail.reviews.map((review) => (
              <Box key={review.id} style={styles.reviewItem}>
                <HStack style={styles.reviewHeader}>
                  <Text style={styles.reviewerName}>{review.userName}</Text>
                  <HStack>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        color="#f59e0b"
                        fill={i < review.rating ? "#f59e0b" : "none"}
                        style={{ marginLeft: 2 }}
                      />
                    ))}
                  </HStack>
                </HStack>
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </Box>
            ))}
          </VStack>
        </Box>

        {/* Notes */}
        <Box style={styles.notesSection}>
          <Text style={styles.notesTitle}>Notlar</Text>
          <Box style={styles.notesList}>
            <HStack style={styles.noteItem}>
              <Box style={styles.noteCheck}>
                <Text style={styles.checkText}>✓</Text>
              </Box>
              <Text style={styles.noteText}>{eventDetail.notes}</Text>
            </HStack>
          </Box>
        </Box>

        {/* Action Buttons */}
        <Box style={styles.actionButtons}>
          <Button
            style={[styles.joinButton, isJoined && styles.leaveButton]}
            onPress={handleToggleJoin}
          >
            <UserCheck size={20} color={isJoined ? "#e53935" : "#fff"} />
            <ButtonText
              style={[
                styles.joinButtonText,
                isJoined && styles.leaveButtonText,
              ]}
            >
              {isJoined ? "Katılımı İptal Et" : "Katıl"}
            </ButtonText>
          </Button>

          {isJoined && (
            <Button style={styles.rateButton} onPress={handleRateEvent}>
              <Star size={20} color="#f59e0b" />
              <ButtonText style={styles.rateButtonText}>Değerlendir</ButtonText>
            </Button>
          )}
        </Box>

        <Box style={styles.messageContainer}>
          <Button style={styles.chatButton}>
            <MessageSquare size={20} color="#047857" />
            <ButtonText style={styles.chatButtonText}>
              Gruba Mesaj Gönder
            </ButtonText>
          </Button>
        </Box>
      </ScrollView>

      {/* Rating Modal */}
      <Modal
        visible={showRatingModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRatingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Etkinliği Değerlendir</Text>

            <HStack style={styles.starsContainer}>{renderStars(rating)}</HStack>

            <TextInput
              style={styles.commentInput}
              placeholder="Deneyiminizi paylaşın (isteğe bağlı)"
              value={reviewComment}
              onChangeText={setReviewComment}
              multiline
              numberOfLines={4}
            />

            <HStack style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowRatingModal(false)}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  rating === 0 && styles.disabledButton,
                ]}
                onPress={submitRating}
                disabled={rating === 0}
              >
                <Text style={styles.submitButtonText}>Gönder</Text>
              </TouchableOpacity>
            </HStack>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  backButton: {
    padding: 4,
  },
  moreButton: {
    padding: 4,
  },
  eventHeaderSection: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
    lineHeight: 22,
  },
  tagContainer: {
    flexDirection: "row",
    marginTop: 8,
  },
  tag: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  tagText: {
    fontSize: 14,
    color: "#333",
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  organizerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  organizerLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  organizerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  organizerType: {
    fontSize: 14,
    color: "#666",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  countText: {
    fontSize: 14,
    color: "#047857",
  },
  participantsContainer: {
    flexDirection: "row",
  },
  participantImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 2,
    borderColor: "#fff",
  },
  youAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#047857",
    justifyContent: "center",
    alignItems: "center",
  },
  youText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  moreAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#047857",
    justifyContent: "center",
    alignItems: "center",
  },
  moreText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  infoSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    fontSize: 16,
    color: "#333",
  },
  mapSection: {
    position: "relative",
    height: 200,
    margin: 16,
    borderRadius: 10,
    overflow: "hidden",
  },
  mapImage: {
    width: "100%",
    height: "100%",
  },
  mapMarker: {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#047857",
    borderWidth: 3,
    borderColor: "#fff",
    marginLeft: -8,
    marginTop: -8,
  },
  requirementsSection: {
    padding: 16,
  },
  requirementsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  requirementsText: {
    fontSize: 16,
    color: "#666",
  },
  reviewsSection: {
    padding: 16,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  reviewItem: {
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  reviewComment: {
    fontSize: 16,
    color: "#666",
  },
  notesSection: {
    padding: 16,
  },
  notesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  notesList: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 16,
  },
  noteItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  noteCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#047857",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  checkText: {
    color: "#fff",
    fontSize: 14,
  },
  noteText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    lineHeight: 22,
  },
  actionButtons: {
    padding: 16,
    marginBottom: 30,
  },
  joinButton: {
    backgroundColor: "#e6f7f4",
    borderRadius: 10,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  leaveButton: {
    backgroundColor: "#e53935",
    borderRadius: 10,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  joinButtonText: {
    color: "#047857",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  leaveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  rateButton: {
    backgroundColor: "#f59e0b",
    borderRadius: 10,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  rateButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  messageContainer: {
    padding: 16,
  },
  chatButton: {
    backgroundColor: "#e6f7f4",
    borderRadius: 10,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  chatButtonText: {
    color: "#047857",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  commentInput: {
    height: 100,
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    backgroundColor: "#e53935",
    borderRadius: 10,
    padding: 12,
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: "#047857",
    borderRadius: 10,
    padding: 12,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  reviewsList: {
    marginTop: 8,
  },
});
