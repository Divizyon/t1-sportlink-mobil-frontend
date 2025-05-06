import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableOpacity,
  Alert,
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
  FormControlHelperText,
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
  LogIn,
  Chrome,
  Apple,
} from "lucide-react-native";
import { useAuth } from "../../src/store/AuthContext";

export default function SignInPage() {
  const { login } = useAuth();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleInputChange = (field: string, value: string) => {
    setForm({
      ...form,
      [field]: value,
    });
    if (errors[field as keyof typeof errors]) {
      setErrors({
        ...errors,
        [field]: "",
      });
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    // E-posta kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim() || !emailRegex.test(form.email)) {
      newErrors.email = "Geçerli bir e-posta adresi giriniz";
      isValid = false;
    }

    // Şifre kontrolü
    if (!form.password) {
      newErrors.password = "Şifre alanı zorunludur";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSignIn = async () => {
    if (validateForm()) {
      setLoading(true);
      try {
        const user = await login(form.email, form.password);
        console.log("Giriş başarılı:", user);

        // Başarılı giriş sonrası ana sayfaya yönlendir
        router.navigate("/(tabs)/dashboard");
      } catch (error: any) {
        console.error("Giriş hatası:", error);

        // Kullanıcıya hata mesajı göster
        if (error.response?.data?.message) {
          Alert.alert("Giriş Hatası", error.response.data.message);
        } else if (error.message === "Network Error") {
          Alert.alert(
            "Bağlantı Hatası",
            "Sunucuya bağlanırken bir hata oluştu. Lütfen internet bağlantınızı kontrol edin veya daha sonra tekrar deneyin."
          );
        } else if (error.code === "ECONNABORTED") {
          Alert.alert(
            "Bağlantı Zaman Aşımı",
            "Sunucuya bağlanırken zaman aşımı oluştu. Lütfen daha sonra tekrar deneyin."
          );
        } else {
          Alert.alert(
            "Giriş Hatası",
            "Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin."
          );
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleSignIn = () => {
    console.log("Google ile giriş");
  };

  const handleAppleSignIn = () => {
    console.log("Apple ile giriş");
  };

  const handleForgotPassword = () => {
    console.log("Şifremi unuttum");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <VStack
          space="lg"
          style={{
            paddingHorizontal: 24,
            paddingVertical: 32,
            flex: 1,
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
              Tekrar Hoşgeldiniz
            </Text>
            <Text size="md" className="text-emerald-600 mt-2 text-center">
              Hesabınıza giriş yaparak devam edin
            </Text>
          </Center>

          <Box style={{ marginTop: 24 }}>
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
              style={{ marginBottom: 8 }}
              isInvalid={!!errors.password}
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
                  <FormControlErrorText>{errors.password}</FormControlErrorText>
                </FormControlError>
              ) : null}
            </FormControl>

            <Box style={{ marginTop: 4, alignItems: "flex-end" }}>
              <Link onPress={handleForgotPassword}>
                <LinkText
                  className="text-emerald-600"
                  style={{ fontWeight: "500" }}
                >
                  Şifremi Unuttum
                </LinkText>
              </Link>
            </Box>

            <Button
              size="lg"
              className="bg-emerald-600 mt-6 rounded-lg"
              onPress={handleSignIn}
              disabled={loading}
            >
              <ButtonText className="text-white">
                {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
              </ButtonText>
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
                onPress={handleGoogleSignIn}
                style={styles.socialButton}
              >
                <Chrome size={24} color="#047857" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleAppleSignIn}
                style={styles.socialButton}
              >
                <Apple size={24} color="#047857" />
              </TouchableOpacity>
            </Box>

            <Center style={{ marginTop: 32 }}>
              <Box style={{ flexDirection: "row", alignItems: "center" }}>
                <Text size="sm" className="text-emerald-700">
                  Hesabınız yok mu?
                </Text>
                <Link
                  onPress={() => router.navigate("/(auth)/signup")}
                  style={{ marginLeft: 4 }}
                >
                  <LinkText
                    className="text-emerald-600"
                    style={{ fontWeight: "600" }}
                  >
                    Kayıt Ol
                  </LinkText>
                </Link>
              </Box>
            </Center>
          </Box>
        </VStack>
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
