import React, { useState } from "react";
import {
  View,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  EventDetailHeader,
  EventInfo,
  EventParticipants,
  EventReviews,
  EventActionButtons,
  RatingModal,
} from "@/components/dashboard";

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

  const handleContact = () => {
    Alert.alert(
      "İletişim",
      `${eventDetail.organizer.name} ile iletişime geçmek için mesaj gönderebilirsiniz.`,
      [{ text: "Tamam", onPress: () => console.log("OK") }]
    );
  };

  const handleShare = () => {
    Alert.alert(
      "Paylaş",
      `${eventDetail.title} etkinliğini paylaşmak için bir platform seçin.`,
      [{ text: "Tamam", onPress: () => console.log("OK") }]
    );
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <EventDetailHeader
          title="Etkinlik Detayı"
          onBack={handleBack}
          onMore={() => console.log("More options")}
        />

        {/* Event Info */}
        <EventInfo
          title={eventDetail.title}
          description={eventDetail.description}
          date={eventDetail.date}
          time={eventDetail.time}
          location={eventDetail.location}
          distance={eventDetail.distance}
          organizer={eventDetail.organizer}
          tags={eventDetail.tags}
        />

        {/* Participants */}
        <EventParticipants
          participants={eventDetail.participants}
          participantCount={eventDetail.participantCount}
          maxParticipants={eventDetail.maxParticipants}
        />

        {/* Reviews */}
        <EventReviews
          reviews={eventDetail.reviews}
          averageRating={eventDetail.rating}
        />
      </ScrollView>

      {/* Action Buttons */}
      <EventActionButtons
        isJoined={isJoined}
        onToggleJoin={handleToggleJoin}
        onRate={handleRateEvent}
        onContact={handleContact}
        onShare={handleShare}
      />

      {/* Rating Modal */}
      <RatingModal
        visible={showRatingModal}
        eventTitle={eventDetail.title}
        rating={rating}
        comment={reviewComment}
        onChangeRating={setRating}
        onChangeComment={setReviewComment}
        onSubmit={submitRating}
        onClose={() => setShowRatingModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingTop: Platform.OS === "android" ? 25 : 0,
  },
  scrollView: {
    flex: 1,
  },
});
