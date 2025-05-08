import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { FriendshipRequest } from "../../types/friendships";
import { format, formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import {
  acceptFriendshipRequest,
  rejectFriendshipRequest,
} from "../../services/api/friendships";
import { router } from "expo-router";

interface FriendshipRequestItemProps {
  request: FriendshipRequest;
  onAccept: (requestId: string) => void;
  onReject: (requestId: string) => void;
  onPress?: () => void;
  isProcessing?: boolean;
}

const FriendshipRequestItem = ({
  request,
  onAccept,
  onReject,
  onPress,
  isProcessing = false,
}: FriendshipRequestItemProps) => {
  // API'den gelen verileri güvenli bir şekilde kontrol edelim
  console.log("FriendshipRequest data:", JSON.stringify(request, null, 2));

  // Zaman formatı
  const formattedTime = React.useMemo(() => {
    try {
      return formatDistanceToNow(new Date(request.created_at), {
        addSuffix: true,
        locale: tr,
      });
    } catch (error) {
      return request.created_at || "bilinmeyen zaman";
    }
  }, [request.created_at]);

  // Gönderen kişinin adını güvenli bir şekilde alalım
  const getRequesterName = () => {
    // Requester undefined ise güvenli bir değer döndür
    if (!request.requester) {
      return "Bilinmeyen Kullanıcı";
    }

    // İlk önce first_name ve last_name birleştir
    if (request.requester.first_name || request.requester.last_name) {
      return `${request.requester.first_name || ""} ${
        request.requester.last_name || ""
      }`.trim();
    }

    // Hiçbir isim bilgisi yoksa
    return "Bilinmeyen Kullanıcı";
  };

  const requesterName = getRequesterName();

  // Varsayılan olarak arkadaşlık istekleri sayfasına yönlendir
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push("/friend-requests" as any);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={isProcessing}
    >
      <View style={styles.container}>
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {requesterName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.nameText}>{requesterName}</Text>
            <Text style={styles.messageText}>
              sizinle arkadaş olmak istiyor.
            </Text>
            <Text style={styles.timeText}>{formattedTime}</Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.acceptButton,
              isProcessing && styles.disabledButton,
            ]}
            onPress={(e) => {
              e.stopPropagation();
              onAccept(request.id.toString());
            }}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.acceptText}>Kabul Et</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.rejectButton,
              isProcessing && styles.disabledButton,
            ]}
            onPress={(e) => {
              e.stopPropagation();
              onReject(request.id.toString());
            }}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#666" />
            ) : (
              <Text style={styles.rejectText}>Reddet</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
  },
  textContainer: {
    flex: 1,
  },
  nameText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  messageText: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  timeText: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 10,
  },
  acceptButton: {
    backgroundColor: "#4CAF50",
  },
  acceptText: {
    color: "white",
    fontWeight: "bold",
  },
  rejectButton: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  rejectText: {
    color: "#666",
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default FriendshipRequestItem;
