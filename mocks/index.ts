/**
 * Tüm mock verilerini dışa aktaran index dosyası
 */

// Types
export * from "./types";

// Auth
export * from "./loginMock";
export * from "./registerMock";
export * from "./forgotPasswordMock";

// User
export {
  usersMockData,
  userDetailMockData,
  userFriendsMockData,
  friendRequestMockData,
  removeFriendMockData,
  usersApiEndpoint,
  userDetailApiEndpoint,
  userFriendsApiEndpoint,
  friendRequestApiEndpoint,
  removeFriendApiEndpoint,
} from "./usersMock";
export * from "./profileMock";

// Events
export * from "./eventsMock";

// Notifications
export * from "./notificationsMock";

// Chat
export * from "./chatMock";

// Search - burası usersMock ile çakışıyordu
export {
  searchMockData,
  searchUsersMockData as searchOnlyUsersMockData,
  searchEventsMockData,
  searchApiEndpoint,
  searchEventsApiEndpoint,
  // usersMock ile çakışan export
  searchUsersApiEndpoint as searchOnlyUsersApiEndpoint,
} from "./searchMock";

// Settings
export * from "./settingsMock";
