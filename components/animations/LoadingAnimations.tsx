import React, { useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";

interface LoadingAnimationProps {
  size?: number;
  style?: any;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  size = 500,
  style,
}) => {
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    if (animationRef.current) {
      animationRef.current.play();
    }
  }, []);

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <LottieView
        ref={animationRef}
        source={require("../../assets/animations/loading_screen_loop.json")}
        autoPlay={true}
        loop={true}
        style={[styles.animation, { width: size, height: size }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  animation: {
    width: "100%",
    height: "100%",
  },
});

export default LoadingAnimation;
