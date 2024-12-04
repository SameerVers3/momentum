import express from 'express';
import {
  createMeal,
  getMeals,
  updateMeal,
  deleteMeal
} from '../controllers/mealController.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// Route to create a new meal
router.post('/', isAuthenticated, createMeal);

// Route to fetch all meals for the user
router.get('/', isAuthenticated, getMeals);

// Route to update a specific meal
router.put('/:mealId', isAuthenticated, updateMeal);

// Route to delete a specific meal
router.delete('/:mealId', isAuthenticated, deleteMeal);

export default router;
