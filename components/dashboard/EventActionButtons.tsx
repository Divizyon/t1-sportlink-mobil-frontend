import React from "react";
import { StyleSheet } from "react-native";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import {
  UserCheck,
  Star,
  MessageSquare,
  Share2,
  Users,
} from "lucide-react-native";

interface EventActionButtonsProps {
  isJoined: boolean;
  onToggleJoin: () => void;
  onRate: () => void;
  onContact?: () => void;
  onShare?: () => void;
}

const EventActionButtons: React.FC<EventActionButtonsProps> = ({
  isJoined,
  onToggleJoin,
  onRate,
  onContact,
  onShare,
}) => {
  return (
    <Box style={styles.actionContainer}>
      <Button
        size="lg"
        variant={isJoined ? "outline" : "solid"}
        style={[styles.mainButton, isJoined && styles.joinedButton]}
        onPress={onToggleJoin}
      >
        {isJoined ? (
          <UserCheck size={20} color="#4F46E5" />
        ) : (
          <Users size={20} color="white" />
        )}
        <ButtonText style={isJoined ? styles.joinedText : {}}>
          {isJoined ? "Katıldın" : "Katıl"}
        </ButtonText>
      </Button>

      <HStack style={styles.secondaryActions}>
        <Button
          size="md"
          variant="outline"
          style={styles.secondaryButton}
          onPress={onRate}
        >
          <Star size={18} color="#64748B" />
        </Button>

        {onContact && (
          <Button
            size="md"
            variant="outline"
            style={styles.secondaryButton}
            onPress={onContact}
          >
            <MessageSquare size={18} color="#64748B" />
          </Button>
        )}

        {onShare && (
          <Button
            size="md"
            variant="outline"
            style={styles.secondaryButton}
            onPress={onShare}
          >
            <Share2 size={18} color="#64748B" />
          </Button>
        )}
      </HStack>
    </Box>
  );
};

const styles = StyleSheet.create({
  actionContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  mainButton: {
    width: "100%",
    marginBottom: 12,
  },
  joinedButton: {
    backgroundColor: "transparent",
    borderColor: "#4F46E5",
  },
  joinedText: {
    color: "#4F46E5",
  },
  secondaryActions: {
    justifyContent: "space-between",
  },
  secondaryButton: {
    flex: 1,
    justifyContent: "center",
    marginHorizontal: 4,
    borderColor: "#E2E8F0",
  },
});

export default EventActionButtons;
