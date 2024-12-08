import { z } from 'zod';
import connectDB from '../config/db.js';
import pkg from 'pg';
import { approveUser } from './auth.js';

const { Pool } = pkg;
const pool = await connectDB();

// Validation schemas
const userProfileSchema = z.object({
  imageUrl: z.string().url().optional(),
  gender: z.enum(['Male', 'Female', 'Other']),
  date_of_birth: z.string().regex(/^\d{2}-\d{2}-\d{4}$/, 'Date must be in DD-MM-YYYY format'),
  weight: z.string(),
  height: z.string(),
  goal: z.enum(['Lose Fat', 'Improve Shape', 'Lean & Tone']),
});

// Utility: Convert DD-MM-YYYY to YYYY-MM-DD for database compatibility
const convertDateFormat = (dateString) => {
  const [day, month, year] = dateString.split('-');
  return `${year}-${month}-${day}`; // Returns YYYY-MM-DD
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  const { userId } = req.user;

  console.log(`Updating profile for userId: ${userId}`);
  console.log('Request body:', req.body);
  console.log("--------------");
  console.log(req.body.date_of_birth);
  
  console.log("--------------");

  try {
    // Validate incoming data
    const parsedData = userProfileSchema.parse(req.body);
    const formattedDateOfBirth = convertDateFormat(parsedData.date_of_birth);

    const client = await pool.connect();
    try {
      const { rows } = await client.query(
        `
        INSERT INTO user_profiles 
        (user_id, image_url, gender, date_of_birth, current_weight, current_height, goal)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (user_id) DO UPDATE
        SET 
          image_url = EXCLUDED.image_url,
          gender = EXCLUDED.gender,
          date_of_birth = EXCLUDED.date_of_birth,
          current_weight = EXCLUDED.current_weight,
          current_height = EXCLUDED.current_height,
          goal = EXCLUDED.goal
        RETURNING *;
        `,
        [
          userId,
          parsedData.imageUrl,
          parsedData.gender,
          formattedDateOfBirth,
          parsedData.weight,
          parsedData.height,
          parsedData.goal,
        ]
      );

      console.log('Profile updated successfully:', rows[0]);
      await approveUser(userId); // Optional approval logic
      res.status(200).json({ 
        success: true, 
        message: 'Profile updated successfully', 
        profile: rows[0] 
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update profile', 
      error: error.message 
    });
  }
};

// Fetch user profile
export const getUserProfile = async (req, res) => {
  const { userId } = req.user;
  console.log(`Fetching profile for userId: ${userId}`);

  try {
    const client = await pool.connect();
    try {
      const { rows } = await client.query(
        `SELECT * FROM user_profiles WHERE user_id = $1;`,
        [userId]
      );

      if (rows.length === 0) {
        console.log('Profile not found for userId:', userId);
        return res.status(404).json({ 
          success: false, 
          message: 'Profile not found' 
        });
      }

      console.log('Profile fetched:', rows[0]);
      res.status(200).json({ 
        success: true, 
        message: 'Profile fetched successfully', 
        profile: rows[0] 
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch profile', 
      error: error.message 
    });
  }
};

// Fetch combined user and profile data
export const getUserData = async (req, res) => {
  const { userId } = req.user;
  console.log(`Fetching user data for userId: ${userId}`);

  try {
    const client = await pool.connect();
    try {
      const { rows } = await client.query(
        `
        SELECT 
          u.userid,
          u.name,
          u.email,
          u.status,
          p.image_url,
          p.gender,
          p.date_of_birth,
          p.current_weight,
          p.current_height,
          p.goal
        FROM users u
        LEFT JOIN user_profiles p ON u.userid = p.user_id
        WHERE u.userid = $1;
        `,
        [userId]
      );

      if (rows.length === 0) {
        console.log('User not found for userId:', userId);
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      console.log('User data fetched successfully:', rows[0]);
      res.status(200).json({ 
        success: true, 
        message: 'User data fetched successfully', 
        data: rows[0] 
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch user data', 
      error: error.message 
    });
  }
};
