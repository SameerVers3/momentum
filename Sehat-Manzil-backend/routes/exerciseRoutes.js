import express from 'express';
import {
  createExercise,
  getExercise,
  updateExercise,
  deleteExercise,
  getAllExercises,
} from '../controllers/exercise.js';
import { 
  isAuthenticated,
  isAdminAuthenticated
 } from '../middleware/auth.js';

const router = express.Router();

// get can be done by all users but post, put, delete can only be done by admin

// Create a new exercise
router.post('/', isAuthenticated,isAdminAuthenticated, createExercise);

// Update an exercise by ID
router.put('/:exerciseId', isAdminAuthenticated, updateExercise);

// Delete an exercise by ID
router.delete('/:exerciseId', isAdminAuthenticated, deleteExercise);


// Get all exercises for a specific workout or general list
router.get('/', isAuthenticated, getAllExercises);

// Get a single exercise by ID
router.get('/:exerciseId', isAuthenticated, getExercise);

export default router;
