import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Animated,
  LayoutChangeEvent,
} from "react-native";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { Filter } from "lucide-react-native";

// Tema renkleri - daha koyu, yumuşak yeşil
const theme = {
  primary: "#10B981", // Daha koyu, yumuşak yeşil (eski: #34D399)
  primaryLight: "#D1FAE5", // Açık yeşil (eski: #ECFDF5)
  primaryDark: "#059669", // Koyu yeşil (eski: #10B981)
  secondary: "#F3F4F6", // Arka plan gri
  border: "#E2E8F0", // Kenar rengi
  background: "#FFFFFF", // Kart arkaplanı
  text: "#0F172A", // Ana metin
  textSecondary: "#64748B", // İkincil metin
};

interface DistanceFilterProps {
  distance: number;
  onDistanceChange: (distance: number) => void;
}

const DistanceFilter: React.FC<DistanceFilterProps> = ({
  distance,
  onDistanceChange,
}) => {
  // Mesafe aralıkları ve maksimum değer
  const distanceOptions = [1, 5, 10, 15, 20];
  const MAX_DISTANCE = 20;

  // UI state
  const [sliderWidth, setSliderWidth] = useState(0);
  const sliderRef = useRef<View>(null);

  // Animasyon değerleri
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  // Layout değişikliğini izle
  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setSliderWidth(width);
  };

  // Animasyon fonksiyonları
  const animateThumb = () => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.3,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateValueChange = () => {
    Animated.sequence([
      Animated.timing(opacityAnim, {
        toValue: 0.7,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Dokunulan konumdan mesafeyi hesaplama
  const getDistanceFromPosition = (positionX: number) => {
    if (sliderWidth > 0) {
      // Slider yüzdesini hesapla (0-1 arası)
      let percentage = positionX / sliderWidth;
      // 0-1 arası değeri sınırla
      percentage = Math.max(0, Math.min(percentage, 1));
      // Yüzdeyi mesafeye dönüştür
      return percentage * MAX_DISTANCE;
    }
    return 0;
  };

  // Slider üzerindeki herhangi bir noktaya tıklama işlevi
  const handleTrackTap = (evt: any) => {
    if (sliderRef.current && sliderWidth > 0) {
      const touchX = evt.nativeEvent.locationX;
      const newValue = getDistanceFromPosition(touchX);

      // Değeri güncelle
      const roundedValue = Math.round(newValue * 2) / 2;
      const clampedValue = Math.max(0, Math.min(roundedValue, MAX_DISTANCE));

      // Değer değiştiyse callback'i çağır
      if (clampedValue !== distance) {
        onDistanceChange(clampedValue);
        animateValueChange();
      }

      // Thumb animasyonu
      animateThumb();
    }
  };

  // Kullanıcı arayüzü için değerleri hesapla
  const fillWidth = sliderWidth * (distance / MAX_DISTANCE);
  const thumbLeft = sliderWidth * (distance / MAX_DISTANCE) - 13; // 13 = thumb width / 2

  return (
    <Box style={styles.filterSection}>
      <HStack style={styles.filterHeader}>
        <HStack style={styles.filterTitle}>
          <Filter size={18} color={theme.text} style={{ marginRight: 6 }} />
          <Text style={styles.filterTitleText}>Mesafe Filtresi</Text>
        </HStack>
        <Animated.Text style={[styles.filterValue, { opacity: opacityAnim }]}>
          {distance} km
        </Animated.Text>
      </HStack>

      {/* Sürekli slider */}
      <View style={styles.sliderTouchArea}>
        <View
          style={styles.sliderContainer}
          ref={sliderRef}
          onLayout={handleLayout}
        >
          <TouchableOpacity
            style={styles.sliderTrack}
            activeOpacity={0.8}
            onPress={handleTrackTap}
          >
            <View
              style={[
                styles.sliderFill,
                {
                  width: fillWidth,
                },
              ]}
            />
            <Animated.View
              style={[
                styles.sliderThumb,
                {
                  left: thumbLeft,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <View style={styles.sliderThumbInner} />
            </Animated.View>
          </TouchableOpacity>

          <HStack style={styles.sliderLabels}>
            {[0, 5, 10, 15, 20].map((value) => (
              <Text key={value} style={styles.sliderLabel}>
                {value}km
              </Text>
            ))}
          </HStack>
        </View>
      </View>

      {/* Hızlı seçim butonları */}
      <HStack style={styles.quickSelectContainer}>
        {distanceOptions.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.quickSelectButton,
              distance === option && styles.quickSelectButtonActive,
            ]}
            onPress={() => {
              if (option !== distance) {
                onDistanceChange(option);
                animateValueChange();
              }
              animateThumb();
            }}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.quickSelectText,
                distance === option && styles.quickSelectTextActive,
              ]}
            >
              {option} km
            </Text>
          </TouchableOpacity>
        ))}
      </HStack>

      {/* Mesafe açıklaması */}
      <Text style={styles.distanceExplanation}>
        {distance <= 5
          ? "Yakındaki etkinlikleri görüntülüyorsunuz."
          : distance <= 10
          ? "Yakın çevredeki etkinlikleri görüntülüyorsunuz."
          : distance <= 15
          ? "Geniş çevredeki etkinlikleri görüntülüyorsunuz."
          : "Şehir genelindeki etkinlikleri görüntülüyorsunuz."}
      </Text>
    </Box>
  );
};

const styles = StyleSheet.create({
  filterSection: {
    backgroundColor: theme.background,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  filterTitle: {
    flexDirection: "row",
    alignItems: "center",
  },
  filterTitleText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.text,
  },
  filterValue: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.primary,
  },
  sliderTouchArea: {
    paddingVertical: 8, // Dokunma alanını genişlet
  },
  sliderContainer: {
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  sliderTrack: {
    height: 6,
    backgroundColor: theme.border,
    borderRadius: 3,
    marginBottom: 12,
    position: "relative",
  },
  sliderFill: {
    height: 6,
    backgroundColor: theme.primary,
    borderRadius: 3,
    position: "absolute",
    left: 0,
    top: 0,
  },
  sliderThumb: {
    position: "absolute",
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: theme.background,
    borderWidth: 2,
    borderColor: theme.primary,
    marginTop: -10,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    zIndex: 10,
  },
  sliderThumbInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.primary,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  sliderLabel: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  quickSelectContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 12,
  },
  quickSelectButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: theme.secondary,
    borderWidth: 1,
    borderColor: theme.border,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  quickSelectButtonActive: {
    backgroundColor: theme.primaryLight,
    borderColor: theme.primary,
    elevation: 2,
  },
  quickSelectText: {
    fontSize: 13,
    fontWeight: "500",
    color: theme.textSecondary,
  },
  quickSelectTextActive: {
    color: theme.primary,
    fontWeight: "600",
  },
  distanceExplanation: {
    marginTop: 8,
    fontSize: 12,
    color: theme.textSecondary,
    textAlign: "center",
    fontStyle: "italic",
  },
});

export default DistanceFilter;
