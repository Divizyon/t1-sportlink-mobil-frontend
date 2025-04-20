/**
 * Sohbet sayfası için mock veriler
 */

// GET isteği için örnek yanıt (konuşma listesi)
export const conversationsMockData = {
  // Response data
  responseData: {
    conversations: [
      {
        id: "c1",
        participants: [
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
        lastMessage: {
          id: "m5",
          senderId: "u2",
          text: "Tamam, görüşürüz!",
          createdAt: new Date(new Date().setHours(new Date().getHours() - 2)),
          isRead: true,
        },
        unreadCount: 0,
      },
      {
        id: "c2",
        participants: [
          {
            id: "u1",
            name: "Ali Yılmaz",
            avatar: "https://randomuser.me/api/portraits/men/32.jpg",
          },
          {
            id: "u3",
            name: "Mehmet Kaya",
            avatar: "https://randomuser.me/api/portraits/men/65.jpg",
          },
        ],
        lastMessage: {
          id: "m12",
          senderId: "u3",
          text: "Yarınki antrenman iptal oldu, bilgin olsun.",
          createdAt: new Date(new Date().setHours(new Date().getHours() - 5)),
          isRead: false,
        },
        unreadCount: 2,
      },
    ],
  },

  // Hata durumu için örnek yanıt
  errorResponse: {
    success: false,
    message: "Konuşmalar yüklenemedi.",
  },
};

// GET isteği için örnek yanıt (mesaj listesi)
export const messagesMockData = {
  // Response data
  responseData: {
    conversationId: "c1",
    messages: [
      {
        id: "m1",
        senderId: "u1",
        text: "Merhaba, yarınki maça gelecek misin?",
        createdAt: new Date(new Date().setHours(new Date().getHours() - 24)),
        isRead: true,
      },
      {
        id: "m2",
        senderId: "u2",
        text: "Evet, gelmeyi planlıyorum. Saat kaçtaydı?",
        createdAt: new Date(new Date().setHours(new Date().getHours() - 23)),
        isRead: true,
      },
      {
        id: "m3",
        senderId: "u1",
        text: "Saat 15:00'da başlayacak. 14:30'da sahada buluşalım mı?",
        createdAt: new Date(new Date().setHours(new Date().getHours() - 22)),
        isRead: true,
      },
      {
        id: "m4",
        senderId: "u2",
        text: "Olur, 14:30'da orada olurum.",
        createdAt: new Date(new Date().setHours(new Date().getHours() - 3)),
        isRead: true,
      },
      {
        id: "m5",
        senderId: "u2",
        text: "Tamam, görüşürüz!",
        createdAt: new Date(new Date().setHours(new Date().getHours() - 2)),
        isRead: true,
      },
    ],
    participants: [
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
    hasMore: false,
    page: 1,
  },

  // Hata durumu için örnek yanıt
  errorResponse: {
    success: false,
    message: "Mesajlar yüklenemedi.",
  },
};

// POST isteği için örnek veri (yeni mesaj gönderme)
export const sendMessageMockData = {
  // Request data
  requestData: {
    conversationId: "c1",
    text: "Yarınki maç için hazır mısın?",
  },

  // Response data
  responseData: {
    success: true,
    message: {
      id: "m6",
      senderId: "u1",
      text: "Yarınki maç için hazır mısın?",
      createdAt: new Date(),
      isRead: false,
    },
    conversationId: "c1",
  },

  // Hata durumu için örnek yanıt
  errorResponse: {
    success: false,
    message: "Mesaj gönderilemedi.",
  },
};

// POST isteği için örnek veri (yeni konuşma başlatma)
export const startConversationMockData = {
  // Request data
  requestData: {
    participantId: "u4",
    text: "Merhaba, ben Ali. Yarınki etkinlik hakkında konuşabilir miyiz?",
  },

  // Response data
  responseData: {
    success: true,
    conversationId: "c3",
    message: {
      id: "m20",
      senderId: "u1",
      text: "Merhaba, ben Ali. Yarınki etkinlik hakkında konuşabilir miyiz?",
      createdAt: new Date(),
      isRead: false,
    },
  },

  // Hata durumu için örnek yanıt
  errorResponse: {
    success: false,
    message: "Konuşma başlatılamadı.",
  },
};

// PUT isteği için örnek veri (mesajları okundu olarak işaretleme)
export const markMessagesReadMockData = {
  // Request data
  requestData: {
    conversationId: "c2",
    messageIds: ["m12", "m11"],
  },

  // Response data
  responseData: {
    success: true,
    message: "Mesajlar okundu olarak işaretlendi.",
    conversationId: "c2",
  },

  // Hata durumu için örnek yanıt
  errorResponse: {
    success: false,
    message: "Mesajlar işaretlenemedi.",
  },
};

// DELETE isteği için örnek yanıt (konuşma silme)
export const deleteConversationMockData = {
  // Response data
  responseData: {
    success: true,
    message: "Konuşma silindi.",
    conversationId: "c1",
  },

  // Hata durumu için örnek yanıt
  errorResponse: {
    success: false,
    message: "Konuşma silinemedi.",
  },
};

// HTTP Methods
export const conversationsApiEndpoint = "/api/conversations"; // GET (liste), POST (yeni konuşma)
export const messagesApiEndpoint =
  "/api/conversations/:conversationId/messages"; // GET (mesaj listesi), POST (yeni mesaj)
export const markReadApiEndpoint = "/api/conversations/:conversationId/read"; // PUT (okundu işaretleme)
export const deleteConversationApiEndpoint =
  "/api/conversations/:conversationId"; // DELETE (konuşma silme)
