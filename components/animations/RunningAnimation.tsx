import React, { useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";

interface RunningAnimationProps {
  play?: boolean;
  style?: any;
}

const RunningAnimation: React.FC<RunningAnimationProps> = ({
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

  return (
    <View style={[styles.container, style]}>
      <LottieView
        ref={animationRef}
        source={require("../../assets/animations/kosu.json")}
        autoPlay={false}
        loop={false}
        style={styles.animation}
        progress={play ? undefined : 0}
      />
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
});

export default RunningAnimation;
