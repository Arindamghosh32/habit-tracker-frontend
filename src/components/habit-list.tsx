import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store/store';
import { Box, Button, LinearProgress, Paper, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import { toggleHabit, removeHabit, getHabits, resetHabit, type Habit } from '../store/habit-slice';

const HabitList = () => {
  const habitList = useSelector((state: RootState) => state.habits.habits);
  const dispatch = useDispatch<AppDispatch>();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    dispatch(getHabits());
  }, [dispatch]);

  const getNextAvailable = (habit: Habit) => {
    const today = new Date();
    const completedToday = habit.completedDates.some(d => new Date(d).toDateString() === today.toDateString());
    if (habit.frequency === 'daily') return completedToday ? new Date(today.getTime() + 86400000) : today;
    if (habit.frequency === 'weekly') return completedToday ? new Date(today.getTime() + 86400000) : today;
    return today;
  }

  const getRemainingTime = (habit: Habit) => {
    const next = getNextAvailable(habit);
    const diff = Math.floor((next.getTime() - now.getTime()) / 1000);
    if (diff <= 0) return 'Ready!';
    const h = Math.floor(diff / 3600), m = Math.floor((diff % 3600)/60), s = diff % 60;
    return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
  }

  const isBroken = (habit: Habit) => {
    if (!habit.completedDates.length) return false;
    const last = new Date(habit.completedDates.slice(-1)[0]);
    if (habit.frequency === 'daily') return (now.getTime() - last.getTime()) / 86400000 > 1;
    const created = new Date(habit.createdAt);
    const weekNum = Math.floor((now.getTime() - created.getTime()) / (7*86400000));
    const completedWeeks = new Set(habit.completedDates.map(d => Math.floor((new Date(d).getTime() - created.getTime())/(7*86400000))));
    return habit.completedDates.length > 0 && !completedWeeks.has(weekNum);
  }

  const getStreak = (habit: Habit) => {
    if (!habit.completedDates.length) return 0;
    if (habit.frequency === 'daily') {
      let streak = 0, sorted = [...habit.completedDates].sort();
      let cursor = new Date(sorted[0]);
      for (let d of sorted) {
        const cur = new Date(d);
        if ((cur.getTime() - cursor.getTime()) <= 48*60*60*1000) { streak++; cursor = cur; } else break;
      }
      return streak;
    }
    const created = new Date(habit.createdAt);
    const weeksCompleted = new Set(habit.completedDates.map(d => Math.floor((new Date(d).getTime()-created.getTime())/(7*86400000))));
    const weeksPassed = Math.floor((now.getTime()-created.getTime())/(7*86400000));
    let streak = 0;
    for (let i=weeksPassed; i>=0; i--) {
      if (weeksCompleted.has(i)) streak++; else break;
    }
    return streak;
  }

  return (
    <Box sx={{ display:'flex', flexDirection:'column', gap:2, mt:4 }}>
      {habitList.map(habit => {
        const broken = isBroken(habit);
        const remaining = getRemainingTime(habit);
        const streak = getStreak(habit);

        return (
          <Paper key={habit.id} elevation={2} sx={{p:2}}>
            <Box sx={{display:'flex', flexDirection:{xs:'column',sm:'row'}, alignItems:{xs:'flex-start',sm:'center'}, justifyContent:'space-between', gap:1}}>
              <Box>
                <Typography variant="h6">{habit.name}</Typography>
                <Typography variant="body2" color="textSecondary">{habit.frequency}</Typography>
                <Typography variant="body2" color="primary">Next in: {remaining}</Typography>
              </Box>
              <Box sx={{display:'flex', gap:1}}>
                <Button
                  variant="outlined"
                  color={remaining==='Ready!'?'success':'primary'}
                  startIcon={<CheckCircleIcon />}
                  disabled={remaining!=='Ready!' || broken}
                  onClick={()=>dispatch(toggleHabit({id:habit.id,date:new Date().toISOString()}))}
                >
                  {broken?'Streak Broken':remaining==='Ready!'?'Mark Complete':'Wait'}
                </Button>

                {broken && (
                  <Button
                    variant="outlined"
                    color="warning"
                    startIcon={<RestartAltIcon />}
                    onClick={()=>dispatch(resetHabit({id:habit.id})).then(()=>dispatch(getHabits()))}
                  >Reset</Button>
                )}

                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={()=>dispatch(removeHabit({id:habit.id})).then(()=>dispatch(getHabits()))}
                >Delete</Button>
              </Box>
            </Box>

            <Box sx={{mt:2}}>
              <Typography variant="body2" sx={{color:broken?'error.main':'text.primary'}}>
                Current Streak: {streak} {habit.frequency==='daily'?'Days':'Weeks'}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={habit.frequency==='daily'?streak*100:Math.min((streak/7)*100,100)}
                sx={{
                  height:8,
                  borderRadius:4,
                  mt:1,
                  backgroundColor:broken?'error.lighter':undefined,
                  '& .MuiLinearProgress-bar': { backgroundColor:broken?'error.main':undefined }
                }}
              />
            </Box>
          </Paper>
        )
      })}
    </Box>
  )
}

export default HabitList;
