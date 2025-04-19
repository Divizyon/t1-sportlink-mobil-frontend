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
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [form, setForm] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

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
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: "",
      });
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

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

    setErrors(newErrors);
    return isValid;
  };

  const handleSignUp = () => {
    if (validateForm()) {
      console.log("Kayıt formu:", form);
      router.navigate("/(auth)/signin");
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
              <FormControl
                isInvalid={!!errors.username}
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
                {errors.username ? (
                  <FormControlError>
                    <FormControlErrorText>
                      {errors.username}
                    </FormControlErrorText>
                  </FormControlError>
                ) : null}
              </FormControl>

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
              >
                <ButtonText style={{ fontWeight: "bold" }}>Kayıt Ol</ButtonText>
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
