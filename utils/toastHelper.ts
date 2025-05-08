import { Platform, ToastAndroid } from "react-native";
import { Alert } from "react-native";

type ToastType = "success" | "error" | "info";

/**
 * Tüm platformlarda çalışan toast bildirimi gösterir
 * Android'de Toast, iOS'de Alert olarak gösterilir
 */
export const showToast = (message: string, type: ToastType = "info") => {
  // Bildirimin başlığını belirle
  let title = "Bildirim";

  if (type === "success") {
    title = "Başarılı";
  } else if (type === "error") {
    title = "Hata";
  }

  if (Platform.OS === "android") {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    // iOS'de Alert göster
    Alert.alert(title, message, [{ text: "Tamam" }], { cancelable: true });
  }
};
