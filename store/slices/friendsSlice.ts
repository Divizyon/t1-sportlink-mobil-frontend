import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "@/services/api";
import { websocketService } from "@/services/websocket";

export interface FriendRequest {
  id: number;
  senderId: number;
  receiverId: number;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  createdAt: string;
  sender: {
    id: number;
    name: string;
    avatar: string;
    username: string;
  };
}

interface FriendsState {
  requests: FriendRequest[];
  pendingRequests: number[];
  loading: boolean;
  error: string | null;
}

const initialState: FriendsState = {
  requests: [],
  pendingRequests: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchFriendRequests = createAsyncThunk(
  "friends/fetchRequests",
  async () => {
    const response = await apiClient.get("/friends/requests");
    return response.data;
  }
);

export const sendFriendRequest = createAsyncThunk(
  "friends/sendRequest",
  async (userId: number) => {
    const response = await apiClient.post("/friends/request", { userId });
    websocketService.sendFriendRequest(userId);
    return response.data;
  }
);

export const acceptFriendRequest = createAsyncThunk(
  "friends/acceptRequest",
  async (requestId: number) => {
    const response = await apiClient.put(
      `/friends/request/${requestId}/accept`
    );
    websocketService.acceptFriendRequest(requestId);
    return response.data;
  }
);

export const rejectFriendRequest = createAsyncThunk(
  "friends/rejectRequest",
  async (requestId: number) => {
    const response = await apiClient.put(
      `/friends/request/${requestId}/reject`
    );
    websocketService.rejectFriendRequest(requestId);
    return response.data;
  }
);

export const cancelFriendRequest = createAsyncThunk(
  "friends/cancelRequest",
  async (requestId: number) => {
    const numericRequestId = Number(requestId);
    if (isNaN(numericRequestId)) {
      throw new Error("Geçersiz istek ID formatı");
    }

    const response = await apiClient.delete(
      `/mobile/friendships/requests/${numericRequestId}`
    );
    websocketService.cancelFriendRequest(numericRequestId);
    return response.data;
  }
);

const friendsSlice = createSlice({
  name: "friends",
  initialState,
  reducers: {
    updateFriendRequest: (state, action) => {
      const { id, status } = action.payload;
      const request = state.requests.find((req) => req.id === id);
      if (request) {
        request.status = status;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch requests
      .addCase(fetchFriendRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFriendRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload;
      })
      .addCase(fetchFriendRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Bir hata oluştu";
      })
      // Send request
      .addCase(sendFriendRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendFriendRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingRequests.push(action.payload.userId);
      })
      .addCase(sendFriendRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Bir hata oluştu";
      })
      // Accept request
      .addCase(acceptFriendRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(acceptFriendRequest.fulfilled, (state, action) => {
        state.loading = false;
        const request = state.requests.find(
          (req) => req.id === action.payload.id
        );
        if (request) {
          request.status = "accepted";
        }
      })
      .addCase(acceptFriendRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Bir hata oluştu";
      })
      // Reject request
      .addCase(rejectFriendRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectFriendRequest.fulfilled, (state, action) => {
        state.loading = false;
        const request = state.requests.find(
          (req) => req.id === action.payload.id
        );
        if (request) {
          request.status = "rejected";
        }
      })
      .addCase(rejectFriendRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Bir hata oluştu";
      })
      // Cancel request
      .addCase(cancelFriendRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelFriendRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingRequests = state.pendingRequests.filter(
          (id) => id !== action.payload.userId
        );
      })
      .addCase(cancelFriendRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Bir hata oluştu";
      });
  },
});

export const { updateFriendRequest, clearError } = friendsSlice.actions;
export default friendsSlice.reducer;
