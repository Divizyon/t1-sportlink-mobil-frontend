import { Notification } from "../types/app";

/**
 * Mobil uygulama için bildirim mock verileri
 */

// Bildirimler listesi
export const NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    title: "Yeni Antrenman Eklendi",
    message:
      "Yarın 09:00'da 'Kardiyovasküler Dayanıklılık' antrenmanı eklendi.",
    type: "workout",
    isRead: false,
    createdAt: new Date(new Date().setHours(new Date().getHours() - 2)),
    relatedId: 1,
  },
  {
    id: 2,
    title: "Etkinlik Hatırlatması",
    message: "Yarın Hazırlık Maçınız bulunuyor. 15:00'da Ana Sahada olunuz.",
    type: "event",
    isRead: true,
    createdAt: new Date(new Date().setHours(new Date().getHours() - 5)),
    relatedId: 1,
  },
  {
    id: 3,
    title: "Antrenman İptal Edildi",
    message:
      "Bugün 14:00'daki Kuvvet Antrenmanı iptal edildi. Yeni planlama için takipte kalın.",
    type: "workout",
    isRead: false,
    createdAt: new Date(new Date().setHours(new Date().getHours() - 24)),
  },
  {
    id: 4,
    title: "Takım Duyurusu",
    message:
      "Amatör Lig fikstürü açıklandı. Detaylar için takım sayfasını ziyaret edin.",
    type: "team",
    isRead: true,
    createdAt: new Date(new Date().setDate(new Date().getDate() - 2)),
    relatedId: 1,
  },
  {
    id: 5,
    title: "Yeni Takım Üyesi",
    message:
      "Takımımıza yeni bir üye katıldı: Hakan Demir, Orta Saha oyuncusu.",
    type: "team",
    isRead: false,
    createdAt: new Date(new Date().setDate(new Date().getDate() - 3)),
    relatedId: 1,
  },
  {
    id: 6,
    title: "Performans Raporu Hazır",
    message:
      "Haftalık performans raporunuz hazırlandı. Profil sayfanızdan inceleyebilirsiniz.",
    type: "system",
    isRead: true,
    createdAt: new Date(new Date().setDate(new Date().getDate() - 4)),
  },
  {
    id: 7,
    title: "Antrenman Başarıyla Tamamlandı",
    message:
      "Çeviklik ve Koordinasyon antrenmanını başarıyla tamamladınız. Tebrikler!",
    type: "workout",
    isRead: true,
    createdAt: new Date(new Date().setDate(new Date().getDate() - 2)),
    relatedId: 4,
  },
  {
    id: 8,
    title: "Yeni Eğitim İçeriği",
    message:
      "Beslenme ve Toparlanma konulu yeni eğitim videoları eklendi. Hemen izleyin!",
    type: "system",
    isRead: false,
    createdAt: new Date(new Date().setDate(new Date().getDate() - 1)),
  },
  {
    id: 9,
    title: "Etkinlik Güncellendi",
    message: "Bugünkü Taktik Antrenmanı 16:00 yerine 17:00'a ertelendi.",
    type: "event",
    isRead: false,
    createdAt: new Date(new Date().setHours(new Date().getHours() - 3)),
    relatedId: 201,
  },
  {
    id: 10,
    title: "Takım Toplantısı Hatırlatması",
    message:
      "3 gün sonra 18:00'da Takım Toplantısı yapılacak. Lütfen katılım sağlayın.",
    type: "event",
    isRead: true,
    createdAt: new Date(new Date().setHours(new Date().getHours() - 12)),
    relatedId: 5,
  },
];

// Okunmamış bildirimler
export const UNREAD_NOTIFICATIONS = NOTIFICATIONS.filter(
  (notification) => !notification.isRead
);

// Okunmuş bildirimler
export const READ_NOTIFICATIONS = NOTIFICATIONS.filter(
  (notification) => notification.isRead
);

// Bildirim tipleri
export const NOTIFICATION_TYPES = {
  event: "Etkinlik",
  workout: "Antrenman",
  team: "Takım",
  system: "Sistem",
};
