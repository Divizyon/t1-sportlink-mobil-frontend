import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MapPin, Users } from "lucide-react-native";

// Tema renkleri - daha koyu yeşil
const theme = {
  primary: "#10B981", // Ana yeşil renk - daha koyu (eski: #34D399)
  primaryLight: "#A7F3D0", // Çok açık yeşil (eski: #D1FAE5)
  primaryPale: "#D1FAE5", // En açık yeşil tonu (eski: #ECFDF5)
  background: "#FFFFFF", // Arka plan
  text: "#0F172A", // Ana metin
  textSecondary: "#64748B", // İkincil metin
};

type TabSelectorProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
};

const TabSelector = ({ activeTab, onTabChange }: TabSelectorProps) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.tab, activeTab === "nearby" && styles.activeTab]}
        onPress={() => onTabChange("nearby")}
      >
        <MapPin
          size={18}
          color={activeTab === "nearby" ? "#22C55E" : "#64748B"}
        />
        <Text
          style={[styles.tabText, activeTab === "nearby" && styles.activeTabText]}
        >
          Yakındakiler
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === "joined" && styles.activeTab]}
        onPress={() => onTabChange("joined")}
      >
        <Users
          size={18}
          color={activeTab === "joined" ? "#22C55E" : "#64748B"}
        />
        <Text
          style={[styles.tabText, activeTab === "joined" && styles.activeTabText]}
        >
          Katıldıklarım
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    margin: 16,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  activeTab: {
    backgroundColor: "#F0FDF9",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748B",
  },
  activeTabText: {
    color: "#22C55E",
    fontWeight: "600",
  },
});

export default TabSelector;
