import express from 'express';
import {
  createWorkout,
  getWorkouts,
  getWorkoutById,
  updateWorkout,
  deleteWorkout,
  userAlreadyHaveWorkout,
  addUserToWorkoutPlan,
  getWorkoutPlansByUser,
  logWorkout,
  logExercise,
  getWorkoutLogs
} from '../controllers/workout.js';
import { 
  isAuthenticated,
  isAdminAuthenticated
} from '../middleware/auth.js';

const router = express.Router();

// Route to create a new workout
router.post('/', isAdminAuthenticated, createWorkout);

router.get('/logExercise', isAuthenticated, getWorkoutLogs);

router.get('/getWorkoutPlansByUser', isAuthenticated, getWorkoutPlansByUser);

// Route to update a specific workout
router.put('/:workoutId', isAdminAuthenticated, updateWorkout);

// Route to delete a specific workout
router.delete('/:workoutId', isAdminAuthenticated, deleteWorkout);

// Route to get all workouts for the user
router.get('/', isAuthenticated, getWorkouts);

// Route to get a workout by id
router.get('/:workoutId', isAuthenticated, getWorkoutById);


router.get('/userAlreadyHaveWorkout/:workoutId', isAuthenticated, userAlreadyHaveWorkout);

// Route to add a user to a workout plan
router.post('/addUserToWorkoutPlan/:workoutId', isAuthenticated, addUserToWorkoutPlan);


// Route to log a workout
router.post('/logWorkout/:workoutId', isAuthenticated, logWorkout);


export default router;
