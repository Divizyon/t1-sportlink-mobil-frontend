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