import './App.css';
import { Container, Typography } from '@mui/material';
import HabitForm from "./components/store-form";
import Habitlist from './components/habit-list';

function App() {
  return (
    <Container maxWidth="md">
      <Typography component='h1' variant='h2' align='center'>
        Habit Tracker
      </Typography>
      <br /><br />
      <HabitForm />
      <Habitlist/>
    </Container>
  );
}

export default App;
