/**
 * REDUX STORE
 * Root store. Add more slices here when you build more features.
 */

import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/slice/auth.slice';

const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
