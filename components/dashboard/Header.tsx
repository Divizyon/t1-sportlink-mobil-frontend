import React from "react";
import { StyleSheet, TouchableOpacity, Image, View } from "react-native";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Settings, Bell } from "lucide-react-native";

// Tema renkleri - daha açık, yumuşak yeşil
const theme = {
  primary: "#34D399", // Açık, yumuşak yeşil
  text: "#0F172A", // Ana metin
};

interface HeaderProps {
  userName: string;
  userAvatar: string;
  isPro: boolean;
}

const Header: React.FC<HeaderProps> = ({ userName, userAvatar, isPro }) => {
  return (
    <Box style={styles.header}>
      <HStack style={styles.userInfo}>
        <Image source={{ uri: userAvatar }} style={styles.avatar} />
        <VStack style={{ marginLeft: 8 }}>
          <Text style={styles.userName}>{userName}</Text>
          {isPro && (
            <Box style={styles.proBadge}>
              <Text style={styles.proText}>PRO</Text>
            </Box>
          )}
        </VStack>
      </HStack>
      <HStack>
        <TouchableOpacity style={styles.iconButton}>
          <Settings size={22} color={theme.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Bell size={22} color={theme.text} />
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
  },
});

export default Header;
