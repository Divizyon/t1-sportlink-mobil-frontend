import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { View } from "react-native";

export default function Index() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Box className="bg-primary-500 p-5 rounded-lg">
        <Text className="text-typography-0">This is the Box</Text>
      </Box>
    </View>
  );
}
