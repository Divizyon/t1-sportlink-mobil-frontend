import { showToast } from "../../src/utils/toastHelper";
import NetInfo from "@react-native-community/netinfo";

// API isteği için ağ bağlantısını kontrol et
export const checkNetwork = async () => {
  const netInfo = await NetInfo.fetch();
  return netInfo.isConnected && netInfo.isInternetReachable;
};

// Ağ bağlantısı kontrol edilerek API isteği atma yardımcı fonksiyonu
export const safeApiCall = async (apiFunc: Function, fallback: any = null) => {
  try {
    const isConnected = await checkNetwork();
    if (!isConnected) {
      console.log("Ağ bağlantısı yok, istek yapılamıyor");
      showToast("İnternet bağlantısı yok. Lütfen bağlantınızı kontrol edin.", "error");
      return { status: "error", data: fallback, message: "İnternet bağlantısı yok" };
    }
    
    return await apiFunc();
  } catch (error: any) {
    console.log("API çağrısı sırasında hata:", error.message);
    return { 
      status: "error", 
      data: fallback, 
      message: error.message || "API isteği sırasında bir hata oluştu" 
    };
  }
}; 