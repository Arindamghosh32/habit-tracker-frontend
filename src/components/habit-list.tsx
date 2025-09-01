import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store/store';
import { Box, Button, LinearProgress, Paper, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  toggleHabit,
  removeHabit,
  getHabits,
  resetHabit,
  type Habit,
} from '../store/habit-slice';

const HabitList = () => {
  const habitList = useSelector((state: RootState) => state.habits.habits);
  const dispatch = useDispatch<AppDispatch>();
  const [now, setNow] = useState(new Date());
  const [localCompleted, setLocalCompleted] = useState<{ [id: string]: string[] }>({});

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    dispatch(getHabits());
  }, [dispatch]);

  const fullPeriodMs = (habit: Habit) =>
    habit.frequency === 'daily' ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;

  const getNextAvailable = (habit: Habit) => {
    const period = fullPeriodMs(habit);
    const createdTime = new Date(habit.createdAt).getTime();
    const elapsed = now.getTime() - createdTime;
    const cyclesPassed = Math.floor(elapsed / period);
    return new Date(createdTime + (cyclesPassed + 1) * period);
  };

  const getRemainingTime = (habit: Habit) => {
    const next = getNextAvailable(habit);
    const diffMs = next.getTime() - now.getTime();

    if (diffMs <= 0) return 'Ready!';

    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (habit.frequency === 'weekly') {
      return `${days}d ${hours.toString().padStart(2, '0')}h ${minutes
        .toString()
        .padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
    } else {
      const totalHours = days * 24 + hours;
      return `${totalHours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  };

  const canMarkComplete = (habit: Habit) => {
    const period = fullPeriodMs(habit);
    const createdTime = new Date(habit.createdAt).getTime();
    const elapsed = now.getTime() - createdTime;
    const cyclesPassed = Math.floor(elapsed / period);

    const intervalStart = createdTime + cyclesPassed * period;
    const intervalEnd = intervalStart + period;

    const completedDates = [
      ...(habit.completedDates || []),
      ...(localCompleted[habit.id] || []),
    ];

    const alreadyMarkedThisInterval = completedDates.some((d) => {
      const t = new Date(d).getTime();
      return t >= intervalStart && t < intervalEnd;
    });

    return !alreadyMarkedThisInterval && now.getTime() >= intervalStart && now.getTime() < intervalEnd;
  };

  const isBroken = (habit: Habit) => {
    if (!habit.completedDates.length) return false;
    const last = new Date(habit.completedDates[habit.completedDates.length - 1]);
    const diff = now.getTime() - last.getTime();
    if (habit.frequency === 'daily') return diff > 48 * 60 * 60 * 1000;
    if (habit.frequency === 'weekly') return diff > 14 * 24 * 60 * 60 * 1000;
    return false;
  };

const getStreak = (habit: Habit) => {
  const allDates = [...(habit.completedDates || []), ...(localCompleted[habit.id] || [])];
  if (!allDates.length) return 0;

  // Sort latest first
  const sorted = allDates
    .map(d => new Date(d))
    .sort((a, b) => b.getTime() - a.getTime());

  let streak = 0;
  let cursor = sorted[0];

  streak = 1; // latest completion counts

  for (let i = 1; i < sorted.length; i++) {
    const cur = sorted[i];
    const diffDays = (cursor.getTime() - cur.getTime()) / (24 * 60 * 60 * 1000);

    if ((habit.frequency === 'daily' && diffDays === 1) || 
        (habit.frequency === 'weekly' && diffDays === 7)) {
      streak++;
      cursor = cur;
    } else break; // any gap breaks the streak
  }

  return streak;
};



  const handleMarkComplete = (habit: Habit) => {
    const dateISO = new Date().toISOString();

    // Optimistic UI update
    setLocalCompleted((prev) => ({
      ...prev,
      [habit.id]: [...(prev[habit.id] || []), dateISO],
    }));

    dispatch(toggleHabit({ id: habit.id, date: dateISO })).catch((err) => {
      console.error('Failed to mark habit complete:', err);
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 4 }}>
      {habitList.map((habit) => {
        const broken = isBroken(habit);
        const remaining = getRemainingTime(habit);
        const streak = getStreak(habit);
        const ready = canMarkComplete(habit);

        return (
          <Paper key={habit.id} elevation={2} sx={{ p: 2 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                justifyContent: 'space-between',
                gap: 1,
              }}
            >
              <Box>
                <Typography variant="h6">{habit.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {habit.frequency}
                </Typography>
                <Typography variant="body2" color="primary">
                  Next in: {remaining}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  color={ready ? 'success' : 'primary'}
                  startIcon={<CheckCircleIcon />}
                  disabled={!ready || broken}
                  onClick={() => handleMarkComplete(habit)}
                >
                  {broken ? 'Streak Broken' : ready ? 'Mark Complete' : 'Wait'}
                </Button>

                {broken && (
                  <Button
                    variant="outlined"
                    color="warning"
                    startIcon={<RestartAltIcon />}
                    onClick={() =>
                      dispatch(resetHabit({ id: habit.id })).then(() => dispatch(getHabits()))
                    }
                  >
                    Reset
                  </Button>
                )}

                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() =>
                    dispatch(removeHabit({ id: habit.id })).then(() => dispatch(getHabits()))
                  }
                >
                  Delete
                </Button>
              </Box>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ color: broken ? 'error.main' : 'text.primary' }}>
                Current Streak: {streak} {habit.frequency === 'daily' ? 'Days' : 'WeekDay'}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={
                  habit.frequency === 'daily'
                    ? Math.min(streak * 100, 100)
                    : Math.min((streak / 7) * 100, 100)
                }
                sx={{
                  height: 8,
                  borderRadius: 4,
                  mt: 1,
                  backgroundColor: broken ? 'error.lighter' : undefined,
                  '& .MuiLinearProgress-bar': { backgroundColor: broken ? 'error.main' : undefined },
                }}
              />
            </Box>
          </Paper>
        );
      })}
    </Box>
  );
};

export default HabitList;
