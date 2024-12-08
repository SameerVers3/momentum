import express from 'express';
import {
  createWorkout,
  getWorkouts,
  getWorkoutById,
  updateWorkout,
  deleteWorkout
} from '../controllers/workout.js';
import { 
  isAuthenticated,
  isAdminAuthenticated
} from '../middleware/auth.js';

const router = express.Router();

// Route to create a new workout
router.post('/', isAdminAuthenticated, createWorkout);

// Route to update a specific workout
router.put('/:workoutId', isAdminAuthenticated, updateWorkout);

// Route to delete a specific workout
router.delete('/:workoutId', isAdminAuthenticated, deleteWorkout);

// Route to get all workouts for the user
router.get('/', isAuthenticated, getWorkouts);

// Route to get a workout by id
router.get('/:workoutId', isAuthenticated, getWorkoutById);

export default router;
