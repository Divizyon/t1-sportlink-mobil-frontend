// hooks/useFormHandler.ts
import { FormData } from '@components/RegisterForm';

interface FormResponse {
  success: boolean;
  message?: string;
}

export const useFormHandler = async (data: FormData, type: 'register' | 'login'): Promise<FormResponse> => {
  try {
    // API çağrısı simülasyonu
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Burada gerçek API çağrısı yapılacak
    // const response = await api[type](data);
    
    // Şimdilik başarılı kabul ediyoruz
    return {
      success: true,
      message: type === 'register' ? 'Kayıt başarılı!' : 'Giriş başarılı!'
    };
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      message: 'Bir hata oluştu. Lütfen tekrar deneyin.'
    };
  }
};
