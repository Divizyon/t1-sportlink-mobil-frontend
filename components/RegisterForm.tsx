// components/RegisterForm.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { registerSchema } from '@validation/registerSchema';
import { useFormHandler } from '@hooks/useFormHandler';
import LoadingIndicator from './LoadingIndicator';
import { router } from 'expo-router';

// Form tipi
export type FormData = {
  username: string;
  email: string;
  password: string;
};

const RegisterForm: React.FC = () => {
  const [apiError, setApiError] = useState<string | null>(null);
  const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setApiError(null);
      const response = await useFormHandler(data, 'register');
      
      if (response.success) {
        Alert.alert('Başarılı', 'Kayıt işlemi başarıyla tamamlandı!', [
          {
            text: 'Tamam',
            onPress: () => {
              reset();
              router.push('/(auth)/login');
            },
          },
        ]);
      } else {
        setApiError(response.message || 'Bir hata oluştu');
      }
    } catch (error) {
      setApiError('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const getInputStyle = (hasError: boolean) => [
    styles.input,
    hasError && styles.inputError,
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.formContainer}>
        <Controller
          control={control}
          name="username"
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Kullanıcı Adı</Text>
              <TextInput
                style={getInputStyle(!!errors.username)}
                onChangeText={onChange}
                value={value}
                placeholder="Kullanıcı adınızı girin"
                autoCapitalize="none"
              />
              {errors.username && (
                <Text style={styles.errorText}>{errors.username.message}</Text>
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>E-posta</Text>
              <TextInput
                style={getInputStyle(!!errors.email)}
                onChangeText={onChange}
                value={value}
                placeholder="E-posta adresinizi girin"
                keyboardType="email-address"
                autoCapitalize="none"
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
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Şifre</Text>
              <TextInput
                style={getInputStyle(!!errors.password)}
                onChangeText={onChange}
                value={value}
                placeholder="Şifrenizi girin"
                secureTextEntry
              />
              {errors.password && (
                <Text style={styles.errorText}>{errors.password.message}</Text>
              )}
            </View>
          )}
        />

        {apiError && (
          <View style={styles.apiErrorContainer}>
            <Text style={styles.apiErrorText}>{apiError}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <LoadingIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Kayıt Ol</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.backButtonText}>Zaten hesabınız var mı? Giriş yapın</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  formContainer: {
    width: '100%',
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#ff3b30',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 14,
    marginTop: 4,
  },
  apiErrorContainer: {
    backgroundColor: '#ff3b30',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  apiErrorText: {
    color: '#fff',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default RegisterForm;
