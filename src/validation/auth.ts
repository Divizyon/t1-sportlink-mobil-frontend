import * as yup from 'yup';

export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email('Geçerli bir email adresi giriniz')
    .required('Email adresi zorunludur'),
  password: yup
    .string()
    .min(6, 'Şifre en az 6 karakter olmalıdır')
    .required('Şifre zorunludur'),
});

export const registerSchema = yup.object().shape({
  name: yup
    .string()
    .min(2, 'İsim en az 2 karakter olmalıdır')
    .required('İsim zorunludur'),
  email: yup
    .string()
    .email('Geçerli bir email adresi giriniz')
    .required('Email adresi zorunludur'),
  password: yup
    .string()
    .min(6, 'Şifre en az 6 karakter olmalıdır')
    .required('Şifre zorunludur'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Şifreler eşleşmiyor')
    .required('Şifre tekrarı zorunludur'),
}); 