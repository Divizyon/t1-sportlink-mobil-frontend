import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Text } from "react-native";
import LottieView from "lottie-react-native";

interface TennisAnimationProps {
  play?: boolean;
  style?: any;
}

const TennisAnimation: React.FC<TennisAnimationProps> = ({
  play = false,
  style,
}) => {
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    if (play && animationRef.current) {
      animationRef.current.play();
    } else if (!play && animationRef.current) {
      animationRef.current.reset();
    }
  }, [play]);

  // Tenis animasyon JSON dosyası henüz yok, bu yüzden şimdilik emoji kullanıyoruz
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.emoji}>🎾</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  animation: {
    width: "100%",
    height: "100%",
  },
  emoji: {
    fontSize: 24,
  },
});

export default TennisAnimation;
