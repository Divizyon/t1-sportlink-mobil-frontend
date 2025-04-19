import React from "react";
import { View, Image, SafeAreaView, StatusBar } from "react-native";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { VStack } from "@/components/ui/vstack";
import { router } from "expo-router";

export default function Index() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={{ flex: 1, paddingHorizontal: 24, paddingVertical: 16 }}>
        <Center style={{ flex: 1 }}>
          <VStack space="3xl" style={{ alignItems: "center" }}>
            {/* Logo alanı */}
            <Box style={{ marginBottom: 20 }}>
              <Image
                source={require("../assets/images/logo.png")}
                style={{ width: 120, height: 40 }}
                resizeMode="contain"
              />
            </Box>

            {/* Başlık ve Açıklama */}
            <VStack space="md" style={{ alignItems: "center" }}>
              <Text
                className="text-emerald-800 text-3xl"
                style={{ fontWeight: "bold", textAlign: "center" }}
              >
                Ufkunuzu Spor ile Genişletin
              </Text>

              <Text
                className="text-emerald-600 text-center"
                style={{ marginTop: 8, marginBottom: 20 }}
              >
                SportLink ile istediğiniz zaman, istediğiniz yerde spor
                etkinliklerine erişin ve keşfedin.
              </Text>
            </VStack>

            {/* Butonlar */}
            <VStack space="md" style={{ width: "100%", marginTop: 20 }}>
              <Button
                size="lg"
                className="bg-emerald-600 rounded-lg"
                onPress={() => router.navigate("/(auth)/signup")}
              >
                <ButtonText style={{ fontWeight: "bold" }}>Kayıt Ol</ButtonText>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="border-emerald-600 rounded-lg"
                onPress={() => router.navigate("/(auth)/signin")}
              >
                <ButtonText
                  className="text-emerald-600"
                  style={{ fontWeight: "bold" }}
                >
                  Giriş Yap
                </ButtonText>
              </Button>
            </VStack>
          </VStack>
        </Center>
      </View>
    </SafeAreaView>
  );
}
