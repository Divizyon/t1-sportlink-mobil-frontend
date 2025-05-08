import { Stack } from "expo-router";

export default function FriendRequestsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="index"
        options={{
          title: "Arkadaşlık İstekleri",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
