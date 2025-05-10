/**
 * Spor kategorisine göre varsayılan resim URL'lerini sağlayan yardımcı fonksiyonlar
 */

// Her spor kategorisi için varsayılan resimler
const defaultSportImages: Record<string, string> = {
  Futbol:
    "https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=1000",
  Basketbol:
    "https://images.pexels.com/photos/358042/pexels-photo-358042.jpeg?auto=compress&cs=tinysrgb&w=1000",
  Voleybol:
    "https://images.pexels.com/photos/6203479/pexels-photo-6203479.jpeg?auto=compress&cs=tinysrgb&w=1000",
  Tenis:
    "https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg?auto=compress&cs=tinysrgb&w=1000",
  Yüzme:
    "https://images.pexels.com/photos/260598/pexels-photo-260598.jpeg?auto=compress&cs=tinysrgb&w=1000",
  Koşu: "https://images.pexels.com/photos/3621183/pexels-photo-3621183.jpeg?auto=compress&cs=tinysrgb&w=1000",
  Yoga: "https://images.pexels.com/photos/317157/pexels-photo-317157.jpeg?auto=compress&cs=tinysrgb&w=1000",
  Bisiklet:
    "https://images.pexels.com/photos/5836/road-bicycle-bike-cyclist.jpg?auto=compress&cs=tinysrgb&w=1000",
  Yürüyüş:
    "https://images.pexels.com/photos/554609/pexels-photo-554609.jpeg?auto=compress&cs=tinysrgb&w=1000",
  Okçuluk:
    "https://images.pexels.com/photos/6794588/pexels-photo-6794588.jpeg?auto=compress&cs=tinysrgb&w=1000",
  "Akıl Oyunları":
    "https://images.pexels.com/photos/207924/pexels-photo-207924.jpeg?auto=compress&cs=tinysrgb&w=1000",
  Diğer:
    "https://images.pexels.com/photos/364308/pexels-photo-364308.jpeg?auto=compress&cs=tinysrgb&w=1000",
};

/**
 * Spor kategorisine göre uygun resmi döndürür
 * @param category Spor kategorisi
 * @returns Kategori için uygun resim URL'si
 */
export const getSportImage = (category: string): string => {
  // Kategori adını işle (boşluk, büyük-küçük harf duyarlılığı vb.)
  const normalizedCategory = category ? category.trim() : "Diğer";

  // Direkt eşleşme kontrolü
  if (defaultSportImages[normalizedCategory]) {
    return defaultSportImages[normalizedCategory];
  }

  // Eşleşme yoksa, içerik kontrolü yap
  const lowerCategory = normalizedCategory.toLowerCase();

  if (
    lowerCategory.includes("futbol") ||
    lowerCategory === "soccer" ||
    lowerCategory === "football"
  ) {
    return defaultSportImages["Futbol"];
  }

  if (lowerCategory.includes("basketbol") || lowerCategory.includes("basket")) {
    return defaultSportImages["Basketbol"];
  }

  if (lowerCategory.includes("voleybol") || lowerCategory.includes("voley")) {
    return defaultSportImages["Voleybol"];
  }

  if (lowerCategory.includes("tenis")) {
    return defaultSportImages["Tenis"];
  }

  if (lowerCategory.includes("yüzme") || lowerCategory.includes("swim")) {
    return defaultSportImages["Yüzme"];
  }

  if (lowerCategory.includes("koşu") || lowerCategory.includes("run")) {
    return defaultSportImages["Koşu"];
  }

  if (lowerCategory.includes("yoga")) {
    return defaultSportImages["Yoga"];
  }

  if (
    lowerCategory.includes("bisiklet") ||
    lowerCategory.includes("cycling") ||
    lowerCategory === "bicycle"
  ) {
    return defaultSportImages["Bisiklet"];
  }

  if (
    lowerCategory.includes("yürüyüş") ||
    lowerCategory.includes("hiking") ||
    lowerCategory === "walking"
  ) {
    return defaultSportImages["Yürüyüş"];
  }

  if (lowerCategory.includes("okçuluk") || lowerCategory.includes("archery")) {
    return defaultSportImages["Okçuluk"];
  }

  if (
    lowerCategory.includes("akıl") ||
    lowerCategory.includes("zeka") ||
    lowerCategory.includes("satranç") ||
    lowerCategory.includes("chess")
  ) {
    return defaultSportImages["Akıl Oyunları"];
  }

  // Hiçbir eşleşme bulunamazsa varsayılan resmi döndür
  return defaultSportImages["Diğer"];
};
