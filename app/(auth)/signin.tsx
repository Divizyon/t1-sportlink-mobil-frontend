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
import { authService } from "../../src/api/authService";

export default function SignInPage() {
  const { login } = useAuth();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
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

  const handleResendVerificationEmail = async (email: string) => {
    setResendingEmail(true);
    try {
      console.log("Doğrulama e-postasını tekrar gönder:", email);
      await authService.resendVerificationEmail(email);
      Alert.alert(
        "Başarılı",
        "Doğrulama e-postası tekrar gönderildi. Lütfen e-posta kutunuzu kontrol edin."
      );
    } catch (error: any) {
      console.error("Doğrulama e-postası gönderme hatası:", error);
      Alert.alert(
        "Hata",
        error.message || "Doğrulama e-postası gönderilirken bir hata oluştu."
      );
    } finally {
      setResendingEmail(false);
    }
  };

  const handleSignIn = async () => {
    if (validateForm()) {
      setLoading(true);
      try {
        if (process.env.NODE_ENV === "development") {
          console.log("Giriş yapılıyor: ", form.email);
        }
        const user = await login(form.email, form.password);
        if (process.env.NODE_ENV === "development") {
          console.log("Giriş başarılı:", user);
        }

        // Başarılı giriş sonrası ana sayfaya yönlendir
        // router.navigate yerine router.replace kullanarak
        // geçmiş yığınını temizleyelim, böylece geri tuşuna basınca
        // giriş sayfasına dönmeyecek
        router.replace("/(tabs)/dashboard");
      } catch (error: any) {
        if (process.env.NODE_ENV === "development") {
          console.error("Giriş hatası:", error);
        }

        // Kullanıcıya hata mesajı göster
        let errorMessage =
          "Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.";
        let needsEmailVerification = false;

        if (error.response?.data) {
          if (error.response.data.message) {
            errorMessage = error.response.data.message;
            // Check if the error is related to email verification
            if (
              errorMessage.toLowerCase().includes("doğrula") ||
              errorMessage.toLowerCase().includes("verify") ||
              errorMessage.toLowerCase().includes("onay")
            ) {
              needsEmailVerification = true;
            }
          } else if (error.response.data.error) {
            errorMessage = error.response.data.error;
          }
        } else if (error.message === "Network Error") {
          errorMessage =
            "Sunucuya bağlanırken bir hata oluştu. Lütfen internet bağlantınızı kontrol edin veya daha sonra tekrar deneyin.";
        } else if (error.code === "ECONNABORTED") {
          errorMessage =
            "Sunucuya bağlanırken zaman aşımı oluştu. Lütfen daha sonra tekrar deneyin.";
        } else if (error.message) {
          errorMessage = error.message;

          // Check if the error is related to email verification
          if (
            errorMessage.toLowerCase().includes("doğrula") ||
            errorMessage.toLowerCase().includes("verify") ||
            errorMessage.toLowerCase().includes("onay")
          ) {
            needsEmailVerification = true;
          }

          // Oturum süresi doldu hatası için özel kontrol
          if (errorMessage.toLowerCase().includes("oturum süresi doldu")) {
            // Giriş sayfasında bu mesaj yanıltıcı olabilir, daha uygun bir mesaj gösterelim
            if (form.email && form.password) {
              errorMessage =
                "E-posta veya şifre hatalı. Lütfen bilgilerinizi kontrol ediniz.";
            }
          }
        }

        if (needsEmailVerification) {
          Alert.alert(
            "E-posta Doğrulama Gerekli",
            "Hesabınıza giriş yapabilmek için lütfen e-posta adresinize gönderilen doğrulama bağlantısına tıklayın.",
            [
              {
                text: "Tamam",
                style: "default",
              },
              {
                text: "Doğrulama E-postasını Tekrar Gönder",
                onPress: () => handleResendVerificationEmail(form.email),
              },
            ]
          );
        } else {
          Alert.alert("Giriş Hatası", errorMessage, [
            { text: "Tamam", style: "cancel" },
          ]);
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
          space="xl"
          style={{
            paddingHorizontal: 30,
            paddingVertical: 20,
            flex: 1,
            justifyContent: "center",
          }}
        >
          <Center style={{ marginBottom: 50 }}>
            {/* Logo */}
            <Box style={{ marginBottom: 30 }}>
              <Image
                source={require("../../assets/images/logo3.png")}
                style={{ width: 140, height: 140 }}
                resizeMode="contain"
              />
            </Box>

            <Text
              size="2xl"
              style={{ fontWeight: "bold" }}
              className="text-emerald-800"
            >
              Hoşgeldiniz
            </Text>
          </Center>

          <Box style={{ marginBottom: 30 }}>
            <FormControl
              isInvalid={!!errors.email}
              style={{ marginBottom: 22 }}
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
                  placeholder="E-posta"
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

            <FormControl isInvalid={!!errors.password}>
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
          </Box>

          <Box
            style={{ alignItems: "flex-end", marginTop: -10, marginBottom: 20 }}
          >
            <Link onPress={handleForgotPassword}>
              <LinkText
                className="text-emerald-600"
                style={{ fontWeight: "500", fontSize: 14 }}
              >
                Şifremi Unuttum
              </LinkText>
            </Link>
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
            onPress={handleSignIn}
            disabled={loading || resendingEmail}
          >
            {loading ? (
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
                GİRİŞ YAP
              </ButtonText>
            )}
          </Button>

          <Center style={{ marginTop: 40 }}>
            <Box style={{ flexDirection: "row", alignItems: "center" }}>
              <Text size="sm" style={{ color: "#666666", fontSize: 15 }}>
                Hesabınız yok mu?
              </Text>
              <Link
                onPress={() => router.navigate("/(auth)/signup")}
                style={{ marginLeft: 4 }}
              >
                <LinkText
                  className="text-emerald-600"
                  style={{ fontWeight: "700", fontSize: 15 }}
                >
                  Kayıt Ol
                </LinkText>
              </Link>
            </Box>
          </Center>
        </VStack>
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
