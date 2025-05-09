/**
 * Tarih formatla - "23 Ekim" formatında çıktı verir
 * @param dateStr ISO tarih formatındaki string
 * @returns Formatlanmış tarih string'i
 */
export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const day = date.getDate();
  const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  const month = monthNames[date.getMonth()];
  
  return `${day} ${month}`;
};

/**
 * Saat formatla - "14:30" formatında çıktı verir
 * @param timeStr ISO tarih formatındaki string
 * @returns Formatlanmış saat string'i
 */
export const formatTime = (timeStr: string): string => {
  const date = new Date(timeStr);
  return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
};

/**
 * Tarih ve saati birleştir - "23 Ekim, 14:30" formatında çıktı verir
 * @param dateStr ISO tarih formatındaki string
 * @param timeStr ISO tarih formatındaki string
 * @returns Formatlanmış tarih ve saat string'i
 */
export const formatDateTime = (dateStr: string, timeStr: string): string => {
  return `${formatDate(dateStr)}, ${formatTime(timeStr)}`;
};

/**
 * İki saat arasındaki süreyi formatla - "14:30-16:00" formatında çıktı verir
 * @param startStr Başlangıç zamanı ISO tarih formatındaki string
 * @param endStr Bitiş zamanı ISO tarih formatındaki string
 * @returns Formatlanmış süre string'i
 */
export const formatTimeRange = (startStr: string, endStr: string): string => {
  return `${formatTime(startStr)}-${formatTime(endStr)}`;
};

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
 * Verilen tarih bugün mü kontrol et
 * @param date Kontrol edilecek tarih
 * @returns Boolean değer
 */
export const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
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