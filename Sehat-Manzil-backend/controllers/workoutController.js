import { z } from 'zod';
import connectDB from '../config/db.js';
import pkg from 'pg';

const { Pool } = pkg;
const pool = await connectDB();

// Validation schema for workout
const workoutSchema = z.object({
  name: z.string().min(3, 'Workout name must be at least 3 characters long'),
  type: z.enum(['Strength', 'Cardio', 'Flexibility', 'Balance']),
  duration: z.number().positive('Duration must be a positive number'), // in minutes
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

// Utility function to parse and validate data
const validateWorkout = (data) => workoutSchema.parse(data);

// Create a new workout
export const createWorkout = async (req, res) => {
  const { userId } = req.user;

  try {
    const parsedData = validateWorkout(req.body);

    const client = await pool.connect();
    try {
      const { rows } = await client.query(
        `
        INSERT INTO workouts (user_id, name, type, duration, date)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
        `,
        [userId, parsedData.name, parsedData.type, parsedData.duration, parsedData.date]
      );

      res.status(201).json({ 
        success: true, 
        message: 'Workout created successfully', 
        workout: rows[0] 
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating workout:', error);
    res.status(400).json({ 
      success: false, 
      message: 'Failed to create workout', 
      error: error.message 
    });
  }
};

// Get all workouts for a user
export const getWorkouts = async (req, res) => {
  const { userId } = req.user;

  try {
    const client = await pool.connect();
    try {
      const { rows } = await client.query(
        `SELECT * FROM workouts WHERE user_id = $1 ORDER BY date DESC;`,
        [userId]
      );

      res.status(200).json({ 
        success: true, 
        message: 'Workouts fetched successfully', 
        workouts: rows 
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching workouts:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch workouts', 
      error: error.message 
    });
  }
};

// Update a workout
export const updateWorkout = async (req, res) => {
  const { userId } = req.user;
  const { workoutId } = req.params;

  try {
    const parsedData = validateWorkout(req.body);

    const client = await pool.connect();
    try {
      const { rows } = await client.query(
        `
        UPDATE workouts
        SET name = $1, type = $2, duration = $3, date = $4
        WHERE user_id = $5 AND id = $6
        RETURNING *;
        `,
        [parsedData.name, parsedData.type, parsedData.duration, parsedData.date, userId, workoutId]
      );

      if (rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Workout not found' 
        });
      }

      res.status(200).json({ 
        success: true, 
        message: 'Workout updated successfully', 
        workout: rows[0] 
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating workout:', error);
    res.status(400).json({ 
      success: false, 
      message: 'Failed to update workout', 
      error: error.message 
    });
  }
};

// Delete a workout
export const deleteWorkout = async (req, res) => {
  const { userId } = req.user;
  const { workoutId } = req.params;

  try {
    const client = await pool.connect();
    try {
      const { rowCount } = await client.query(
        `
        DELETE FROM workouts
        WHERE user_id = $1 AND id = $2;
        `,
        [userId, workoutId]
      );

      if (rowCount === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Workout not found' 
        });
      }

      res.status(200).json({ 
        success: true, 
        message: 'Workout deleted successfully' 
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error deleting workout:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete workout', 
      error: error.message 
    });
  }
};
