import { configureStore } from '@reduxjs/toolkit';
import actionPlanReducer from './features/actionPlanSlice';
import discardsSlice from './features/discardsSlice';
import filterReducer from './features/filterSlice';
import homeReducer from './features/homeSlice';
import liveLinesReducer from './features/liveLinesSlice';
import pinsReducer from './features/pinsSlice';
import preventivaReducer from './features/preventivaSlice';
import monthlyProductionReducer from './features/productionMonthSlice';
import productionSlice from './features/productionSlice';
import sidebarReducer from './features/sidebarSlice';
import supervisionReducer from './features/supervisionSlice';
import uiReducer from './features/uiStateSlice';
import userReducer from './features/userSlice';

export const store = configureStore({
  reducer: {
    sidebar: sidebarReducer,
    home: homeReducer,
    user: userReducer,
    monthlyProduction: monthlyProductionReducer,
    liveLines: liveLinesReducer,
    preventiva: preventivaReducer,
    pins: pinsReducer,
    filters: filterReducer,
    uiState: uiReducer,
    supervision: supervisionReducer,
    actionPlans: actionPlanReducer,
    production: productionSlice,
    discards: discardsSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
