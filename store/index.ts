import { configureStore } from '@reduxjs/toolkit';
import friendsReducer from './slices/friendsSlice';
// ... diğer importlar ...

export const store = configureStore({
  reducer: {
    friends: friendsReducer,
    // ... diğer reducerlar ...
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 