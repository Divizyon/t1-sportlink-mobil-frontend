import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { X } from "lucide-react-native";

interface NetworkErrorOverlayProps {
  message?: string;
  duration?: number;
  onClose?: () => void;
}

/**
 * Ağ hataları için kullanıcıya gösterilecek overlay bileşeni
 */
const NetworkErrorOverlay: React.FC<NetworkErrorOverlayProps> = ({
  message = "İnternet bağlantısı sorunu. Lütfen bağlantınızı kontrol edin.",
  duration = 5000,
  onClose,
}) => {
  const [visible, setVisible] = useState(true);
  const translateY = new Animated.Value(-100);
  const opacity = new Animated.Value(0);

  useEffect(() => {
    if (visible) {
      // Overlay'i yukarıdan aşağı doğru animasyonla göster
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Belirtilen süre sonra kapat
      if (duration > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        return () => clearTimeout(timer);
      }
    }
  }, [visible]);

  const handleClose = () => {
    // Önce yukarı doğru animasyonla kapat
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      if (onClose) onClose();
    });
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateY }], opacity }]}
    >
      <View style={styles.content}>
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <X color="#FFF" size={20} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#E53935", // Kırmızı arka plan
    paddingTop: 40, // Status bar için ekstra padding
    paddingBottom: 10,
    zIndex: 9999,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  message: {
    flex: 1,
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  closeButton: {
    padding: 5,
  },
});

export default NetworkErrorOverlay;

// Kolay kullanım için global bir NetworkErrorManager
let activeOverlay: React.ReactNode | null = null;
let setActiveOverlay: React.Dispatch<
  React.SetStateAction<React.ReactNode | null>
> | null = null;

export const NetworkErrorManager = {
  register: (
    setter: React.Dispatch<React.SetStateAction<React.ReactNode | null>>
  ) => {
    setActiveOverlay = setter;
  },

  showError: (message: string, duration = 5000) => {
    if (setActiveOverlay) {
      // Önceki overlay'i kaldır
      NetworkErrorManager.hideError();

      // Yeni overlay'i göster
      activeOverlay = (
        <NetworkErrorOverlay
          message={message}
          duration={duration}
          onClose={() => NetworkErrorManager.hideError()}
        />
      );
      setActiveOverlay(activeOverlay);
    }
  },

  hideError: () => {
    if (setActiveOverlay && activeOverlay) {
      setActiveOverlay(null);
      activeOverlay = null;
    }
  },
};

// Ana uygulama bileşeninde kullanılacak wrapper
export const NetworkErrorProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [overlay, setOverlay] = useState<React.ReactNode | null>(null);

  useEffect(() => {
    NetworkErrorManager.register(setOverlay);
  }, []);

  return (
    <>
      {children}
      {overlay}
    </>
  );
};
