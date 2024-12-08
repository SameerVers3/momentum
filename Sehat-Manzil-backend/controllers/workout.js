import { z } from 'zod';
import connectDB from '../config/db.js';
import pkg from 'pg';

const { Pool } = pkg;
const pool = await connectDB();

// CREATE TABLE workouts (
//   workout_id SERIAL PRIMARY KEY,
//   name VARCHAR(255) NOT NULL,
//   category VARCHAR(100),
//   duration INT NOT NULL, -- in minutes
//   difficulty VARCHAR(50),
//   calories_burned NUMERIC(6,2) NOT NULL,
//   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );

// Validation schema for workout
const workoutSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().optional(),
  duration: z.number().positive('Duration must be a positive number'), // in minutes
  difficulty: z.string().optional(),
  calories_burned: z.number().positive('Calories burned must be a positive number'),
});

// Utility function to parse and validate data
const validateWorkout = (data) => workoutSchema.parse(data);

// Create a new workout
export const createWorkout = async (req, res) => {
  try {
    const parsedData = validateWorkout(req.body);

    const client = await pool.connect();

    try {
      const { rows } = await client.query(
        `
        INSERT INTO workouts (name, category, duration, difficulty, calories_burned)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
        `,
        [
          parsedData.name,
          parsedData.category,
          parsedData.duration,
          parsedData.difficulty,
          parsedData.calories_burned
        ]
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

export const getWorkouts = async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      const { rows } = await client.query(
        `SELECT * FROM workouts ORDER BY created_at DESC;`
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

export const updateWorkout = async (req, res) => {
  const { workoutId } = req.params;

  try {
    const parsedData = validateWorkout(req.body);

    const client = await pool.connect();
    try {
      const { rows } = await client.query(
        `
        UPDATE workouts
        SET name = $1, category = $2, duration = $3, difficulty = $4, calories_burned = $5
        WHERE workout_id = $6
        RETURNING *;
        `,
        [
          parsedData.name,
          parsedData.category,
          parsedData.duration,
          parsedData.difficulty,
          parsedData.calories_burned,
          workoutId
        ]
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
  const { workoutId } = req.params;

  try {
    const client = await pool.connect();
    try {
      const { rowCount } = await client.query(
        `
        DELETE FROM workouts
        WHERE workout_id = $1;
        `,
        [workoutId]
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

// get a workout by id
export const getWorkoutById = async (req, res) => {
  const { workoutId } = req.params;
  console.log(workoutId);

  try {
    const client = await pool.connect();
    try {
      const { rows } = await client.query(
        `SELECT * FROM workouts WHERE workout_id = $1;`,
        [workoutId]
      );

      res.status(200).json({ 
        success: true, 
        message: 'Workout fetched successfully', 
        workout: rows[0] 
      });

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching workout:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch workout', 
      error: error.message 
    });
  }
};
