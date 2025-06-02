import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { format, startOfDay } from "date-fns";
import { TurnoID } from "../../../helpers/constants";

interface LineMachine {
  [key: string]: number;
}

interface HomeState {
  lineMachine: LineMachine;
  filters: {
    date: string;
    turn: TurnoID | "ALL";
  };
}

const today = startOfDay(new Date());

const initialState: HomeState = {
  lineMachine: {},
  filters: {
    date: format(today, "yyyy-MM-dd"),
    turn: "ALL",
  },
};

const homeSlice = createSlice({
  name: "home",
  initialState,
  reducers: {
    setLineMachine: (state, action: PayloadAction<LineMachine>) => {
      state.lineMachine = action.payload;
    },
    setHomeDate: (state, action: PayloadAction<string>) => {
      state.filters.date = action.payload;
    },
    setHomeTurn: (state, action: PayloadAction<TurnoID | "ALL">) => {
      state.filters.turn = action.payload;
    },
    resetHomeFilters: (state) => {
      state.filters.date = format(today, "yyyy-MM-dd");
      state.filters.turn = "ALL";
    },
  },
});

export const {
  setLineMachine,
  setHomeDate,
  setHomeTurn,
  resetHomeFilters,
} = homeSlice.actions;
export default homeSlice.reducer;