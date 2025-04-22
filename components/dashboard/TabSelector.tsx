import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { MapPin, UserCheck } from "lucide-react-native";

// Tema renkleri - daha koyu yeşil
const theme = {
  primary: "#10B981", // Ana yeşil renk - daha koyu (eski: #34D399)
  primaryLight: "#A7F3D0", // Çok açık yeşil (eski: #D1FAE5)
  primaryPale: "#D1FAE5", // En açık yeşil tonu (eski: #ECFDF5)
  background: "#FFFFFF", // Arka plan
  text: "#0F172A", // Ana metin
  textSecondary: "#64748B", // İkincil metin
};

interface TabSelectorProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TabSelector: React.FC<TabSelectorProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <HStack style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tabButton, activeTab === "nearby" && styles.activeTab]}
        onPress={() => onTabChange("nearby")}
      >
        <MapPin
          size={18}
          color={activeTab === "nearby" ? theme.primary : theme.textSecondary}
        />
        <Text
          style={[
            styles.tabText,
            activeTab === "nearby" && styles.activeTabText,
          ]}
        >
          Yakındakiler
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tabButton, activeTab === "joined" && styles.activeTab]}
        onPress={() => onTabChange("joined")}
      >
        <UserCheck
          size={18}
          color={activeTab === "joined" ? theme.primary : theme.textSecondary}
        />
        <Text
          style={[
            styles.tabText,
            activeTab === "joined" && styles.activeTabText,
          ]}
        >
          Katıldıklarım
        </Text>
      </TouchableOpacity>
    </HStack>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    padding: 4,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: "white",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  tabText: {
    marginLeft: 6,
    fontSize: 14,
    color: theme.textSecondary,
  },
  activeTabText: {
    color: theme.primary,
    fontWeight: "600",
  },
});

export default TabSelector;
