import {useEffect} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../store/store'
import { Box, Button, LinearProgress, Paper, Typography } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import DeleteIcon from '@mui/icons-material/Delete'
import { toggleHabit, removeHabit,getHabits, type Habit } from '../store/habit-slice'

const Habitlist = () => {
  const habitList = useSelector((state: RootState) => state.habits.habits)
  const today = new Date().toISOString().split('T')[0]
  const dispatch = useDispatch<AppDispatch>();

  //  Fetch habits when the component mounts
  useEffect(() => {
    dispatch(getHabits())
  }, [dispatch])

  //So basically we are creating function to calculate streak so what we gonna do is check if todays date is in the string and
  //we will go backward to check previous dates till they exist and increase the counter

  const getStreak = (habit:Habit) =>{
    let streak = 0;
    const current = new Date();
    while(true)
    {
        const currentDate = current.toISOString().split('T')[0];
        if(habit.completedDates.includes(currentDate))
        {
            streak++;
            current.setDate(current.getDate() - 1);
        } 
        else
        {break  }
    }
    return streak;
  }



  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 4 }}>
      {habitList.map((habit) => (
        <Paper key={habit.id} elevation={2} sx={{ p: 2 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
              gap: 1
            }}
          >
            {/* Habit name and frequency */}
            <Box>
              <Typography variant="h6">{habit.name}</Typography>
              <Typography variant="body2" color="textSecondary">
                {habit.frequency}
              </Typography>
            </Box>

            {/* Buttons */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                color={
                  habit.completedDates.includes(today) ? 'success' : 'primary'
                }
                startIcon={<CheckCircleIcon />}
                onClick={()=>
                    dispatch(toggleHabit({id:habit.id,date:today}))
                }
              >
                {habit.completedDates.includes(today)
                  ? 'Completed'
                  : 'Mark Complete'}
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={()=>
                    dispatch(removeHabit({id:habit.id}))
                }
              >
                Delete
              </Button>
            </Box>
          </Box>

          <Box sx={{mt:2}}>
               <Typography variant="body2">
                Current Streak: {getStreak(habit)} Days
               </Typography>
               <LinearProgress
               variant="determinate"
               value={(getStreak(habit) / (habit.frequency === "weekly"?7:1)) * 100}/>
          </Box>

        </Paper>
      ))}
    </Box>
  )
}

export default Habitlist
