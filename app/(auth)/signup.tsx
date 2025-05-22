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

          Alert.alert("Kayıt Hatası", errorMessage, [
            { text: "Tamam", style: "cancel" },
          ]);
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
              paddingHorizontal: 30,
              paddingVertical: 20,
              justifyContent: "center",
            }}
          >
            <Center>
              {/* Logo */}
              <Box style={{ marginBottom: 30 }}>
                <Image
                  source={require("../../assets/images/logo.png")}
                  style={{ width: 160, height: 60 }}
                  resizeMode="contain"
                />
              </Box>

              <Text
                size="2xl"
                style={{ fontWeight: "bold", marginBottom: 6 }}
                className="text-emerald-800"
              >
                Hesap Oluştur
              </Text>
            </Center>

            <Box style={{ marginTop: 10 }}>
              {/* Ad alanı */}
              <FormControl
                isInvalid={!!errors.firstName}
                style={{ marginBottom: 20 }}
              >
                <Input
                  size="xl"
                  variant="outline"
                  style={{
                    borderRadius: 30,
                    borderWidth: 1,
                    borderColor: "#e2e8f0",
                    height: 60,
                    paddingHorizontal: 20,
                    backgroundColor: "#f8fafc",
                    shadowColor: "#00000010",
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.1,
                    shadowRadius: 5,
                    elevation: 1,
                  }}
                >
                  <InputSlot style={{ paddingLeft: 8 }}>
                    <InputIcon as={User} color="#10b981" />
                  </InputSlot>
                  <InputField
                    placeholder="Adınız"
                    value={form.firstName}
                    onChangeText={(text) =>
                      handleInputChange("firstName", text)
                    }
                    style={{ fontSize: 16, paddingLeft: 8 }}
                  />
                </Input>
                {errors.firstName ? (
                  <FormControlError style={{ marginTop: 6, marginLeft: 16 }}>
                    <FormControlErrorText style={{ fontSize: 13 }}>
                      {errors.firstName}
                    </FormControlErrorText>
                  </FormControlError>
                ) : null}
              </FormControl>

              {/* Soyad alanı */}
              <FormControl
                isInvalid={!!errors.lastName}
                style={{ marginBottom: 20 }}
              >
                <Input
                  size="xl"
                  variant="outline"
                  style={{
                    borderRadius: 30,
                    borderWidth: 1,
                    borderColor: "#e2e8f0",
                    height: 60,
                    paddingHorizontal: 20,
                    backgroundColor: "#f8fafc",
                    shadowColor: "#00000010",
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.1,
                    shadowRadius: 5,
                    elevation: 1,
                  }}
                >
                  <InputSlot style={{ paddingLeft: 8 }}>
                    <InputIcon as={User} color="#10b981" />
                  </InputSlot>
                  <InputField
                    placeholder="Soyadınız"
                    value={form.lastName}
                    onChangeText={(text) => handleInputChange("lastName", text)}
                    style={{ fontSize: 16, paddingLeft: 8 }}
                  />
                </Input>
                {errors.lastName ? (
                  <FormControlError style={{ marginTop: 6, marginLeft: 16 }}>
                    <FormControlErrorText style={{ fontSize: 13 }}>
                      {errors.lastName}
                    </FormControlErrorText>
                  </FormControlError>
                ) : null}
              </FormControl>

              {/* E-posta alanı */}
              <FormControl
                isInvalid={!!errors.email}
                style={{ marginBottom: 20 }}
              >
                <Input
                  size="xl"
                  variant="outline"
                  style={{
                    borderRadius: 30,
                    borderWidth: 1,
                    borderColor: "#e2e8f0",
                    height: 60,
                    paddingHorizontal: 20,
                    backgroundColor: "#f8fafc",
                    shadowColor: "#00000010",
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.1,
                    shadowRadius: 5,
                    elevation: 1,
                  }}
                >
                  <InputSlot style={{ paddingLeft: 8 }}>
                    <InputIcon as={Mail} color="#10b981" />
                  </InputSlot>
                  <InputField
                    placeholder="E-posta adresiniz"
                    value={form.email}
                    onChangeText={(text) => handleInputChange("email", text)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={{ fontSize: 16, paddingLeft: 8 }}
                  />
                </Input>
                {errors.email ? (
                  <FormControlError style={{ marginTop: 6, marginLeft: 16 }}>
                    <FormControlErrorText style={{ fontSize: 13 }}>
                      {errors.email}
                    </FormControlErrorText>
                  </FormControlError>
                ) : null}
              </FormControl>

              {/* Doğum tarihi alanı */}
              <FormControl
                isInvalid={!!errors.birthDate}
                style={{ marginBottom: 20 }}
              >
                <Input
                  size="xl"
                  variant="outline"
                  style={{
                    borderRadius: 30,
                    borderWidth: 1,
                    borderColor: "#e2e8f0",
                    height: 60,
                    paddingHorizontal: 20,
                    backgroundColor: "#f8fafc",
                    shadowColor: "#00000010",
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.1,
                    shadowRadius: 5,
                    elevation: 1,
                  }}
                >
                  <InputSlot style={{ paddingLeft: 8 }}>
                    <InputIcon as={Calendar} color="#10b981" />
                  </InputSlot>
                  <InputField
                    placeholder="Doğum tarihi (YYYY-MM-DD)"
                    value={form.birthDate}
                    onChangeText={handleBirthDateChange}
                    keyboardType="numeric"
                    maxLength={10}
                    style={{ fontSize: 16, paddingLeft: 8 }}
                  />
                </Input>
                {errors.birthDate ? (
                  <FormControlError style={{ marginTop: 6, marginLeft: 16 }}>
                    <FormControlErrorText style={{ fontSize: 13 }}>
                      {errors.birthDate}
                    </FormControlErrorText>
                  </FormControlError>
                ) : null}
              </FormControl>

              {/* Şifre alanı */}
              <FormControl
                isInvalid={!!errors.password}
                style={{ marginBottom: 20 }}
              >
                <Input
                  size="xl"
                  variant="outline"
                  style={{
                    borderRadius: 30,
                    borderWidth: 1,
                    borderColor: "#e2e8f0",
                    height: 60,
                    paddingHorizontal: 20,
                    backgroundColor: "#f8fafc",
                    shadowColor: "#00000010",
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.1,
                    shadowRadius: 5,
                    elevation: 1,
                  }}
                >
                  <InputSlot style={{ paddingLeft: 8 }}>
                    <InputIcon as={Lock} color="#10b981" />
                  </InputSlot>
                  <InputField
                    placeholder="Şifre"
                    secureTextEntry={!isPasswordVisible}
                    value={form.password}
                    onChangeText={(text) => handleInputChange("password", text)}
                    style={{ fontSize: 16, paddingLeft: 8 }}
                  />
                  <InputSlot
                    style={{ paddingRight: 8 }}
                    onPress={togglePasswordVisibility}
                  >
                    <InputIcon
                      as={isPasswordVisible ? EyeOff : Eye}
                      color="#10b981"
                    />
                  </InputSlot>
                </Input>
                {errors.password ? (
                  <FormControlError style={{ marginTop: 6, marginLeft: 16 }}>
                    <FormControlErrorText style={{ fontSize: 13 }}>
                      {errors.password}
                    </FormControlErrorText>
                  </FormControlError>
                ) : null}
              </FormControl>

              <FormControl
                isInvalid={!!errors.confirmPassword}
                style={{ marginBottom: 20 }}
              >
                <Input
                  size="xl"
                  variant="outline"
                  style={{
                    borderRadius: 30,
                    borderWidth: 1,
                    borderColor: "#e2e8f0",
                    height: 60,
                    paddingHorizontal: 20,
                    backgroundColor: "#f8fafc",
                    shadowColor: "#00000010",
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.1,
                    shadowRadius: 5,
                    elevation: 1,
                  }}
                >
                  <InputSlot style={{ paddingLeft: 8 }}>
                    <InputIcon as={Lock} color="#10b981" />
                  </InputSlot>
                  <InputField
                    placeholder="Şifre tekrarı"
                    secureTextEntry={!isConfirmPasswordVisible}
                    value={form.confirmPassword}
                    onChangeText={(text) =>
                      handleInputChange("confirmPassword", text)
                    }
                    style={{ fontSize: 16, paddingLeft: 8 }}
                  />
                  <InputSlot
                    style={{ paddingRight: 8 }}
                    onPress={toggleConfirmPasswordVisibility}
                  >
                    <InputIcon
                      as={isConfirmPasswordVisible ? EyeOff : Eye}
                      color="#10b981"
                    />
                  </InputSlot>
                </Input>
                {errors.confirmPassword ? (
                  <FormControlError style={{ marginTop: 6, marginLeft: 16 }}>
                    <FormControlErrorText style={{ fontSize: 13 }}>
                      {errors.confirmPassword}
                    </FormControlErrorText>
                  </FormControlError>
                ) : null}
              </FormControl>

              <Box style={{ marginBottom: 24, paddingHorizontal: 10 }}>
                <Text
                  className="text-gray-500 text-xs"
                  style={{ marginBottom: 4 }}
                >
                  Kaydolarak şunları kabul etmiş olursunuz:
                  <Text
                    className="text-emerald-600 text-xs"
                    style={{ fontWeight: "600" }}
                  >
                    {" "}
                    Hizmet Koşulları{" "}
                  </Text>
                  ve
                  <Text
                    className="text-emerald-600 text-xs"
                    style={{ fontWeight: "600" }}
                  >
                    {" "}
                    Gizlilik Politikası
                  </Text>
                </Text>
              </Box>

              <Button
                size="lg"
                style={{
                  borderRadius: 30,
                  height: 60,
                  backgroundColor: "#10b981",
                  shadowColor: "#10b981",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 4,
                }}
                onPress={handleSignUp}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <ButtonText
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      letterSpacing: 1,
                      color: "white",
                    }}
                  >
                    KAYIT OL
                  </ButtonText>
                )}
              </Button>

              <Center style={{ marginTop: 40 }}>
                <Box style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text size="sm" style={{ color: "#666666", fontSize: 15 }}>
                    Zaten hesabınız var mı?
                  </Text>
                  <Link
                    onPress={() => router.navigate("/(auth)/signin")}
                    style={{ marginLeft: 4 }}
                  >
                    <LinkText
                      className="text-emerald-600"
                      style={{ fontWeight: "700", fontSize: 15 }}
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
    width: 54,
    height: 54,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
});
