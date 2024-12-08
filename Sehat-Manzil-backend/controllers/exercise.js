import { z } from 'zod';
import connectDB from '../config/db.js';
import pkg from 'pg';

const { Pool } = pkg;
const pool = await connectDB();

// Validation schema for exercise
const exerciseSchema = z.object({
  workout_id: z.number().positive('Workout ID is required'),
  name: z.string().min(1, 'Name is required'),
  muscle_group: z.string().optional(),
  sets: z.number().positive('Sets must be a positive number'),
  reps: z.number().positive('Reps must be a positive number'),
});

// Utility function to parse and validate data
const validateExercise = (data) => exerciseSchema.parse(data);

// Create a new exercise
export const createExercise = async (req, res) => {
  try {
    const parsedData = validateExercise(req.body);

    const client = await pool.connect();
    try {
      const { rows } = await client.query(
        `
        INSERT INTO exercises (workout_id, name, muscle_group, sets, reps)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
        `,
        [
          parsedData.workout_id,
          parsedData.name,
          parsedData.muscle_group,
          parsedData.sets,
          parsedData.reps
        ]
      );

      res.status(201).json({
        success: true,
        message: 'Exercise created successfully',
        exercise: rows[0]
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating exercise:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create exercise',
      error: error.message
    });
  }
};

// Get all exercises for a workout
export const getExercisesByWorkout = async (req, res) => {
  const { workoutId } = req.params;

  try {
    const client = await pool.connect();
    try {
      const { rows } = await client.query(
        `SELECT * FROM exercises WHERE workout_id = $1 ORDER BY created_at;`,
        [workoutId]
      );

      res.status(200).json({
        success: true,
        message: 'Exercises fetched successfully',
        exercises: rows
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exercises',
      error: error.message
    });
  }
};

// Update an exercise
export const updateExercise = async (req, res) => {
  const { exerciseId } = req.params;

  try {
    const parsedData = validateExercise(req.body);

    const client = await pool.connect();
    try {
      const { rows } = await client.query(
        `
        UPDATE exercises
        SET workout_id = $1, name = $2, muscle_group = $3, sets = $4, reps = $5
        WHERE exercise_id = $6
        RETURNING *;
        `,
        [
          parsedData.workout_id,
          parsedData.name,
          parsedData.muscle_group,
          parsedData.sets,
          parsedData.reps,
          exerciseId
        ]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Exercise not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Exercise updated successfully',
        exercise: rows[0]
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating exercise:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update exercise',
      error: error.message
    });
  }
};

// Delete an exercise
export const deleteExercise = async (req, res) => {
  const { exerciseId } = req.params;

  try {
    const client = await pool.connect();
    try {
      const { rowCount } = await client.query(
        `
        DELETE FROM exercises
        WHERE exercise_id = $1;
        `,
        [exerciseId]
      );

      if (rowCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'Exercise not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Exercise deleted successfully'
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error deleting exercise:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete exercise',
      error: error.message
    });
  }
};

// Get exercise by ID
export const getExerciseById = async (req, res) => {
  const { exerciseId } = req.params;

  try {
    const client = await pool.connect();
    try {
      const { rows } = await client.query(
        `SELECT * FROM exercises WHERE exercise_id = $1;`,
        [exerciseId]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Exercise not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Exercise fetched successfully',
        exercise: rows[0]
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching exercise:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exercise',
      error: error.message
    });
  }
};

export const getAllExercises = async (req, res) => {
  
}

