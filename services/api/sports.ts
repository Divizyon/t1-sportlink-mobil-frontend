import { apiClient } from "./client";
import { safeApiCall } from "./utils";

// Sport interface
export interface Sport {
  id: number;
  name: string;
  icon: string;
  created_at?: string;
  updated_at?: string;
}

export const sportsApi = {
  // Get all sports
  getAllSports: async () => {
    return safeApiCall(async () => {
      console.log("[API] Fetching all sports categories");
      const response = await apiClient.get("sports");
      
      if (response.data && response.data.data) {
        console.log(`[API] Found ${response.data.data.length} sports categories`);
        return response.data.data as Sport[];
      }
      
      console.warn("[API] Unknown response format from sports API");
      return [];
    }, []);
  },

  // Get sport by ID
  getSportById: async (id: number) => {
    return safeApiCall(async () => {
      const response = await apiClient.get(`sports/${id}`);
      return response.data.data as Sport;
    }, null);
  }
}; 