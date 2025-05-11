// Türkçe ay isimleri
const months = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

// Türkçe kısa ay isimleri
const shortMonths = [
  "Oca",
  "Şub",
  "Mar",
  "Nis",
  "May",
  "Haz",
  "Tem",
  "Ağu",
  "Eyl",
  "Eki",
  "Kas",
  "Ara",
];

/**
 * Verilen ISO tarih stringini "25 Mayıs" formatına dönüştürür
 * @param dateString ISO formatında tarih (örn: "2025-05-11T00:00:00")
 * @returns Formatlanmış tarih
 */
export const formatEventDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);

    // Geçerli bir tarih mi kontrol et
    if (isNaN(date.getTime())) {
      return "Geçersiz Tarih";
    }

    const day = date.getDate();
    const month = months[date.getMonth()];

    return `${day} ${month}`;
  } catch (error) {
    console.error("formatEventDate error:", error);
    return "Geçersiz Tarih";
  }
};

/**
 * Verilen ISO zaman stringini "18:00-20:00" formatına dönüştürür
 * @param startTime ISO formatında başlangıç zamanı
 * @param endTime ISO formatında bitiş zamanı
 * @returns Formatlanmış zaman aralığı
 */
export const formatEventTime = (startTime: string, endTime: string): string => {
  try {
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return "Geçersiz Zaman";
    }

    const formatTimeDigit = (date: Date) => {
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    };

    return `${formatTimeDigit(start)}-${formatTimeDigit(end)}`;
  } catch (error) {
    console.error("formatEventTime error:", error);
    return "Geçersiz Zaman";
  }
};

/**
 * İki tarih arasında kaç gün olduğunu hesaplar
 * @param date1 İlk tarih
 * @param date2 İkinci tarih
 * @returns Gün sayısı
 */
export const daysBetween = (date1: Date, date2: Date): number => {
  const oneDay = 24 * 60 * 60 * 1000; // saat * dakika * saniye * milisaniye
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.round(diffTime / oneDay);
};

/**
 * Etkinliğin durumunu göstermek için kullanılan yardımcı fonksiyon
 * @param eventDate Etkinlik tarihi
 * @param currentDate Şimdiki zaman (opsiyonel)
 * @returns "Bugün", "Yarın", "3 gün sonra" vb.
 */
export const getEventTimeStatus = (
  eventDate: string,
  currentDate: Date = new Date()
): string => {
  try {
    const date = new Date(eventDate);

    if (isNaN(date.getTime())) {
      return "Belirsiz";
    }

    // Eğer zaman geçtiyse
    if (date < currentDate) {
      return "Gerçekleşti";
    }

    const days = daysBetween(currentDate, date);

    if (days === 0) {
      return "Bugün";
    } else if (days === 1) {
      return "Yarın";
    } else if (days < 7) {
      return `${days} gün sonra`;
    } else if (days < 30) {
      const weeks = Math.floor(days / 7);
      return `${weeks} hafta sonra`;
    } else {
      return `${date.getDate()} ${months[date.getMonth()]}`;
    }
  } catch (error) {
    console.error("getEventTimeStatus error:", error);
    return "Belirsiz";
  }
};
