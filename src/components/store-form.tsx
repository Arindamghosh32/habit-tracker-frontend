import React,{useState} from 'react';
import{Box,Button,FormControl,InputLabel,MenuItem,Select,TextField} from '@mui/material';
import { addHabits } from '../store/habit-slice';

import { useDispatch} from 'react-redux';
import type { AppDispatch} from '../store/store';

const HabitForm:React.FC =()=>{
const[name,setName] = useState<string>("");
const [freq, setFreq] = useState<"daily" | "weekly">("daily");
const dispatch = useDispatch<AppDispatch>()

const handlSubmit = (e:React.FormEvent) =>
{
    e.preventDefault();
    if(name.trim())
    {
        dispatch(addHabits({
            name,
            frequency:freq,
        }));
    }
}



return(
    <form onSubmit={handlSubmit}>
   <Box
   sx={{
    display:"flex",
    flexDirection:"column",
    gap:2
   }}
   >
   <TextField
   label="Habit Name"
   value={name}
   onChange={(e)=>setName(e.target.value)}
   placeholder='Enter Habit Name'
   fullWidth></TextField>

   <FormControl fullWidth>
    <InputLabel>Frequency</InputLabel>
    <br/>
    <Select
    value={freq}
    onChange={(e)=>setFreq(e.target.value as "daily" | "weekly")}
    >
        <MenuItem value="daily">Daily</MenuItem>
        <MenuItem value="weekly">Weekly</MenuItem>
    </Select>
   </FormControl>
   <Button type="submit" variant='contained'>Add Habit</Button>
   </Box>
   </form>
)

};

export default HabitForm;