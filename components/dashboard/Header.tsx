import React from "react";
import { StyleSheet, TouchableOpacity, Image, View } from "react-native";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { MessageCircle } from "lucide-react-native";
import { router } from "expo-router";

// Tema renkleri - daha koyu, yumuşak yeşil
const theme = {
  primary: "#10B981", // Daha koyu, yumuşak yeşil (eski: #34D399)
  text: "#0F172A", // Ana metin
};

interface HeaderProps {
  userName: string;
  userAvatar: string;
  isPro: boolean;
  unreadMessages?: number;
}

const Header: React.FC<HeaderProps> = ({
  userName,
  userAvatar,
  unreadMessages = 0,
}) => {
  const handleMessagesPress = () => {
    router.push("/(tabs)/profile/friends-list", {
      withAnchor:true,
    });
  };
  return (
    <Box style={styles.header}>
      <HStack style={styles.userInfo}>
        <Image source={{ uri: userAvatar }} style={styles.avatar} />
        <VStack style={{ marginLeft: 8 }}>
          <Text style={styles.userName}>{userName}</Text>
        </VStack>
      </HStack>
      <HStack>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleMessagesPress}
        >
          <MessageCircle size={22} color={theme.text} />
          {unreadMessages > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadMessages > 99 ? "99+" : unreadMessages}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </HStack>
    </Box>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.text,
  },
  proBadge: {
    backgroundColor: theme.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  proText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    marginLeft: 8,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#F43F5E",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
});

export default Header;
