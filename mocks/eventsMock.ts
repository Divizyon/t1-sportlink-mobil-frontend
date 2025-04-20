/**
 * Etkinlikler sayfası için mock veriler
 */

import { Event } from "./types";

// GET isteği için örnek yanıtlar (etkinlikleri listeleme)
export const eventsMockData = {
  // Response data
  responseData: {
    upcoming: [
      {
        id: 1,
        title: "Hazırlık Maçı - A Takımı",
        description:
          "Sezon öncesi hazırlık maçı. Tüm takım üyelerinin katılımı bekleniyor.",
        date: new Date(new Date().setDate(new Date().getDate() + 2)),
        time: "15:00",
        endTime: "17:00",
        location: "Ana Saha",
        category: "Futbol",
        participants: 18,
        maxParticipants: 22,
        status: "approved",
        organizer: {
          id: "u3",
          name: "Mehmet Can",
          avatar: "https://randomuser.me/api/portraits/men/65.jpg",
        },
        image: "https://example.com/images/football-match.jpg",
        isAttending: true,
      },
      {
        id: 2,
        title: "Dayanıklılık Antrenmanı",
        description: "Takım için özel dayanıklılık ve kondisyon antrenmanı.",
        date: new Date(new Date().setDate(new Date().getDate() + 4)),
        time: "09:30",
        endTime: "11:30",
        location: "Kondisyon Salonu",
        category: "Antrenman",
        participants: 15,
        maxParticipants: 20,
        status: "approved",
        organizer: {
          id: "u3",
          name: "Mehmet Can",
          avatar: "https://randomuser.me/api/portraits/men/65.jpg",
        },
        image: "https://example.com/images/conditioning.jpg",
        isAttending: true,
      },
    ],

    today: [
      {
        id: 201,
        title: "Taktik Antrenmanı",
        description: "Maç taktiği ve set oyunları üzerine çalışma.",
        date: new Date(),
        time: "16:00",
        endTime: "18:00",
        location: "Ana Saha",
        category: "Antrenman",
        participants: 20,
        maxParticipants: 22,
        status: "approved",
        organizer: {
          id: "u3",
          name: "Mehmet Can",
          avatar: "https://randomuser.me/api/portraits/men/65.jpg",
        },
        image: "https://example.com/images/tactical-training.jpg",
        isAttending: true,
      },
    ],

    past: [
      {
        id: 101,
        title: "Sezon Açılış Maçı",
        description: "Yeni sezon açılış karşılaşması.",
        date: new Date(new Date().setDate(new Date().getDate() - 10)),
        time: "15:00",
        endTime: "17:00",
        location: "Ana Saha",
        category: "Futbol",
        participants: 22,
        maxParticipants: 22,
        status: "completed",
        organizer: {
          id: "u2",
          name: "Emre Yıldırım",
          avatar: "https://randomuser.me/api/portraits/men/22.jpg",
        },
        image: "https://example.com/images/season-opener.jpg",
        isAttending: true,
      },
    ],
  },

  // Hata durumu için örnek yanıt
  errorResponse: {
    success: false,
    message: "Etkinlikler yüklenemedi.",
  },
};

// GET isteği için örnek yanıt (etkinlik detayı)
export const eventDetailMockData = {
  // Response data
  responseData: {
    id: 1,
    title: "Hazırlık Maçı - A Takımı",
    description:
      "Sezon öncesi hazırlık maçı. Tüm takım üyelerinin katılımı bekleniyor. Maç öncesi 30 dakika ısınma yapılacak.",
    date: new Date(new Date().setDate(new Date().getDate() + 2)),
    time: "15:00",
    endTime: "17:00",
    location: "Ana Saha",
    address: "Spor Kompleksi, Merkez Mah. Stadyum Cad. No:12, İstanbul",
    coordinates: {
      latitude: 41.0822,
      longitude: 28.9952,
    },
    category: "Futbol",
    participants: 18,
    maxParticipants: 22,
    status: "approved",
    organizer: {
      id: "u3",
      name: "Mehmet Can",
      avatar: "https://randomuser.me/api/portraits/men/65.jpg",
      phoneNumber: "+90 555 123 4567",
    },
    image: "https://example.com/images/football-match.jpg",
    isAttending: true,
    attendees: [
      {
        id: "u1",
        name: "Ali Yılmaz",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      },
      {
        id: "u2",
        name: "Zeynep Demir",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      },
    ],
    notes:
      "Lütfen forma ve spor ayakkabı getirin. Su şişeleri sahada temin edilecektir.",
    requirements: ["Forma", "Spor ayakkabı", "Kimlik kartı"],
    createdAt: "2023-12-15T12:00:00Z",
    updatedAt: "2023-12-18T09:30:00Z",
  },

  // Hata durumu için örnek yanıt
  errorResponse: {
    success: false,
    message: "Etkinlik detayları yüklenemedi.",
  },
};

