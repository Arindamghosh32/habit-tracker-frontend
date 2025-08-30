// import { Remove } from "@mui/icons-material";
// import type { PayloadAction } from "@reduxjs/toolkit";
// import {createSlice} from "@reduxjs/toolkit";

// //Now create interface which will store the different propertied

// export interface Habit
// {
//     id:string;
//     name:String;
//     frequency:"daily"|"weekly";
//     completedDates:string[];
//     createdAt:string;
// }

// interface habitstate
// {
//    habits:Habit[];
// }

// const initialState: habitstate =
// {
//   habits: []
// }

// const habitSlice = createSlice(
//     {
//         name:"Habit",
//         initialState,
//         reducers:{
//             addHabit:(state,action:PayloadAction<{name:String,frequency:"daily"|"weekly"}>)=>{
//                 const newHabit:Habit={
//                     id:Date.now().toString(),
//                     name:action.payload.name,
//                     frequency:action.payload.frequency,
//                     completedDates:[],
//                     createdAt: new Date().toISOString(),
//                 };
//                 state.habits.push(newHabit);
//             },

//             //now to toggle habit i need to check if the dates exist
//             addToggle:(state,action:PayloadAction<{id:string,date:string}>)=>{
//                 const habit = state.habits.find((h)=>h.id === action.payload.id);
//                 if(habit)
//                 {
//                     const index = habit.completedDates.indexOf(action.payload.date);
//                     if(index > -1)
//                     {
//                         habit.completedDates.splice(index,1);
//                     }
//                     else
//                     {
//                         habit.completedDates.push(action.payload.date);
//                     }
//                 }
//             },

//             //now in order to remove the habit i need to remove it
//             removeToggle:(state,action:PayloadAction<{id:string}>)=>{
//                 const habit = state.habits.findIndex((h)=>h.id === action.payload.id);
//                 if(habit != -1)
//                 {
//                     state.habits.splice(habit,1);
//                 }
//             }
            
            
//         }
//     }
// );
// export const {addHabit,addToggle,removeToggle} = habitSlice.actions;
// export default habitSlice.reducer;


//Now this part is updated as we are going to connect the backend

import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
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


// Now in order to fetch the updated Habits
export const getHabits = createAsyncThunk(
    "Habit/getHabit",
    async()=>{
        const rsa = axios.get("https://habit-tracker-p9t3.onrender.com/api/habits/get");
        return (await rsa).data;
    }
)

// Corrected addHabits function using Axios
export const addHabits = createAsyncThunk(
    "Habit/addHabit",
    async(habit:{name:string,frequency:"daily"|"weekly"})=>{
        const newHabit = {
            ...habit,
            id:Date.now().toString(),
            completedDates:[],
            createdAt: new Date().toISOString()
        }

        // Using axios.post instead of fetch.
        // Axios automatically sets the Content-Type header and handles JSON serialization.
        const res = await axios.post("https://habit-tracker-p9t3.onrender.com/api/habits", newHabit);

        return res.data as Habit;
    }
)
//Here i am toggling the habit
export const toggleHabit = createAsyncThunk(
  "Habit/toggleHabit",
  async ({ id, date }: { id: string; date: string }) => {
    const res = await fetch(`https://habit-tracker-p9t3.onrender.com/api/habits/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date })
    });
    const data = await res.json().catch(()=>({}));
    if(!res.ok)
    {
        throw new Error(data?.message || "Failed to toggle habit");
    }
    return data as Habit;
  }
);

//Here i am reseting the habit
export const resetHabit = createAsyncThunk(
        "Habit/resetHabit",
        async({id}:{id:String})=>{
            const res = await fetch(`https://habit-tracker-p9t3.onrender.com/api/habits/${id}/reset`,{
                method:"POST"
            });
            const data = await res.json().catch(()=>({}));
            if(!res.ok)
            {
                throw new Error(data?.message || "Failed to reset Habit");
            }
            return data as Habit;
        }
);

export const removeHabit = createAsyncThunk(
  "Habit/removeHabit",
  async ({ id }: { id: string }) => {
    await fetch(`https://habit-tracker-p9t3.onrender.com/api/habits/${id}`, { method: "DELETE" });
    return id;
  }
);

// Slice
const habitSlice = createSlice({
  name: "Habits",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // getHabits
    builder
      .addCase(getHabits.pending, (state) => {
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

      // addHabit
      .addCase(addHabits.pending, (state) => {
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
      .addCase(toggleHabit.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleHabit.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.habits.findIndex(
          (h) => h.id === action.payload.id
        );
        if (index > -1) {
          state.habits[index] = action.payload;
        }
      })
      .addCase(toggleHabit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to toggle habit";
      })

      // removeHabit
      .addCase(removeHabit.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeHabit.fulfilled, (state, action) => {
        state.loading = false;
        state.habits = state.habits.filter((h) => h.id !== action.payload);
      })
      .addCase(removeHabit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to remove habit";
      })


      //resetHabit 
      .addCase(resetHabit.fulfilled,(state,action)=>{
        const idx = state.habits.findIndex((h) => h.id === action.payload.id);
        if(idx > -1) state.habits[idx] = action.payload;
      })
  }
});

export default habitSlice.reducer;
