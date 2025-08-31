import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export interface Habit {
  id: string;
  name: string;
  frequency: "daily" | "weekly";
  completedDates: string[];
  createdAt: string;
}

interface HabitState {
  habits: Habit[];
  loading: boolean;
  error: string | null;
}

const initialState: HabitState = {
  habits: [],
  loading: false,
  error: null
};

// Fetch all habits
export const getHabits = createAsyncThunk("Habit/getHabit", async () => {
  const res = await axios.get("https://habit-tracker-p9t3.onrender.com/api/habits/get");
  return res.data as Habit[];
});

// Add a new habit
export const addHabits = createAsyncThunk(
  "Habit/addHabit",
  async (habit: { name: string; frequency: "daily" | "weekly" }) => {
    const newHabit = {
      ...habit,
      id: Date.now().toString(),
      completedDates: [],
      createdAt: new Date().toISOString()
    };
    const res = await axios.post("https://habit-tracker-p9t3.onrender.com/api/habits", newHabit);
    return res.data as Habit;
  }
);

// Toggle habit completion
export const toggleHabit = createAsyncThunk(
  "Habit/toggleHabit",
  async ({ id, date }: { id: string; date: string }) => {
    try {
      const res = await axios.patch(`https://habit-tracker-p9t3.onrender.com/api/habits/${id}`, { date });
      return res.data as Habit;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to toggle habit");
    }
  }
);

// Reset habit streak
export const resetHabit = createAsyncThunk(
  "Habit/resetHabit",
  async ({ id }: { id: string }) => {
    try {
      const res = await axios.post(`https://habit-tracker-p9t3.onrender.com/api/habits/${id}/reset`);
      return res.data as Habit;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to reset habit");
    }
  }
);

// Remove habit
export const removeHabit = createAsyncThunk(
  "Habit/removeHabit",
  async ({ id }: { id: string }) => {
    try {
      await axios.delete(`https://habit-tracker-p9t3.onrender.com/api/habits/${id}`);
      return id;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to remove habit");
    }
  }
);

const habitSlice = createSlice({
  name: "Habits",
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      // getHabits
      .addCase(getHabits.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getHabits.fulfilled, (state, action) => {
        state.loading = false;
        state.habits = action.payload;
      })
      .addCase(getHabits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch habits";
      })

      // addHabits
      .addCase(addHabits.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addHabits.fulfilled, (state, action) => {
        state.loading = false;
        state.habits.push(action.payload);
      })
      .addCase(addHabits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to add habit";
      })

      // toggleHabit
      .addCase(toggleHabit.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleHabit.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.habits.findIndex(h => h.id === action.payload.id);
        if (idx > -1) state.habits[idx] = action.payload;
      })
      .addCase(toggleHabit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to toggle habit";
      })

      // resetHabit
      .addCase(resetHabit.fulfilled, (state, action) => {
        const idx = state.habits.findIndex(h => h.id === action.payload.id);
        if (idx > -1) state.habits[idx] = action.payload;
      })

      // removeHabit
      .addCase(removeHabit.fulfilled, (state, action) => {
        state.habits = state.habits.filter(h => h.id !== action.payload);
      });
  }
});

export default habitSlice.reducer;
