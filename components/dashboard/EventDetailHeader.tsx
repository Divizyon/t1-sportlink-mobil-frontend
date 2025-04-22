import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { ArrowLeft, MoreHorizontal } from "lucide-react-native";

interface EventDetailHeaderProps {
  title: string;
  onBack: () => void;
  onMore?: () => void;
}

const EventDetailHeader: React.FC<EventDetailHeaderProps> = ({
  title,
  onBack,
  onMore,
}) => {
  return (
    <Box style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <ArrowLeft size={24} color="#333" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      {onMore && (
        <TouchableOpacity style={styles.moreButton} onPress={onMore}>
          <MoreHorizontal size={24} color="#333" />
        </TouchableOpacity>
      )}
      {!onMore && <Box style={{ width: 24 }} />}
    </Box>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
  },
  moreButton: {
    padding: 4,
  },
});

export default EventDetailHeader;
