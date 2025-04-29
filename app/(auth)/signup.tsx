import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Image,
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
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@/src/store/authContext";

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function SignUpPage() {
  const { authState, signUp, clearError } = useAuth();
  const { isLoading, error, isAuthenticated } = authState;

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [form, setForm] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [validationErrors, setValidationErrors] = useState<FormErrors>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Eğer kullanıcı zaten giriş yapmışsa, dashboard'a yönlendir
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(tabs)/dashboard");
    }
  }, [isAuthenticated]);

  // Auth context'teki hata değiştiğinde temizle
  useEffect(() => {
    if (error) {
      // 5 saniye sonra hatayı temizle
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

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
    if (validationErrors[field]) {
      setValidationErrors({
        ...validationErrors,
        [field]: "",
      });
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...validationErrors };

    // Kullanıcı adı kontrolü
    if (!form.username.trim()) {
      newErrors.username = "Kullanıcı adı zorunludur";
      isValid = false;
    }

    // E-posta kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim() || !emailRegex.test(form.email)) {
      newErrors.email = "Geçerli bir e-posta adresi giriniz";
      isValid = false;
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

    setValidationErrors(newErrors);
    return isValid;
  };

  const handleSignUp = async () => {
    if (validateForm()) {
      await signUp({
        username: form.username,
        email: form.email,
        password: form.password,
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

            {/* Hata mesajı */}
            {error && (
              <Box className="bg-red-100 p-3 rounded-lg mb-2">
                <Text className="text-red-600 text-center">{error}</Text>
              </Box>
            )}

            <Box style={{ marginTop: 24 }}>
              <FormControl
                isInvalid={!!validationErrors.username}
                style={{ marginBottom: 16 }}
              >
                <FormControlLabel>
                  <FormControlLabelText className="text-emerald-700">
                    Kullanıcı Adı
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
                    placeholder="Kullanıcı adınızı girin"
                    value={form.username}
                    onChangeText={(text) => handleInputChange("username", text)}
                  />
                </Input>
                {validationErrors.username ? (
                  <FormControlError>
                    <FormControlErrorText>
                      {validationErrors.username}
                    </FormControlErrorText>
                  </FormControlError>
                ) : null}
              </FormControl>

              <FormControl
                isInvalid={!!validationErrors.email}
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
                {validationErrors.email ? (
                  <FormControlError>
                    <FormControlErrorText>
                      {validationErrors.email}
                    </FormControlErrorText>
                  </FormControlError>
                ) : null}
              </FormControl>

              <FormControl
                isInvalid={!!validationErrors.password}
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
                {validationErrors.password ? (
                  <FormControlError>
                    <FormControlErrorText>
                      {validationErrors.password}
                    </FormControlErrorText>
                  </FormControlError>
                ) : null}
              </FormControl>

              <FormControl
                isInvalid={!!validationErrors.confirmPassword}
                style={{ marginBottom: 16 }}
              >
                <FormControlLabel>
                  <FormControlLabelText className="text-emerald-700">
                    Şifre Tekrarı
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
                {validationErrors.confirmPassword ? (
                  <FormControlError>
                    <FormControlErrorText>
                      {validationErrors.confirmPassword}
                    </FormControlErrorText>
                  </FormControlError>
                ) : null}
              </FormControl>

              <Button
                size="lg"
                variant="solid"
                className="bg-emerald-600 mt-4 rounded-lg"
                onPress={handleSignUp}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <ButtonText className="text-white">Kayıt Ol</ButtonText>
                )}
              </Button>

              <Box style={{ marginTop: 24 }}>
                <Text
                  className="text-gray-400 text-center"
                  style={{ marginBottom: 16 }}
                >
                  veya bunlarla devam et
                </Text>

                <Box
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    gap: 16,
                  }}
                >
                  <TouchableOpacity
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 25,
                      backgroundColor: "#f1f5f9",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    onPress={handleGoogleSignUp}
                  >
                    <Chrome color="#047857" size={24} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 25,
                      backgroundColor: "#f1f5f9",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    onPress={handleAppleSignUp}
                  >
                    <Apple color="#047857" size={24} />
                  </TouchableOpacity>
                </Box>
              </Box>

              <Box
                style={{
                  marginTop: 24,
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                <Text className="text-gray-500">Zaten hesabınız var mı? </Text>
                <Link href="/(auth)/signin">
                  <LinkText className="text-emerald-600">Giriş Yap</LinkText>
                </Link>
              </Box>
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
