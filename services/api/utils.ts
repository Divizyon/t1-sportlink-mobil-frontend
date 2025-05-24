import { showToast } from "../../src/utils/toastHelper";
import NetInfo from "@react-native-community/netinfo";
import { NetworkErrorManager } from "../../components/common/NetworkErrorOverlay";

// API isteği için ağ bağlantısını kontrol et
export const checkNetwork = async () => {
  const netInfo = await NetInfo.fetch();
  return netInfo.isConnected && netInfo.isInternetReachable;
};

/**
 * API çağrılarını sarmak için kullanılan yardımcı fonksiyon
 * Hataları otomatik yakalar, varsayılan değer döner ve ağ hatalarını yönetir
 *
 * @param fn API çağrısını yapan async fonksiyon
 * @param defaultValue Hata durumunda dönecek varsayılan değer
 * @param notifyOnError Hata durumunda bildirim gösterilsin mi
 * @returns API çağrısının sonucu veya hata durumunda defaultValue
 */
export const safeApiCall = async <T>(
  fn: () => Promise<T>,
  defaultValue?: any,
  notifyOnError = false
): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    console.error("API çağrısı başarısız:", error);

    // Ağ veya sunucu hatası için overlay göstermek gerekiyor mu?
    if (notifyOnError && error.message) {
      NetworkErrorManager.showError(
        error.message || "İşlem sırasında bir hata oluştu",
        5000
      );
    }

    // Varsayılan bir değer verildiyse onu döndür, yoksa boş bir dizi/obje döndür
    return defaultValue !== undefined
      ? defaultValue
      : ((Array.isArray(defaultValue) ? [] : {}) as T);
  }
};

/**
 * Endpoint için dosya yükleme fonksiyonu
 *
 * @param uri Dosyanın URI'si
 * @param name Dosya adı
 * @param type Dosya tipi
 * @returns FormData için dosya nesnesi
 */
export const createFormData = (uri: string, name: string, type: string) => {
  const fileExtension = uri.split(".").pop();
  const fileName = `${name}.${fileExtension}`;

  return {
    uri,
    name: fileName,
    type: type || `image/${fileExtension}`,
  };
};

/**
 * API endpoint URL'ini oluştur
 */
export const createUrl = (
  path: string,
  queryParams: Record<string, any> = {}
) => {
  const url = new URL(path);

  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });

  return url.toString();
};

/**
 * Belirli bir süre beklet
 */
export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
