import { configureStore } from '@reduxjs/toolkit';
import discardsReducer from './features/discardSlice';
import homeReducer from './features/homeSlice';
import liveLinesReducer from './features/liveLinesSlice';
import pinsReducer from './features/pinsSlice';
import preventivaReducer from './features/preventivaSlice';
import productionReducer from './features/productionSlice';
import sidebarReducer from './features/sidebarSlice';
import userReducer from './features/userSlice';

export const store = configureStore({
  reducer: {
    sidebar: sidebarReducer,
    home: homeReducer,
    user: userReducer,
    production: productionReducer,
    discards: discardsReducer,
    liveLines: liveLinesReducer,
    preventiva: preventivaReducer,
    pins: pinsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
