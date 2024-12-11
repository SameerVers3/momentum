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


// CREATE TABLE user_workout_plans (
//   user_plan_id SERIAL PRIMARY KEY,
//   user_id INTEGER REFERENCES users(userid) ON DELETE CASCADE,
//   workout_id INTEGER REFERENCES workouts(workout_id) ON DELETE CASCADE,
//   description TEXT,
//   start_date DATE NOT NULL,
//   end_date DATE,
//   is_active BOOLEAN DEFAULT TRUE,
//   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );


export const userAlreadyHaveWorkout = async (req, res) => {
  const { workoutId } = req.params;
  const { userId } = req.user;

  try {
    const client = await pool.connect();
    try {
      const { rowCount } = await client.query(
        `SELECT * FROM user_workout_plans WHERE workout_id = $1 AND user_id = $2;`,
        [workoutId, userId]
      );

      res.status(200).json({ 
        success: true, 
        message: 'Workout fetched successfully', 
        userAlreadyHaveWorkout: rowCount > 0 
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
}


// add user to the workout plan
export const addUserToWorkoutPlan = async (req, res) => {
  const { workoutId } = req.params;
  const { userId } = req.user;

  try {
    const client = await pool.connect();

    const { rows } = await client.query(
      `INSERT INTO user_workout_plans (user_id, workout_id, description, start_date, end_date) VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
      [userId, workoutId, 'User added to workout plan', new Date(), null]
    );

    res.status(200).json({
      success: true,
      message: 'User added to workout plan',
      userWorkoutPlan: rows[0]
    });

  } catch (error) {
    console.error('Error adding user to workout plan:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add user to workout plan', 
      error: error.message 
    });
  }
}


// get all the workout plans for a user
export const getWorkoutPlansByUser = async (req, res) => {
  console.log("hello");
  const { userId } = req.user;

  console.log(userId);

  try {
    const client = await pool.connect();
    try {
      const { rows } = await client.query(
        `SELECT * FROM user_workout_plans WHERE user_id = $1;`,
        [userId]
      );

      console.log(rows);

      const body = {
        success: true,
        message: 'Workout plans fetched successfully',
        workoutPlans: rows
      };

      console.log(body);

      res.status(200).json(body);

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching user workout plans:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch user workout plans', 
      error: error.message 
    });
  }
}


// CREATE TABLE user_workout_logs (
//   log_id SERIAL PRIMARY KEY,
//   user_id INTEGER REFERENCES users(userid) ON DELETE CASCADE,
//   workout_id INTEGER REFERENCES workouts(workout_id) ON DELETE CASCADE,
//   performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//   duration INT, -- Duration in minutes
//   calories_burned NUMERIC(6,2),
//   notes TEXT
// );

// CREATE TABLE user_exercise_logs (
//   exercise_log_id SERIAL PRIMARY KEY,
//   user_workout_log_id INTEGER REFERENCES user_workout_logs(log_id) ON DELETE CASCADE,
//   exercise_id INTEGER REFERENCES exercises(exercise_id) ON DELETE CASCADE,
//   sets_completed INT NOT NULL,
//   reps_performed INT NOT NULL,
//   weight_used NUMERIC(6,2), -- Optional, e.g., in kg or lbs
//   notes TEXT
// );

// Validation schema for workout log
const workoutLogSchema = z.object({
  duration: z.number().positive('Duration must be a positive number'),
  calories_burned: z.number().positive('Calories burned must be a positive number'),
  notes: z.string().optional(),
});

// Validation schema for exercise log
const exerciseLogSchema = z.object({
  exercise_id: z.number().positive(),
  sets_completed: z.number().positive(),
  reps_performed: z.number().positive(),
  weight_used: z.number().positive().optional(),
  notes: z.string().optional(),
});

// Log a completed workout
export const logWorkout = async (req, res) => {
  const { workoutId } = req.params;
  const { userId } = req.user;

  try {
    const parsedData = workoutLogSchema.parse(req.body);
    const client = await pool.connect();

    try {
      const { rows } = await client.query(
        `
        INSERT INTO user_workout_logs 
        (user_id, workout_id, duration, calories_burned, notes)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
        `,
        [
          userId,
          workoutId,
          parsedData.duration,
          parsedData.calories_burned,
          parsedData.notes || null
        ]
      );

      res.status(201).json({
        success: true,
        message: 'Workout logged successfully',
        workoutLog: rows[0]
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error logging workout:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to log workout',
      error: error.message
    });
  }
};

// Log exercises for a workout
export const logExercise = async (req, res) => {
  const { workoutLogId } = req.params;
  const exercises = req.body.exercises;

  if (!Array.isArray(exercises)) {
    return res.status(400).json({
      success: false,
      message: 'Exercises must be provided as an array'
    });
  }

  try {
    const client = await pool.connect();
    try {
      const exerciseLogs = [];

      // Start a transaction
      await client.query('BEGIN');

      for (const exercise of exercises) {
        const parsedExercise = exerciseLogSchema.parse(exercise);
        const { rows } = await client.query(
          `
          INSERT INTO user_exercise_logs 
          (user_workout_log_id, exercise_id, sets_completed, reps_performed, weight_used, notes)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *;
          `,
          [
            workoutLogId,
            parsedExercise.exercise_id,
            parsedExercise.sets_completed,
            parsedExercise.reps_performed,
            parsedExercise.weight_used || null,
            parsedExercise.notes || null
          ]
        );
        exerciseLogs.push(rows[0]);
      }

      // Commit the transaction
      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Exercises logged successfully',
        exerciseLogs
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error logging exercises:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to log exercises',
      error: error.message
    });
  }
};

// Get all workout logs for a user
export const getWorkoutLogs = async (req, res) => {
  const { userId } = req.user;

  try {
    const client = await pool.connect();
    try {
      const { rows } = await client.query(
        `SELECT * FROM user_workout_logs WHERE user_id = $1;`,
        [userId]
      );

      res.status(200).json({
        success: true,
        message: 'Workout logs fetched successfully',
        workoutLogs: rows
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching workout logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch workout logs',
      error: error.message
    });
  }
};