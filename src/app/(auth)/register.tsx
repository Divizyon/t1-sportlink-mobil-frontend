import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { registerSchema } from '../../validation/auth';
import { router } from 'expo-router';
import { yupResolver } from '@hookform/resolvers/yup';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterScreen() {
  const { control, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      // Burada gerçek API çağrısı yapılacak
      console.log('Form data:', data);
      
      // Başarılı kayıt sonrası ana sayfaya yönlendir
      router.replace('/');
    } catch (error) {
      console.error('Registration error:', error);
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
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1F2937' }}>Kayıt Ol</Text>
          <Text style={{ color: '#6B7280', marginTop: 8 }}>Yeni bir hesap oluşturun</Text>
        </View>

        <View style={{ gap: 16 }}>
          <View>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={{
                    backgroundColor: '#F9FAFB',
                    borderWidth: 1,
                    borderColor: errors.name ? '#EF4444' : '#E5E7EB',
                    borderRadius: 12,
                    padding: 16,
                    color: '#1F2937'
                  }}
                  placeholder="Ad Soyad"
                  autoCapitalize="words"
                  placeholderTextColor="#9CA3AF"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                />
              )}
            />
            {errors.name && (
              <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4, marginLeft: 4 }}>
                {errors.name.message}
              </Text>
            )}
          </View>

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

          <View>
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={{
                    backgroundColor: '#F9FAFB',
                    borderWidth: 1,
                    borderColor: errors.confirmPassword ? '#EF4444' : '#E5E7EB',
                    borderRadius: 12,
                    padding: 16,
                    color: '#1F2937'
                  }}
                  placeholder="Şifre Tekrar"
                  secureTextEntry
                  placeholderTextColor="#9CA3AF"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                />
              )}
            />
            {errors.confirmPassword && (
              <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4, marginLeft: 4 }}>
                {errors.confirmPassword.message}
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
              Kayıt Ol
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ marginTop: 16 }}
            onPress={() => router.push('/login')}
          >
            <Text style={{ color: '#3B82F6', textAlign: 'center' }}>
              Zaten hesabınız var mı? <Text style={{ fontWeight: '600' }}>Giriş yapın</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
} 