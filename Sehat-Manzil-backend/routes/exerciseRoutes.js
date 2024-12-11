import express from 'express';
import {
  createExercise,
  getExercisesByWorkout,
  updateExercise,
  deleteExercise,
  getExerciseById,
  getAllExercises
} from '../controllers/exercise.js';
import { isAuthenticated } from '../middleware/auth.js';
import { logExercise } from '../controllers/workout.js';

const router = express.Router();

// Exercise routes
router.post('/', createExercise);
router.get('/', getAllExercises);
router.get('/:exerciseId', getExerciseById);
router.put('/:exerciseId', updateExercise);
router.delete('/:exerciseId', deleteExercise);
// Route to log an exercise
router.post('/logExercise/:exerciseId', isAuthenticated, logExercise);

router.get('/workout/:workoutId', getExercisesByWorkout);

export default router;
