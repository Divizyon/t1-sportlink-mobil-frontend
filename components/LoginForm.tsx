import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginSchema } from '../validation/loginSchema';
import LoadingIndicator from './LoadingIndicator';
import { router } from 'expo-router';

type LoginFormData = {
  email: string;
  password: string;
};

const LoginForm: React.FC = () => {
  const [apiError, setApiError] = useState<string | null>(null);
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setApiError(null);
      // API çağrısı burada yapılacak
      console.log('Login data:', data);
      
      // Başarılı login sonrası ana sayfaya yönlendirme
      router.replace('/app');
    } catch (error) {
      setApiError('Giriş yapılamadı. Lütfen bilgilerinizi kontrol ediniz.');
      console.error('Login error:', error);
    }
  };

  const getInputStyle = (hasError: boolean) => [
    styles.input,
    hasError && styles.inputError
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.formContainer}>
        {apiError && (
          <View style={styles.apiErrorContainer}>
            <Text style={styles.apiErrorText}>{apiError}</Text>
          </View>
        )}

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value, onBlur } }) => (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>E-posta</Text>
              <TextInput
                style={getInputStyle(!!errors.email)}
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                placeholder="E-posta"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                accessibilityLabel="E-posta giriş alanı"
                accessibilityHint="E-posta adresinizi buraya giriniz"
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email.message}</Text>
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value, onBlur } }) => (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Şifre</Text>
              <TextInput
                style={getInputStyle(!!errors.password)}
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                placeholder="Şifre"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                accessibilityLabel="Şifre giriş alanı"
                accessibilityHint="Şifrenizi buraya giriniz"
              />
              {errors.password && (
                <Text style={styles.errorText}>{errors.password.message}</Text>
              )}
            </View>
          )}
        />

        <TouchableOpacity
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          accessibilityLabel="Giriş yap butonu"
          accessibilityHint="Giriş yapmak için dokunun"
        >
          {isSubmitting ? (
            <LoadingIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Giriş Yap</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => router.push('/register')}
        >
          <Text style={styles.registerButtonText}>Hesabınız yok mu? Kayıt olun</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    height: 45,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  inputError: {
    borderColor: '#ff3b30',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 12,
    marginTop: 5,
  },
  apiErrorContainer: {
    backgroundColor: '#ff3b30',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  apiErrorText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#007AFF80',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  registerButton: {
    marginTop: 15,
    padding: 10,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#007AFF',
    fontSize: 14,
  },
});

export default LoginForm; 