import * as yup from 'yup';

export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email('Geçerli bir email giriniz')
    .required('Email zorunludur'),
  password: yup
    .string()
    .required('Şifre zorunludur'),
}); 