import express from 'express';
import {
  createWorkoutPlan,
  assignWorkoutPlanToUser,
  logWorkoutForPlan
} from "../controllers/workoutPlan.js"
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// Route to create a new workout
router.post('/', isAuthenticated, createWorkoutPlan);

// Route to get all workouts for the user
router.post('/assign', isAuthenticated, assignWorkoutPlanToUser);

// Route to update a specific workout
router.post('/', isAuthenticated, logWorkoutForPlan);

export default router;
