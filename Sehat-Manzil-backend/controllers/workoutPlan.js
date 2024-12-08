import { z } from 'zod';
import { pool } from '../config/db'; // Assuming this is where your DB connection is

// Schema for Workout Plan
const workoutPlanSchema = z.object({
  name: z.string().nonempty('Name is required'),
  description: z.string().optional(),
});

// Schema for Assigning Workout Plan to User
const assignPlanSchema = z.object({
  planId: z.number().min(1, 'Plan ID is required'),
  startDate: z.date(),
  endDate: z.date().optional(),
});

// Schema for Logging Workout
const logWorkoutSchema = z.object({
  workoutId: z.number().min(1, 'Workout ID is required'),
  duration: z.number().min(1, 'Duration must be greater than 0'),
  caloriesBurned: z.number().min(0, 'Calories burned must be greater than or equal to 0'),
  notes: z.string().optional(),
});

// Controller for creating workout plan
export const createWorkoutPlan = async (req, res) => {
  try {
    // Validate incoming request
    const parsedData = workoutPlanSchema.parse(req.body);
    const { name, description } = parsedData;

    const client = await pool.connect();
    try {
      // Insert new workout plan
      await client.query(
        'INSERT INTO workout_plans (name, description) VALUES ($1, $2)',
        [name, description || null]
      );

      return res.status(201).json({
        message: 'Workout plan created successfully',
        success: true,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Server error',
      success: false,
    });
  }
};

// Controller for assigning workout plan to user
export const assignWorkoutPlanToUser = async (req, res) => {
  try {
    // Validate incoming request
    const parsedData = assignPlanSchema.parse(req.body);
    const { planId, startDate, endDate } = parsedData;

    const { userId } = req.user; // Ensure req.user is valid and exists

    if (!userId) {
      return res.status(400).json({
        message: 'User ID is missing or invalid',
        success: false,
      });
    }

    const client = await pool.connect();
    try {
      // Check if plan exists and if user exists in a single query
      const { rows: plans } = await client.query(
        `SELECT p.plan_id, u.userid
         FROM workout_plans p
         LEFT JOIN users u ON u.userid = $1
         WHERE p.plan_id = $2`,
        [userId, planId]
      );

      if (plans.length === 0) {
        return res.status(404).json({
          message: 'Workout plan or user not found',
          success: false,
        });
      }

      // Assign workout plan to user
      await client.query(
        'INSERT INTO user_workout_plans (user_id, plan_id, start_date, end_date) VALUES ($1, $2, $3, $4)',
        [userId, planId, startDate, endDate || null]
      );

      return res.status(200).json({
        message: 'Workout plan assigned to user successfully',
        success: true,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Server error',
      success: false,
    });
  }
};

// Controller for logging a workout for a plan
export const logWorkoutForPlan = async (req, res) => {
  try {
    const { userId } = req.user; // Ensure req.user is valid and exists
    if (!userId) {
      return res.status(400).json({
        message: 'User ID is missing or invalid',
        success: false,
      });
    }

    // Validate incoming request
    const parsedData = logWorkoutSchema.parse(req.body);
    const { workoutId, duration, caloriesBurned, notes } = parsedData;

    const client = await pool.connect();
    try {
      // Check if workout exists
      const { rows: workouts } = await client.query(
        'SELECT * FROM workouts WHERE workout_id = $1',
        [workoutId]
      );
      if (workouts.length === 0) {
        return res.status(404).json({
          message: 'Workout not found',
          success: false,
        });
      }

      // Log workout for the user
      await client.query(
        'INSERT INTO user_workout_logs (user_id, workout_id, duration, calories_burned, notes) VALUES ($1, $2, $3, $4, $5)',
        [userId, workoutId, duration, caloriesBurned, notes || null]
      );

      return res.status(200).json({
        message: 'Workout logged successfully',
        success: true,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Server error',
      success: false,
    });
  }
};
