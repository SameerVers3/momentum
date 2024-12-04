import express from 'express';
import {
  createWorkout,
  getWorkouts,
  updateWorkout,
  deleteWorkout
} from '../controllers/workoutController.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// Route to create a new workout
router.post('/', isAuthenticated, createWorkout);

// Route to get all workouts for the user
router.get('/', isAuthenticated, getWorkouts);

// Route to update a specific workout
router.put('/:workoutId', isAuthenticated, updateWorkout);

// Route to delete a specific workout
router.delete('/:workoutId', isAuthenticated, deleteWorkout);

export default router;
