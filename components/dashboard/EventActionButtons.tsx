import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import { MessageSquare, Share } from "lucide-react-native";

interface EventActionButtonsProps {
  isJoined: boolean;
  onToggleJoin: () => void;
  onContact: () => void;
  onShare: () => void;
}

const EventActionButtons: React.FC<EventActionButtonsProps> = ({
  isJoined,
  onToggleJoin,
  onContact,
  onShare,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Button
          variant={isJoined ? "outline" : "solid"}
          style={[
            styles.joinButton,
            isJoined ? styles.leaveButton : styles.joinButton,
          ]}
          onPress={onToggleJoin}
        >
          <ButtonText style={isJoined ? styles.leaveButtonText : {}}>
            {isJoined ? "Ayrıl" : "Katıl"}
          </ButtonText>
        </Button>

        <Button variant="outline" style={styles.iconButton} onPress={onContact}>
          <ButtonIcon as={MessageSquare} />
        </Button>

        <Button variant="outline" style={styles.iconButton} onPress={onShare}>
          <ButtonIcon as={Share} />
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  joinButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: "#10B981",
  },
  leaveButton: {
    borderColor: "#EF4444",
  },
  leaveButtonText: {
    color: "#EF4444",
  },
  iconButton: {
    width: 48,
    height: 48,
    marginLeft: 8,
    borderColor: "#E2E8F0",
  },
});

export default EventActionButtons;
