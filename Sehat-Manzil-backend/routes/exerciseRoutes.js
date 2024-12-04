import express from 'express';
import {
  createExercise,
  getExercise,
  updateExercise,
  deleteExercise,
  getAllExercises,
} from '../controllers/exerciseController.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// Create a new exercise
router.post('/', isAuthenticated, createExercise);

// Get a single exercise by ID
router.get('/:exerciseId', isAuthenticated, getExercise);

// Update an exercise by ID
router.put('/:exerciseId', isAuthenticated, updateExercise);

// Delete an exercise by ID
router.delete('/:exerciseId', isAuthenticated, deleteExercise);

// Get all exercises for a specific workout or general list
router.get('/', isAuthenticated, getAllExercises);

export default router;
