import { Stack } from "expo-router";
import React from "react";

export default function ProfileLayout() {
  console.log("Profile layout oluşturuluyor");
  
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: "Profil" }} />
      <Stack.Screen name="find-friends/index" options={{ title: "Arkadaş Bul" }} />
      <Stack.Screen name="friends-list" options={{ title: "Arkadaşlarım" }} />
    </Stack>
  );
}
