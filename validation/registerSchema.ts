// validation/validationSchema.ts
import * as yup from 'yup';

export const registerSchema = yup.object().shape({
  username: yup
    .string()
    .required('Kullanıcı adı zorunludur')
    .min(3, 'Kullanıcı adı en az 3 karakter olmalıdır')
    .max(20, 'Kullanıcı adı en fazla 20 karakter olmalıdır'),
  email: yup
    .string()
    .required('E-posta zorunludur')
    .email('Geçerli bir e-posta adresi giriniz'),
  password: yup
    .string()
    .required('Şifre zorunludur')
    .min(6, 'Şifre en az 6 karakter olmalıdır')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/,
      'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir'
    ),
});
