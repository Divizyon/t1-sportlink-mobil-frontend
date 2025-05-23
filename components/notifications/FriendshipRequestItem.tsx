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
import { Check, X } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

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

  // Profil resmi kontrolü
  const hasProfilePicture =
    request.requester?.profile_picture &&
    request.requester.profile_picture.length > 0;

  // Varsayılan olarak arkadaşlık istekleri sayfasına yönlendir
  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.9}
      disabled={isProcessing}
      style={styles.touchable}
    >
      <LinearGradient
        colors={["#1a543f", "#1e634c"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <View style={styles.content}>
          <View style={styles.userInfo}>
            {hasProfilePicture ? (
              <Image
                source={{ uri: request.requester.profile_picture }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                  {requesterName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}

            <View style={styles.textContainer}>
              <Text style={styles.nameText}>{requesterName}</Text>
              <Text style={styles.messageText}>
                sizinle arkadaş olmak istiyor
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
                <>
                  <Check size={16} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.acceptText}>Kabul Et</Text>
                </>
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
                <ActivityIndicator size="small" color="#444" />
              ) : (
                <>
                  <X size={16} color="#444" style={styles.buttonIcon} />
                  <Text style={styles.rejectText}>Reddet</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  container: {
    borderRadius: 16,
  },
  content: {
    padding: 16,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.3)",
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.3)",
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
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 3,
  },
  messageText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 3,
  },
  timeText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 100,
    justifyContent: "center",
  },
  buttonIcon: {
    marginRight: 4,
  },
  acceptButton: {
    backgroundColor: "#10B981",
  },
  acceptText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  rejectButton: {
    backgroundColor: "#f0f0f0",
  },
  rejectText: {
    color: "#444",
    fontWeight: "600",
    fontSize: 14,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default FriendshipRequestItem;
