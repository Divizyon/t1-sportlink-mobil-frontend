// app.config.js
module.exports = {
  name: "SportLink",
  slug: "sportlink",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.sportlink.app",
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    package: "com.sportlink.app",
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  plugins: ["expo-router"],
  scheme: "sportlink",
  jsEngine: "hermes",
  newArchEnabled: true,
  experiments: {
    tsconfigPaths: true,
  },
  extra: {
    apiUrl:
      process.env.EXPO_PUBLIC_API ||
      "https://t1-sportlink-mobil-backend-5jyo.vercel.app/api",
  },
};
