import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { loginSchema } from '../../validation/auth';
import { router } from 'expo-router';
import { yupResolver } from '@hookform/resolvers/yup';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginScreen() {
  const { control, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      // Burada gerçek API çağrısı yapılacak
      console.log('Form data:', data);
      
      // Başarılı giriş sonrası ana sayfaya yönlendir
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: 'white' }}
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
        style={{ paddingHorizontal: 24 }}
      >
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <View style={{ 
            width: 96, 
            height: 96, 
            backgroundColor: '#3B82F6', 
            borderRadius: 48,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16
          }}>
            <Text style={{ color: 'white', fontSize: 36, fontWeight: 'bold' }}>SL</Text>
          </View>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1F2937' }}>Hoş Geldiniz</Text>
          <Text style={{ color: '#6B7280', marginTop: 8 }}>Hesabınıza giriş yapın</Text>
        </View>

        <View style={{ gap: 16 }}>
          <View>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={{
                    backgroundColor: '#F9FAFB',
                    borderWidth: 1,
                    borderColor: errors.email ? '#EF4444' : '#E5E7EB',
                    borderRadius: 12,
                    padding: 16,
                    color: '#1F2937'
                  }}
                  placeholder="Email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#9CA3AF"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                />
              )}
            />
            {errors.email && (
              <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4, marginLeft: 4 }}>
                {errors.email.message}
              </Text>
            )}
          </View>

          <View>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={{
                    backgroundColor: '#F9FAFB',
                    borderWidth: 1,
                    borderColor: errors.password ? '#EF4444' : '#E5E7EB',
                    borderRadius: 12,
                    padding: 16,
                    color: '#1F2937'
                  }}
                  placeholder="Şifre"
                  secureTextEntry
                  placeholderTextColor="#9CA3AF"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                />
              )}
            />
            {errors.password && (
              <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4, marginLeft: 4 }}>
                {errors.password.message}
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={{
              backgroundColor: '#3B82F6',
              padding: 16,
              borderRadius: 12,
              marginTop: 16
            }}
            onPress={handleSubmit(onSubmit)}
          >
            <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600', fontSize: 18 }}>
              Giriş Yap
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ marginTop: 16 }}
            onPress={() => router.push('/register')}
          >
            <Text style={{ color: '#3B82F6', textAlign: 'center' }}>
              Hesabınız yok mu? <Text style={{ fontWeight: '600' }}>Kayıt olun</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
} 