# T1 Sportlink Mobil Frontend

## Proje Yapısı

```
src/
├── app/                    # Expo Router ile sayfa yapılandırması
├── components/            # Yeniden kullanılabilir UI bileşenleri
│   ├── common/           # Genel kullanım bileşenleri
│   ├── forms/            # Form bileşenleri
│   └── layout/           # Layout bileşenleri
├── screens/              # Ekran bileşenleri
├── navigation/           # Navigasyon yapılandırması
├── services/             # API ve harici servis entegrasyonları
├── store/                # Redux/State yönetimi
│   ├── slices/          # Redux slice'ları
│   └── hooks/           # Custom Redux hooks
├── utils/                # Yardımcı fonksiyonlar ve araçlar
├── constants/            # Sabit değerler ve yapılandırmalar
├── types/                # TypeScript tip tanımlamaları
├── hooks/                # Custom React hooks
├── assets/               # Statik dosyalar (resimler, fontlar vb.)
└── theme/                # Tema yapılandırması ve stil tanımlamaları
```

## Klasör Açıklamaları

### app/
- Expo Router ile sayfa yapılandırması
- Dosya tabanlı routing sistemi
- Sayfa bileşenleri ve layout'ları

### components/
- Yeniden kullanılabilir UI bileşenleri
- Common: Butonlar, kartlar, input'lar gibi temel bileşenler
- Forms: Form elemanları ve validasyon bileşenleri
- Layout: Header, footer, sidebar gibi layout bileşenleri

### screens/
- Uygulama ekranları
- Her ekran kendi state ve mantığını içerir
- Bileşenleri components/ klasöründen import eder

### navigation/
- Navigasyon yapılandırması
- Stack, tab ve drawer navigator tanımlamaları
- Navigasyon tipleri ve parametreleri

### services/
- API çağrıları ve harici servis entegrasyonları
- API endpoint tanımlamaları
- HTTP client yapılandırması
- Servis katmanı mantığı

### store/
- Redux/State yönetimi
- Slices: Redux state parçaları ve reducer'lar
- Hooks: Custom Redux hooks'ları

### utils/
- Yardımcı fonksiyonlar
- Formatlama ve dönüştürme fonksiyonları
- Validasyon fonksiyonları
- Utility araçları

### constants/
- Sabit değerler
- API endpoint'leri
- Yapılandırma değerleri
- Enum'lar

### types/
- TypeScript tip tanımlamaları
- Interface'ler
- Type alias'lar
- Enum'lar

### hooks/
- Custom React hooks
- State yönetimi hooks'ları
- API çağrısı hooks'ları
- Utility hooks'ları

### assets/
- Statik dosyalar
- Resimler
- Fontlar
- Diğer medya dosyaları

### theme/
- Tema yapılandırması
- Renk paletleri
- Tipografi
- Spacing ve sizing değerleri
- Stil tanımlamaları

## Geliştirme Kuralları

1. Her bileşen kendi klasöründe olmalı ve index.ts dosyası içermeli
2. Bileşenler mümkün olduğunca küçük ve tek sorumluluk prensibine uygun olmalı
3. Tüm API çağrıları services/ klasöründe yapılmalı
4. State yönetimi store/ klasöründe merkezi olarak yapılmalı
5. Tüm tip tanımlamaları types/ klasöründe olmalı
6. Sabit değerler constants/ klasöründe tanımlanmalı
7. Stil tanımlamaları theme/ klasöründe merkezi olarak yönetilmeli

# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
