import React, { useEffect, useState } from "react";
import {
  View,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  Dimensions,
  StyleSheet,
} from "react-native";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/src/store/AuthContext";

const { width } = Dimensions.get("window");

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  const [isReady, setIsReady] = useState(false);

  // Kullanıcı durumunun yüklenmesini bekleyin
  useEffect(() => {
    if (!isLoading) {
      setIsReady(true);
    }
  }, [isLoading]);

  return (
    <ImageBackground
      source={require("../assets/images/ilksayfa.jpg")}
      style={styles.backgroundImage}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Üst kısımdaki gradyan efekti */}

      <SafeAreaView style={styles.container}>
        <View style={styles.contentContainer}>
          {/* Logo alanı */}
          <Box style={styles.logoContainer}>
            <Text style={styles.logoTextSport}>SPORT</Text>
            <Text style={styles.logoTextLink}>link</Text>
          </Box>
          <Box style={styles.contentBox}>
            {/* Başlık ve Açıklama */}
            <VStack space="md" style={styles.textContainer}>
              <Text className="text-white text-3xl" style={styles.title}>
                Ufkunuzu Spor ile Genişletin
              </Text>

              <Text
                className="text-white text-center"
                style={styles.description}
              >
                SportLink ile istediğiniz zaman, istediğiniz yerde spor
                etkinliklerine erişin ve keşfedin.
              </Text>
            </VStack>

            {/* Butonlar */}
            <VStack space="md" style={styles.buttonContainer}>
              {isReady && isAuthenticated ? (
                // Kullanıcı giriş yapmışsa
                <Button
                  size="lg"
                  style={styles.primaryButton}
                  onPress={() => router.navigate("/(tabs)/dashboard")}
                >
                  <ButtonText style={styles.primaryButtonText}>
                    Etkinliklere Git
                  </ButtonText>
                </Button>
              ) : (
                // Kullanıcı giriş yapmamışsa
                <>
                  <Button
                    size="lg"
                    style={styles.primaryButton}
                    onPress={() => router.navigate("/(auth)/signup")}
                  >
                    <ButtonText style={styles.primaryButtonText}>
                      Kayıt Ol
                    </ButtonText>
                  </Button>

                  <Button
                    size="lg"
                    style={styles.secondaryButton}
                    onPress={() => router.navigate("/(auth)/signin")}
                  >
                    <ButtonText style={styles.secondaryButtonText}>
                      Giriş Yap
                    </ButtonText>
                  </Button>
                </>
              )}
            </VStack>
          </Box>
        </View>

        {/* Alt kısımdaki gradyan efekti */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)"]}
          style={styles.bottomGradient}
        />
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center", // ortalama
  },
  topGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 150,
    zIndex: 1,
  },
  bottomGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 200,
  },
  contentContainer: {
    width: "100%",
    paddingHorizontal: 20,
  },
  logoContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    marginTop: 30,
    zIndex: 2,
    width: "100%",
    paddingHorizontal: 10,
  },
  logoTextSport: {
    fontSize: 21,
    fontWeight: "900",
    color: "#10b981",
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
    letterSpacing: 1,
  },
  logoTextLink: {
    fontSize: 19,
    fontWeight: "300",
    color: "white",
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
    letterSpacing: 1,
    fontStyle: "italic",
  },
  contentBox: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    padding: 25,
    width: "100%",
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 28,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  description: {
    marginTop: 10,
    marginBottom: 10,
    opacity: 0.9,
    lineHeight: 22,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 3,
  },
  buttonContainer: {
    width: "100%",
  },
  primaryButton: {
    backgroundColor: "#10b981",
    borderRadius: 12,
    height: 55,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  primaryButtonText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 1,
    borderColor: "#10b981",
    borderRadius: 12,
    height: 55,
  },
  secondaryButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
