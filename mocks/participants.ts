import { Participant } from "../types/app";
import { USERS } from "./users";
import { ALL_EVENTS } from "./events";

/**
 * Mobil uygulama için katılımcı mock verileri
 */

// Etkinliklere katılımcılar listesi
export const PARTICIPANTS: Participant[] = [
  // İlk etkinlik için katılımcılar (ID: 1 - Hazırlık Maçı)
  {
    id: 1,
    userId: 1,
    eventId: 1,
    status: "registered",
    registrationDate: "2023-07-05",
    user: USERS[0],
  },
  {
    id: 2,
    userId: 2,
    eventId: 1,
    status: "registered",
    registrationDate: "2023-07-05",
    user: USERS[1],
  },
  {
    id: 3,
    userId: 3,
    eventId: 1,
    status: "registered",
    registrationDate: "2023-07-04",
    user: USERS[2],
  },

  // İkinci etkinlik için katılımcılar (ID: 2 - Dayanıklılık Antrenmanı)
  {
    id: 4,
    userId: 1,
    eventId: 2,
    status: "registered",
    registrationDate: "2023-07-03",
    user: USERS[0],
  },
  {
    id: 5,
    userId: 2,
    eventId: 2,
    status: "registered",
    registrationDate: "2023-07-03",
    user: USERS[1],
  },

  // Üçüncü etkinlik için katılımcılar (ID: 3 - Teknik Beceri Geliştirme)
  {
    id: 6,
    userId: 2,
    eventId: 3,
    status: "registered",
    registrationDate: "2023-07-02",
    user: USERS[1],
  },

  // Dördüncü etkinlik için katılımcılar (ID: 4 - Amatör Lig Maçı)
  {
    id: 7,
    userId: 1,
    eventId: 4,
    status: "registered",
    registrationDate: "2023-07-01",
    user: USERS[0],
  },
  {
    id: 8,
    userId: 2,
    eventId: 4,
    status: "registered",
    registrationDate: "2023-07-01",
    user: USERS[1],
  },

  // Beşinci etkinlik için katılımcılar (ID: 5 - Takım Toplantısı)
  {
    id: 9,
    userId: 1,
    eventId: 5,
    status: "registered",
    registrationDate: "2023-06-30",
    user: USERS[0],
  },
  {
    id: 10,
    userId: 2,
    eventId: 5,
    status: "registered",
    registrationDate: "2023-06-30",
    user: USERS[1],
  },
  {
    id: 11,
    userId: 3,
    eventId: 5,
    status: "registered",
    registrationDate: "2023-06-29",
    user: USERS[2],
  },

  // İlk geçmiş etkinlik için katılımcılar (ID: 101 - Sezon Açılış Maçı)
  {
    id: 12,
    userId: 1,
    eventId: 101,
    status: "attended",
    registrationDate: "2023-06-15",
    user: USERS[0],
  },
  {
    id: 13,
    userId: 2,
    eventId: 101,
    status: "attended",
    registrationDate: "2023-06-15",
    user: USERS[1],
  },

  // İkinci geçmiş etkinlik için katılımcılar (ID: 102 - Sprint Antrenmanı)
  {
    id: 14,
    userId: 1,
    eventId: 102,
    status: "attended",
    registrationDate: "2023-06-20",
    user: USERS[0],
  },
  {
    id: 15,
    userId: 4,
    eventId: 102,
    status: "absent",
    registrationDate: "2023-06-20",
    user: USERS[3],
  },

  // Bugünkü ilk etkinlik için katılımcılar (ID: 201 - Taktik Antrenmanı)
  {
    id: 16,
    userId: 1,
    eventId: 201,
    status: "registered",
    registrationDate: "2023-07-10",
    user: USERS[0],
  },
  {
    id: 17,
    userId: 2,
    eventId: 201,
    status: "registered",
    registrationDate: "2023-07-10",
    user: USERS[1],
  },

  // Bugünkü ikinci etkinlik için katılımcılar (ID: 202 - Beslenme Semineri)
  {
    id: 18,
    userId: 1,
    eventId: 202,
    status: "registered",
    registrationDate: "2023-07-08",
    user: USERS[0],
  },
];

// Belirli bir etkinliğe katılımcıları getiren yardımcı fonksiyon
export const getEventParticipants = (eventId: number): Participant[] => {
  return PARTICIPANTS.filter((participant) => participant.eventId === eventId);
};

// Belirli bir kullanıcının katıldığı etkinlikleri getiren yardımcı fonksiyon
export const getUserEvents = (userId: number) => {
  const participantRecords = PARTICIPANTS.filter(
    (participant) => participant.userId === userId
  );
  return participantRecords.map((record) => {
    const event = ALL_EVENTS.find((event) => event.id === record.eventId);
    return {
      ...event,
      participationStatus: record.status,
    };
  });
};

// Katılım durumu istatistikleri
export const PARTICIPATION_STATS = {
  registered: PARTICIPANTS.filter((p) => p.status === "registered").length,
  attended: PARTICIPANTS.filter((p) => p.status === "attended").length,
  absent: PARTICIPANTS.filter((p) => p.status === "absent").length,
  cancelled: PARTICIPANTS.filter((p) => p.status === "cancelled").length,
};
