import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Button, ButtonText } from "../../components/ui/button";
import {
  Input,
  InputField,
  InputIcon,
  InputSlot,
} from "../../components/ui/input";
import { Text } from "../../components/ui/text";
import { Box } from "../../components/ui/box";
import { VStack } from "../../components/ui/vstack";
import { Center } from "../../components/ui/center";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorText,
} from "../../components/ui/form-control";
import { Link, LinkText } from "../../components/ui/link";
import { router } from "expo-router";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Chrome,
  Apple,
  Calendar,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { authService } from "../../src/api/authService";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  password: string;
  confirmPassword: string;
}

export default function SignUpPage() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [form, setForm] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    birthDate: "2000-01-01",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({
    firstName: "",
    lastName: "",
    email: "",
    birthDate: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setIsConfirmPasswordVisible(!isConfirmPasswordVisible);
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setForm({
      ...form,
      [field]: value,
    });
    // Girdi değiştiğinde hatayı temizle
    if (errors[field as keyof FormErrors]) {
      setErrors({
        ...errors,
        [field]: "",
      });
    }
  };

  // Doğum tarihi girişini formatla (YYYY-MM-DD)
  const formatBirthDate = (text: string) => {
    // Sadece sayıları al
    const cleaned = text.replace(/[^0-9]/g, "");

    // Formatlama (YYYY-MM-DD)
    let formatted = "";
    if (cleaned.length <= 4) {
      formatted = cleaned;
    } else if (cleaned.length <= 6) {
      formatted = `${cleaned.substring(0, 4)}-${cleaned.substring(4)}`;
    } else {
      formatted = `${cleaned.substring(0, 4)}-${cleaned.substring(
        4,
        6
      )}-${cleaned.substring(6, 8)}`;
    }

    return formatted;
  };

  const handleBirthDateChange = (text: string) => {
    const formatted = formatBirthDate(text);
    handleInputChange("birthDate", formatted);
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    // Ad kontrolü
    if (!form.firstName.trim()) {
      newErrors.firstName = "Adınız zorunludur";
      isValid = false;
    }

    // Soyad kontrolü
    if (!form.lastName.trim()) {
      newErrors.lastName = "Soyadınız zorunludur";
      isValid = false;
    }

    // E-posta kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim() || !emailRegex.test(form.email)) {
      newErrors.email = "Geçerli bir e-posta adresi giriniz";
      isValid = false;
    }

    // Doğum tarihi kontrolü
    const dateRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
    const match = form.birthDate.match(dateRegex);

    if (!match) {
      newErrors.birthDate = "Geçerli bir tarih formatı giriniz (YYYY-MM-DD)";
      isValid = false;
    } else {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1; // JavaScript ayları 0-11 arası
      const day = parseInt(match[3], 10);

      const birthDate = new Date(year, month, day);
      const today = new Date();

      // Geçerli bir tarih mi kontrolü
      if (
        birthDate.getDate() !== day ||
        birthDate.getMonth() !== month ||
        birthDate.getFullYear() !== year ||
        birthDate > today
      ) {
        newErrors.birthDate = "Geçerli bir tarih giriniz";
        isValid = false;
      } else {
        // Yaş kontrolü
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        // Doğum günü daha gelmemişse yaşı bir azalt
        const isBeforeBirthday =
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthDate.getDate());
        const calculatedAge = isBeforeBirthday ? age - 1 : age;

        if (calculatedAge < 13) {
          newErrors.birthDate = "Yaşınız 13'ten büyük olmalıdır";
          isValid = false;
        }
      }
    }

    // Şifre kontrolü
    if (form.password.length < 6) {
      newErrors.password = "Şifre en az 6 karakter olmalıdır";
      isValid = false;
    }

    // Şifre eşleşme kontrolü
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Şifreler eşleşmiyor";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSignUp = () => {
    if (validateForm()) {
      console.log("Kayıt formu:", form);

      // Yükleme durumunu göstermek için state ekleyelim
      setIsLoading(true);

      // Backend API'sinin beklediği formatta veriyi hazırla
      const userData = {
        email: form.email,
        password: form.password,
        password_confirm: form.confirmPassword, // Backend password_confirm bekliyor
        first_name: form.firstName,
        last_name: form.lastName,
        birthday_date: form.birthDate, // YYYY-MM-DD formatı zaten uyumlu
      };

      console.log("Kayıt işlemi başlatılıyor...");

      // API üzerinden kayıt işlemi
      authService
        .register(userData)
        .then((user) => {
          console.log("Kayıt başarılı:", user);
          
          // Show email verification required alert
          Alert.alert(
            "Kayıt Başarılı",
            "Hesabınız başarıyla oluşturuldu. Lütfen e-posta adresinize gönderilen doğrulama bağlantısına tıklayarak hesabınızı aktifleştiriniz.",
            [
              {
                text: "Tamam",
                onPress: () => {
                  // Geçmiş yığınını temizle ve giriş sayfasına yönlendir
                  // Bu, geri tuşuna basıldığında kayıt sayfasına dönmeyi engeller
                  router.replace("/(auth)/signin");
                },
              },
            ]
          );
        })
        .catch((error) => {
          console.error("Kayıt hatası:", error);
          
          // Özel hata mesajları
          let errorMessage = "Kayıt işlemi sırasında bir hata oluştu.";
          
          if (error.response && error.response.data) {
            if (error.response.data.message) {
              errorMessage = error.response.data.message;
            } else if (error.response.data.errors) {
              // İlk hatayı göster
              const firstError = Object.values(error.response.data.errors)[0];
              if (Array.isArray(firstError) && firstError.length > 0) {
                errorMessage = firstError[0];
              }
            }
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          Alert.alert(
            "Kayıt Hatası",
            errorMessage,
            [{ text: "Tamam", style: "cancel" }]
          );
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  const handleGoogleSignUp = () => {
    console.log("Google ile kayıt");
  };

  const handleAppleSignUp = () => {
    console.log("Apple ile kayıt");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <VStack
            space="md"
            style={{
              paddingHorizontal: 24,
              paddingVertical: 24,
              justifyContent: "center",
            }}
          >
            <Center>
              {/* Logo */}
              <Box style={{ marginBottom: 24 }}>
                <Image
                  source={require("../../assets/images/logo.png")}
                  style={{ width: 120, height: 40 }}
                  resizeMode="contain"
                />
              </Box>

              <Text
                size="2xl"
                style={{ fontWeight: "bold" }}
                className="text-emerald-800"
              >
                Hesap Oluştur
              </Text>
              <Text size="md" className="text-emerald-600 mt-2 text-center">
                SportLink'e hoş geldiniz! Kaydolun ve spor dünyasına katılın
              </Text>
            </Center>

            <Box style={{ marginTop: 24 }}>
              {/* Ad alanı */}
              <FormControl
                isInvalid={!!errors.firstName}
                style={{ marginBottom: 16 }}
              >
                <FormControlLabel>
                  <FormControlLabelText className="text-emerald-700">
                    Ad
                  </FormControlLabelText>
                </FormControlLabel>
                <Input
                  size="lg"
                  className="border-emerald-100 focus:border-emerald-500 rounded-lg"
                >
                  <InputSlot style={{ paddingLeft: 12 }}>
                    <InputIcon as={User} color="#047857" />
                  </InputSlot>
                  <InputField
                    placeholder="Adınızı girin"
                    value={form.firstName}
                    onChangeText={(text) =>
                      handleInputChange("firstName", text)
                    }
                  />
                </Input>
                {errors.firstName ? (
                  <FormControlError>
                    <FormControlErrorText>
                      {errors.firstName}
                    </FormControlErrorText>
                  </FormControlError>
                ) : null}
              </FormControl>

              {/* Soyad alanı */}
              <FormControl
                isInvalid={!!errors.lastName}
                style={{ marginBottom: 16 }}
              >
                <FormControlLabel>
                  <FormControlLabelText className="text-emerald-700">
                    Soyad
                  </FormControlLabelText>
                </FormControlLabel>
                <Input
                  size="lg"
                  className="border-emerald-100 focus:border-emerald-500 rounded-lg"
                >
                  <InputSlot style={{ paddingLeft: 12 }}>
                    <InputIcon as={User} color="#047857" />
                  </InputSlot>
                  <InputField
                    placeholder="Soyadınızı girin"
                    value={form.lastName}
                    onChangeText={(text) => handleInputChange("lastName", text)}
                  />
                </Input>
                {errors.lastName ? (
                  <FormControlError>
                    <FormControlErrorText>
                      {errors.lastName}
                    </FormControlErrorText>
                  </FormControlError>
                ) : null}
              </FormControl>

              {/* E-posta alanı */}
              <FormControl
                isInvalid={!!errors.email}
                style={{ marginBottom: 16 }}
              >
                <FormControlLabel>
                  <FormControlLabelText className="text-emerald-700">
                    E-posta
                  </FormControlLabelText>
                </FormControlLabel>
                <Input
                  size="lg"
                  className="border-emerald-100 focus:border-emerald-500 rounded-lg"
                >
                  <InputSlot style={{ paddingLeft: 12 }}>
                    <InputIcon as={Mail} color="#047857" />
                  </InputSlot>
                  <InputField
                    placeholder="E-posta adresinizi girin"
                    value={form.email}
                    onChangeText={(text) => handleInputChange("email", text)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </Input>
                {errors.email ? (
                  <FormControlError>
                    <FormControlErrorText>{errors.email}</FormControlErrorText>
                  </FormControlError>
                ) : null}
              </FormControl>

              {/* Doğum tarihi alanı */}
              <FormControl
                isInvalid={!!errors.birthDate}
                style={{ marginBottom: 16 }}
              >
                <FormControlLabel>
                  <FormControlLabelText className="text-emerald-700">
                    Doğum Tarihi
                  </FormControlLabelText>
                </FormControlLabel>
                <Input
                  size="lg"
                  className="border-emerald-100 focus:border-emerald-500 rounded-lg"
                >
                  <InputSlot style={{ paddingLeft: 12 }}>
                    <InputIcon as={Calendar} color="#047857" />
                  </InputSlot>
                  <InputField
                    placeholder="YYYY-MM-DD"
                    value={form.birthDate}
                    onChangeText={handleBirthDateChange}
                    keyboardType="numeric"
                    maxLength={10}
                  />
                </Input>
                <Text size="xs" className="text-emerald-600 mt-1">
                  Format: 2000-01-31
                </Text>
                {errors.birthDate ? (
                  <FormControlError>
                    <FormControlErrorText>
                      {errors.birthDate}
                    </FormControlErrorText>
                  </FormControlError>
                ) : null}
              </FormControl>

              {/* Şifre alanı */}
              <FormControl
                isInvalid={!!errors.password}
                style={{ marginBottom: 16 }}
              >
                <FormControlLabel>
                  <FormControlLabelText className="text-emerald-700">
                    Şifre
                  </FormControlLabelText>
                </FormControlLabel>
                <Input
                  size="lg"
                  className="border-emerald-100 focus:border-emerald-500 rounded-lg"
                >
                  <InputSlot style={{ paddingLeft: 12 }}>
                    <InputIcon as={Lock} color="#047857" />
                  </InputSlot>
                  <InputField
                    placeholder="Şifrenizi girin"
                    secureTextEntry={!isPasswordVisible}
                    value={form.password}
                    onChangeText={(text) => handleInputChange("password", text)}
                  />
                  <InputSlot
                    style={{ paddingRight: 12 }}
                    onPress={togglePasswordVisibility}
                  >
                    <InputIcon
                      as={isPasswordVisible ? EyeOff : Eye}
                      color="#047857"
                    />
                  </InputSlot>
                </Input>
                {errors.password ? (
                  <FormControlError>
                    <FormControlErrorText>
                      {errors.password}
                    </FormControlErrorText>
                  </FormControlError>
                ) : null}
              </FormControl>

              <FormControl
                isInvalid={!!errors.confirmPassword}
                style={{ marginBottom: 24 }}
              >
                <FormControlLabel>
                  <FormControlLabelText className="text-emerald-700">
                    Şifre Tekrar
                  </FormControlLabelText>
                </FormControlLabel>
                <Input
                  size="lg"
                  className="border-emerald-100 focus:border-emerald-500 rounded-lg"
                >
                  <InputSlot style={{ paddingLeft: 12 }}>
                    <InputIcon as={Lock} color="#047857" />
                  </InputSlot>
                  <InputField
                    placeholder="Şifrenizi tekrar girin"
                    secureTextEntry={!isConfirmPasswordVisible}
                    value={form.confirmPassword}
                    onChangeText={(text) =>
                      handleInputChange("confirmPassword", text)
                    }
                  />
                  <InputSlot
                    style={{ paddingRight: 12 }}
                    onPress={toggleConfirmPasswordVisibility}
                  >
                    <InputIcon
                      as={isConfirmPasswordVisible ? EyeOff : Eye}
                      color="#047857"
                    />
                  </InputSlot>
                </Input>
                {errors.confirmPassword ? (
                  <FormControlError>
                    <FormControlErrorText>
                      {errors.confirmPassword}
                    </FormControlErrorText>
                  </FormControlError>
                ) : null}
              </FormControl>

              <Box style={{ marginBottom: 8 }}>
                <Text
                  className="text-emerald-700 text-sm"
                  style={{ marginBottom: 4 }}
                >
                  Kaydolarak şunları kabul etmiş olursunuz:
                </Text>
                <Text className="text-emerald-600 text-xs">
                  Hizmet Koşulları ve Gizlilik Politikası
                </Text>
              </Box>

              <Button
                className="bg-emerald-600 rounded-lg"
                size="lg"
                onPress={handleSignUp}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <ButtonText style={{ fontWeight: "bold" }}>
                    Kayıt Ol
                  </ButtonText>
                )}
              </Button>

              <Center style={{ marginTop: 24, marginBottom: 24 }}>
                <Text size="sm" className="text-emerald-700">
                  veya şununla devam et
                </Text>
              </Center>

              <Box
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 16,
                }}
              >
                <TouchableOpacity
                  onPress={handleGoogleSignUp}
                  style={styles.socialButton}
                >
                  <Chrome size={24} color="#047857" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleAppleSignUp}
                  style={styles.socialButton}
                >
                  <Apple size={24} color="#047857" />
                </TouchableOpacity>
              </Box>

              <Center style={{ marginTop: 32 }}>
                <Box style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text size="sm" className="text-emerald-700">
                    Zaten hesabınız var mı?
                  </Text>
                  <Link
                    onPress={() => router.navigate("/(auth)/signin")}
                    style={{ marginLeft: 4 }}
                  >
                    <LinkText
                      className="text-emerald-600"
                      style={{ fontWeight: "600" }}
                    >
                      Giriş Yap
                    </LinkText>
                  </Link>
                </Box>
              </Center>
            </Box>
          </VStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
});
