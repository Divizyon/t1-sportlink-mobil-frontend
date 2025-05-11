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

// Türkçe gün isimleri
const days = [
  "Pazar",
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi",
];

// Türkçe kısa gün isimleri
const shortDays = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

/**
 * Verilen iki tarih aynı gün mü kontrol et
 * @param date1 Birinci tarih
 * @param date2 İkinci tarih
 * @returns Boolean değer
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * Verilen tarih bu hafta içinde mi kontrol et
 * @param date Kontrol edilecek tarih
 * @returns Boolean değer
 */
export const isThisWeek = (date: Date): boolean => {
  const today = new Date();
  const firstDayOfWeek = new Date(today);
  firstDayOfWeek.setDate(today.getDate() - today.getDay()); // Pazar gününe getir

  const lastDayOfWeek = new Date(firstDayOfWeek);
  lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6); // Cumartesi gününe getir

  return date >= firstDayOfWeek && date <= lastDayOfWeek;
};

/**
 * Verilen tarih bu ay içinde mi kontrol et
 * @param date Kontrol edilecek tarih
 * @returns Boolean değer
 */
export const isThisMonth = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth()
  );
};

/**
 * Verilen ISO tarih stringini "25 Mayıs" formatına dönüştürür
 * @param dateString ISO formatında tarih (örn: "2025-05-11T00:00:00")
 * @returns Formatlanmış tarih
 */
export const formatDate = (dateString: string): string => {
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
    console.error("formatDate error:", error);
    return "Geçersiz Tarih";
  }
};

/**
 * Verilen ISO tarih stringini kısa tarih formatına dönüştürür
 * @param dateString ISO formatında tarih
 * @returns Formatlanmış kısa tarih (örn: "25 May")
 */
export const formatShortDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return "Geçersiz";
    }

    const day = date.getDate();
    const month = shortMonths[date.getMonth()];

    return `${day} ${month}`;
  } catch (error) {
    console.error("formatShortDate error:", error);
    return "Geçersiz";
  }
};

/**
 * Verilen tek zaman için saat formatla (14:30 formatında)
 * @param timeStr ISO tarih formatındaki string
 * @returns Formatlanmış saat string'i
 */
export const formatSingleTime = (timeStr: string): string => {
  const date = new Date(timeStr);
  return date.toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Verilen ISO zaman stringini "18:00-20:00" formatına dönüştürür
 * @param startTime ISO formatında başlangıç zamanı
 * @param endTime ISO formatında bitiş zamanı
 * @returns Formatlanmış zaman aralığı
 */
export const formatTime = (startTime: string, endTime: string): string => {
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
    console.error("formatTime error:", error);
    return "Geçersiz Zaman";
  }
};

/**
 * Tarih ve saati birleştir - "23 Ekim, 14:30" formatında çıktı verir
 * @param dateStr ISO tarih formatındaki string
 * @param timeStr ISO tarih formatındaki string
 * @returns Formatlanmış tarih ve saat string'i
 */
export const formatDateTime = (dateStr: string, timeStr: string): string => {
  return `${formatDate(dateStr)}, ${formatSingleTime(timeStr)}`;
};

/**
 * İki saat arasındaki süreyi formatla - "14:30-16:00" formatında çıktı verir
 * @param startStr Başlangıç zamanı ISO tarih formatındaki string
 * @param endStr Bitiş zamanı ISO tarih formatındaki string
 * @returns Formatlanmış süre string'i
 */
export const formatTimeRange = (startStr: string, endStr: string): string => {
  return formatTime(startStr, endStr);
};

/**
 * Tarih bugün mü kontrol eder
 * @param dateString ISO formatında tarih
 * @returns Tarih bugünse true, değilse false
 */
export const isToday = (dateOrString: Date | string): boolean => {
  const date =
    typeof dateOrString === "string" ? new Date(dateOrString) : dateOrString;
  const today = new Date();

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
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
