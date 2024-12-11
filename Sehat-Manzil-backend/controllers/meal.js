import { z } from 'zod';
import connectDB from '../config/db.js';
import pkg from 'pg';

const { Pool } = pkg;
const pool = await connectDB();

// Validation schema for meal data
const mealSchema = z.object({
  name: z.string().min(1, 'Meal name is required'),
  calories: z.number().nonnegative('Calories must be a non-negative number'),
  protein: z.number().nonnegative('Protein must be a non-negative number').optional(),
  carbs: z.number().nonnegative('Carbs must be a non-negative number').optional(),
  fat: z.number().nonnegative('Fat must be a non-negative number').optional(),
  mealType: z.enum(['Breakfast', 'Lunch', 'Dinner', 'Snack']),
});

// Create a new meal
export const createMeal = async (req, res) => {
  console.log('createMeal called with body:', req.body);
  try {
    const { userId } = req.user; // Assuming user is authenticated
    const parsedData = mealSchema.parse(req.body);
    console.log('Parsed meal data:', parsedData);

    const client = await pool.connect();
    try {
      const { rows } = await client.query(`
        INSERT INTO meals (user_id, name, calories, protein, carbs, fat, meal_type)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
      `, [
        userId,
        parsedData.name,
        parsedData.calories,
        parsedData.protein || 0,
        parsedData.carbs || 0,
        parsedData.fat || 0,
        parsedData.mealType,
      ]);

      console.log('Meal created:', rows[0]);
      res.status(201).json({ message: 'Meal created successfully', meal: rows[0] });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating meal:', error);
    res.status(500).json({ error: 'Failed to create meal' });
  }
};

// Get all meals for a user
export const getMeals = async (req, res) => {
  console.log('getMeals called');
  try {
    const { userId } = req.user;
    const client = await pool.connect();
    try {
      const { rows } = await client.query(`
        SELECT * FROM meals WHERE user_id = $1;
      `, [userId]);

      console.log('Meals fetched:', rows);
      res.status(200).json({ meals: rows });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching meals:', error);
    res.status(500).json({ error: 'Failed to fetch meals' });
  }
};

// Update a meal
export const updateMeal = async (req, res) => {
  console.log('updateMeal called with params:', req.params, 'and body:', req.body);
  try {
    const { mealId } = req.params;
    const parsedData = mealSchema.parse(req.body);
    console.log('Parsed meal data:', parsedData);

    const client = await pool.connect();
    try {
      const { rows } = await client.query(`
        UPDATE meals
        SET name = $1, calories = $2, protein = $3, carbs = $4, fat = $5, meal_type = $6
        WHERE meal_id = $7 AND user_id = $8
        RETURNING *;
      `, [
        parsedData.name,
        parsedData.calories,
        parsedData.protein || 0,
        parsedData.carbs || 0,
        parsedData.fat || 0,
        parsedData.mealType,
        mealId,
        req.user.userId, // Ensure only the owner can update
      ]);

      if (rows.length === 0) {
        console.log('Meal not found or unauthorized');
        return res.status(404).json({ error: 'Meal not found or unauthorized' });
      }

      console.log('Meal updated:', rows[0]);
      res.status(200).json({ message: 'Meal updated successfully', meal: rows[0] });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating meal:', error);
    res.status(500).json({ error: 'Failed to update meal' });
  }
};

// Delete a meal
export const deleteMeal = async (req, res) => {
  console.log('deleteMeal called with params:', req.params);
  try {
    const { mealId } = req.params;

    const client = await pool.connect();
    try {
      const { rowCount } = await client.query(`
        DELETE FROM meals WHERE meal_id = $1 AND user_id = $2;
      `, [mealId, req.user.userId]);

      if (rowCount === 0) {
        console.log('Meal not found or unauthorized');
        return res.status(404).json({ error: 'Meal not found or unauthorized' });
      }

      console.log('Meal deleted successfully');
      res.status(200).json({ message: 'Meal deleted successfully' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error deleting meal:', error);
    res.status(500).json({ error: 'Failed to delete meal' });
  }
};
