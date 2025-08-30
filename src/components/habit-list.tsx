import {useEffect} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../store/store'
import { Box, Button, LinearProgress, Paper, Typography } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import DeleteIcon from '@mui/icons-material/Delete'
import { toggleHabit, removeHabit,getHabits, type Habit, resetHabit } from '../store/habit-slice'

//Now we are going to fetch the current date here and calculate the difference between days
const normalize = (d:Date)=>d.toISOString().split("T")[0];
const daysDiff = (a:String,b:String)=>Math.floor((new Date(b+'T00:00:00Z').getTime() - new Date(a + 'T00:00:00Z').getTime())/86400000)


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

  // const getStreak = (habit:Habit) =>{
  //   let streak = 0;
  //   const current = new Date();
  //   while(true)
  //   {
  //       const currentDate = current.toISOString().split('T')[0];
  //       if(habit.completedDates.includes(currentDate))
  //       {
  //           streak++;
  //           current.setDate(current.getDate() - 1);
  //       } 
  //       else
  //       {break  }
  //   }
  //   return streak;
  // }

  const isCompletedToday = (habit:Habit) => habit.completedDates.includes(today);

  const isBroken = (habit:Habit) => {
    if(habit.completedDates.length === 0)return false;//there is nothing in the array so neither its broken or woeking
    const sorted = [...habit.completedDates].sort();
    const last = sorted[sorted.length - 1];
    return daysDiff(last,today) > 1;
  }

  const getConsecutiveDays = (habit:Habit)=>{
    let streak = 0;
    const set = new Set(habit.completedDates);
    const cursor = new Date(today);
    while(set.has(normalize(cursor)))
    {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }

  const getDisplayStreak = (habit:Habit)=>{
    const days = getConsecutiveDays(habit);
    if(habit.frequency === 'weekly')
    {
      const weeks = Math.floor(days/7);
      return {label:weeks,unit:'Weeks',daysWithinWeek: days%7};
    }
    return{label:days,unit:'Days',daysWithinWeek:0};
  }

  const getProgressValue = (habit:Habit)=>{
    if(isBroken(habit)) return 0;
      if(habit.frequency === 'weekly'){
        const daysWithinWeek = getDisplayStreak(habit).daysWithinWeek;
        return (daysWithinWeek / 7)*100;
      }
      return isCompletedToday(habit) ? 100 : 0;
  }





  return (
    <Box sx={{display:'flex',flexDirection:'column',gap:2,mt:4}}>
      {
        habitList.map((habit)=>{
          const broken = isBroken(habit);
          
          return(
            <Paper key={habit.id} elevation={2} sx={{p:2}}>
              <Box
              sx={{
                display:'flex',
                flexDirection:{xs:'column',sm:'row'},
                alignItems:{xs:'flex-start',sm:'center'},
                justifyContent:'space-between',
                gap:1
              }}
              >
              {/*Habit name and frequency*/}
              <Box>
                <Typography variant="h6">{habit.name}</Typography>
                <Typography variant="body2" color="textSecondary">{habit.frequency}</Typography>
              </Box>
              

              {/*Buttons */}
              <Box sx={{display:'flex',gap:1}}>
                <Button
                variant='outlined'
                color={isCompletedToday(habit)?'success':'primary'}
                startIcon={<CheckCircleIcon/>}
                disabled={broken}
                onClick={()=>dispatch(toggleHabit({id:habit.id,date:today}))}
                >
                  {broken ? 'Streak Broken': isCompletedToday(habit)?'Completed':'Mark Complete'}
                </Button>

                {broken&&(
                  <Button
                  variant='outlined'
                  color="warning"
                  startIcon={<RestartAltIcon/>}
                  onClick={()=>dispatch(resetHabit({id:habit.id}))}
                  >
                  Reset
                  </Button>
                )}
                <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon/>}
                onClick={()=>dispatch(removeHabit({id:habit.id}))}
                >
                 Delete
                </Button>
              </Box>
              </Box>

              <Box sx={{mt:2}}>
                <Typography variant="body2" sx={{color:broken?'error.main':'text.primary'}}>
                  Current Streak
                </Typography>

                <LinearProgress
                variant='determinate'
                value={getProgressValue(habit)}
                sx={{
                  height:8,
                  borderRadius:4,
                  mt:1,
                  backgroundColor:broken ? 'error.lighter':undefined,
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: broken ? 'error.main' : undefined
                  }
                }}
                />
              </Box>
            </Paper>
          )
        })
      }
    </Box>
  )



































































  // return (
  //   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 4 }}>

  //     {habitList.map((habit) => (
  //       <Paper key={habit.id} elevation={2} sx={{ p: 2 }}>
  //         <Box
  //           sx={{
  //             display: 'flex',
  //             flexDirection: { xs: 'column', sm: 'row' },
  //             alignItems: { xs: 'flex-start', sm: 'center' },
  //             justifyContent: 'space-between',
  //             gap: 1
  //           }}
  //         >
  //           {/* Habit name and frequency */}
  //           <Box>
  //             <Typography variant="h6">{habit.name}</Typography>
  //             <Typography variant="body2" color="textSecondary">
  //               {habit.frequency}
  //             </Typography>
  //           </Box>

  //           {/* Buttons */}
  //           <Box sx={{ display: 'flex', gap: 1 }}>
  //             <Button
  //               variant="outlined"
  //               color={
  //                 habit.completedDates.includes(today) ? 'success' : 'primary'
  //               }
  //               startIcon={<CheckCircleIcon />}
  //               onClick={()=>
  //                   dispatch(toggleHabit({id:habit.id,date:today}))
  //               }
  //             >
  //               {habit.completedDates.includes(today)
  //                 ? 'Completed'
  //                 : 'Mark Complete'}
  //             </Button>
  //             <Button
  //               variant="outlined"
  //               color="error"
  //               startIcon={<DeleteIcon />}
  //               onClick={()=>
  //                   dispatch(removeHabit({id:habit.id}))
  //               }
  //             >
  //               Delete
  //             </Button>
  //           </Box>
  //         </Box>

  //         <Box sx={{mt:2}}>
  //              <Typography variant="body2">
  //               Current Streak: {getStreak(habit)} Days
  //              </Typography>
  //              <LinearProgress
  //              variant="determinate"
  //              value={(getStreak(habit) / (habit.frequency === "weekly"?7:1)) * 100}/>
  //         </Box>

  //       </Paper>
  //     ))}
  //   </Box>
  // )
}

export default Habitlist
