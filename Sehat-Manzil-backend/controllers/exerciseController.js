import { z } from 'zod';
import connectDB from '../config/db.js';
import pkg from 'pg';

const { Pool } = pkg;
const pool = await connectDB();

// Validation schema for exercises
const exerciseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  muscle_group: z.string().optional(),
  sets: z.number().min(1, 'Sets must be at least 1'),
  reps: z.number().min(1, 'Reps must be at least 1'),
  workout_id: z.number(),
});

// Create a new exercise
export const createExercise = async (req, res) => {
  try {
    const parsedData = exerciseSchema.parse(req.body);

    const client = await pool.connect();
    try {
      const { rows } = await client.query(
        `
        INSERT INTO exercises (name, muscle_group, sets, reps, workout_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
        `,
        [
          parsedData.name,
          parsedData.muscle_group || null,
          parsedData.sets,
          parsedData.reps,
          parsedData.workout_id,
        ]
      );

      res.status(201).json({
        success: true,
        message: 'Exercise created successfully',
        exercise: rows[0],
      });
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create exercise',
      error: error.message,
    });
  }
};

// Get a single exercise by ID
export const getExercise = async (req, res) => {
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
          message: 'Exercise not found',
        });
      }

      res.status(200).json({
        success: true,
        exercise: rows[0],
      });
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exercise',
      error: error.message,
    });
  }
};

// Update an exercise by ID
export const updateExercise = async (req, res) => {
  const { exerciseId } = req.params;

  try {
    const parsedData = exerciseSchema.parse(req.body);

    const client = await pool.connect();
    try {
      const { rows } = await client.query(
        `
        UPDATE exercises
        SET name = $1,
            muscle_group = $2,
            sets = $3,
            reps = $4,
            workout_id = $5
        WHERE exercise_id = $6
        RETURNING *;
        `,
        [
          parsedData.name,
          parsedData.muscle_group || null,
          parsedData.sets,
          parsedData.reps,
          parsedData.workout_id,
          exerciseId,
        ]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Exercise not found',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Exercise updated successfully',
        exercise: rows[0],
      });
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update exercise',
      error: error.message,
    });
  }
};

// Delete an exercise by ID
export const deleteExercise = async (req, res) => {
  const { exerciseId } = req.params;

  try {
    const client = await pool.connect();
    try {
      const { rowCount } = await client.query(
        `DELETE FROM exercises WHERE exercise_id = $1;`,
        [exerciseId]
      );

      if (rowCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'Exercise not found',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Exercise deleted successfully',
      });
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete exercise',
      error: error.message,
    });
  }
};

// Get all exercises for a specific workout or all exercises with optional search query
export const getAllExercises = async (req, res) => {
  const { workout_id, search } = req.query; // search is the new query parameter

  try {
    const client = await pool.connect();
    try {
      // Create base query
      let query = `SELECT * FROM exercises`;

      // Add search condition if provided
      if (search) {
        query += ` WHERE name ILIKE $1 OR muscle_group ILIKE $1`; // ILIKE for case-insensitive search
      } else if (workout_id) {
        query += ` WHERE workout_id = $1`;
      }

      const params = search ? [`%${search}%`] : workout_id ? [workout_id] : [];

      const { rows } = await client.query(query, params);

      res.status(200).json({
        success: true,
        exercises: rows,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exercises',
      error: error.message,
    });
  }
};
