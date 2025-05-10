import api from "./api";

// API URL tanımı - Environment değişkenini doğru şekilde kullan
// .env dosyasındaki EXPO_PUBLIC_API=http://192.168.56.1:3000/api olduğundan
// "/api" öneki zaten URL'de var, tekrar eklemeye gerek yok
const baseUrl = process.env.EXPO_PUBLIC_API;
console.log("Kullanılan API URL:", baseUrl);

export interface News {
  id: number;
  title: string;
  content: string;
  image_url?: string;
  source?: string;
  sport_id?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
  source_url?: string;
  published_date?: string;
  type?: string;
  end_time?: string;
  tags?: string[];
  Sports?: {
    name: string;
    icon: string;
  };
  creator_id?: string;
}

export interface NewsResponse {
  success: boolean;
  data: News[];
  count: number;
  pagination: {
    limit: number;
    offset: number;
    totalPages: number;
  };
}

export interface AnnouncementResponse {
  success: boolean;
  data: News[];
}

export interface NewsDetailResponse {
  success: boolean;
  data: News | null;
}

/**
 * Fetch news with pagination
 * @param page Page number (0-based)
 * @param limit Items per page
 * @param sportId Optional sport category filter
 */
export const fetchNews = async (
  page = 0,
  limit = 20,
  sportId?: number
): Promise<NewsResponse> => {
  try {
    const offset = page * limit;
    // API endpoint URL oluştur - "/api" öneki zaten baseUrl'de olduğu için kaldırıldı
    let url = `${baseUrl}/user-news?limit=${limit}&offset=${offset}`;
    if (sportId) url += `&sport_id=${sportId}`;

    console.log("Fetching news from:", url);

    // Gerçek API'den haberleri çek
    const response = await api.get(url);
    console.log("API response:", response.data);

    if (!response.data || !response.data.success) {
      console.error("API başarısız yanıt:", response.data);
    }

    return response.data;
  } catch (error: any) {
    console.error("Error fetching news:", error);
    // Hata detaylarını kaydet
    if (error.response) {
      console.error("Hata yanıtı:", error.response.status, error.response.data);
    } else if (error.request) {
      console.error("Hata isteği (yanıt alınamadı):", error.request);
    } else {
      console.error("Hata mesajı:", error.message);
    }

    return {
      success: false,
      data: [],
      count: 0,
      pagination: {
        limit,
        offset: page * limit,
        totalPages: 0,
      },
    };
  }
};

/**
 * Fetch announcements
 */
export const fetchAnnouncements = async (): Promise<AnnouncementResponse> => {
  try {
    // "/api" öneki zaten baseUrl'de olduğu için kaldırıldı
    const url = `${baseUrl}/announcements`;
    console.log("Fetching announcements from:", url);

    // Gerçek API'den duyuruları çek
    const response = await api.get(url);
    console.log("Announcements response:", response.data);

    if (!response.data || !response.data.success) {
      console.error("Duyurular API başarısız yanıt:", response.data);
    }

    return response.data;
  } catch (error: any) {
    console.error("Error fetching announcements:", error);
    // Hata detaylarını kaydet
    if (error.response) {
      console.error(
        "Duyurular hata yanıtı:",
        error.response.status,
        error.response.data
      );
    } else if (error.request) {
      console.error("Duyurular hata isteği (yanıt alınamadı):", error.request);
    } else {
      console.error("Duyurular hata mesajı:", error.message);
    }

    return {
      success: false,
      data: [],
    };
  }
};

/**
 * Fetch news detail by ID
 * @param id News ID
 */
export const fetchNewsById = async (
  id: string | string[]
): Promise<NewsDetailResponse> => {
  try {
    if (!id) {
      throw new Error("News ID is required");
    }

    const realId = Array.isArray(id) ? id[0] : id;
    // "/api" öneki zaten baseUrl'de olduğu için kaldırıldı
    const url = `${baseUrl}/user-news/${realId}`;

    console.log("Fetching news detail from:", url);

    // Gerçek API'den haber detayını çek
    const response = await api.get(url);
    console.log("API detail response:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching news with ID ${id}:`, error);
    return {
      success: false,
      data: null,
    };
  }
};

/**
 * Fetch announcement detail by ID
 * @param id Announcement ID
 */
export const fetchAnnouncementById = async (
  id: string | string[]
): Promise<NewsDetailResponse> => {
  try {
    if (!id) {
      throw new Error("Announcement ID is required");
    }

    const realId = Array.isArray(id) ? id[0] : id;
    // "/api" öneki zaten baseUrl'de olduğu için kaldırıldı
    const url = `${baseUrl}/announcements/${realId}`;

    console.log("Fetching announcement detail from:", url);

    // Gerçek API'den duyuru detayını çek
    const response = await api.get(url);
    console.log("Announcement detail response:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching announcement with ID ${id}:`, error);
    return {
      success: false,
      data: null,
    };
  }
};