// POST isteği için örnek veri (etkinlik oluşturma)
export const createEventMockData = {
  // Request data
  requestData: {
    title: "Yeni Hazırlık Maçı",
    description: "Sezon başlangıcı öncesi son hazırlık maçı.",
    date: "2023-08-25",
    time: "16:00",
    endTime: "18:00",
    location: "Ana Saha",
    address: "Spor Kompleksi, Merkez Mah. Stadyum Cad. No:12, İstanbul",
    coordinates: {
      latitude: 41.0822,
      longitude: 28.9952,
    },
    category: "Futbol",
    maxParticipants: 22,
    image: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...",
    notes: "Lütfen forma ve spor ayakkabı getirin.",
    requirements: ["Forma", "Spor ayakkabı", "Kimlik kartı"],
  },

  // Response data
  responseData: {
    success: true,
    message: "Etkinlik başarıyla oluşturuldu.",
    eventId: 5,
  },

  // Hata durumu için örnek yanıt
  errorResponse: {
    success: false,
    message: "Etkinlik oluşturulamadı.",
    errors: {
      title: "Etkinlik başlığı gereklidir.",
      date: "Geçerli bir tarih giriniz.",
    },
  },
};

// PUT isteği için örnek veri (etkinlik güncelleme)
export const updateEventMockData = {
  // Request data
  requestData: {
    title: "Güncellenmiş Hazırlık Maçı",
    description: "Sezon başlangıcı öncesi son hazırlık maçı (güncellendi).",
    date: "2023-08-26",
    time: "17:00",
    endTime: "19:00",
    maxParticipants: 24,
  },

  // Response data
  responseData: {
    success: true,
    message: "Etkinlik başarıyla güncellendi.",
    eventId: 1,
  },

  // Hata durumu için örnek yanıt
  errorResponse: {
    success: false,
    message: "Etkinlik güncellenemedi.",
  },
};

// POST isteği için örnek veri (etkinliğe katılma/ayrılma)
export const eventParticipationMockData = {
  // Katılma - Request data
  joinRequestData: {
    eventId: 1,
    action: "join",
  },

  // Katılma - Response data
  joinResponseData: {
    success: true,
    message: "Etkinliğe başarıyla katıldınız.",
    eventId: 1,
    participantCount: 19,
  },

  // Ayrılma - Request data
  leaveRequestData: {
    eventId: 1,
    action: "leave",
  },

  // Ayrılma - Response data
  leaveResponseData: {
    success: true,
    message: "Etkinlikten ayrıldınız.",
    eventId: 1,
    participantCount: 18,
  },

  // Hata durumu için örnek yanıt
  errorResponse: {
    success: false,
    message: "İşlem gerçekleştirilemedi.",
  },
};

// DELETE isteği için örnek yanıt (etkinlik silme)
export const deleteEventMockData = {
  // Response data
  responseData: {
    success: true,
    message: "Etkinlik başarıyla silindi.",
  },

  // Hata durumu için örnek yanıt
  errorResponse: {
    success: false,
    message: "Etkinlik silinemedi.",
  },
};

// HTTP Methods
export const eventsApiEndpoint = "/api/events"; // GET (liste), POST (oluşturma)
export const eventDetailApiEndpoint = "/api/events/:id"; // GET (detay), PUT (güncelleme), DELETE (silme)
export const eventParticipationApiEndpoint = "/api/events/:id/participation"; // POST (katılma/ayrılma)
export const eventCategoriesApiEndpoint = "/api/events/categories"; // GET
