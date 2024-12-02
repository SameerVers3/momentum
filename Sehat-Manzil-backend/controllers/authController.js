import { z } from 'zod';
import connectDB from "../config/db.js";
import pkg from 'pg';
import jwt from 'jsonwebtoken'; // Import JWT

const { Pool } = pkg;

const pool = await connectDB();

const registerSchema = z.object({
  name: z.string().nonempty('Name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['user'], 'Role is required'),
});

const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().nonempty('Password is required'),
});

export const register = async (req, res) => {
  try {
    const parsedData = registerSchema.parse(req.body);
    const { name, email, password, role } = parsedData;

    const client = await pool.connect();

    try {
      // Check if user already exists
      const { rows: existingUsers } = await client.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      if (existingUsers.length > 0) {
        return res.status(400).json({ 
          message: 'User already exists',
          success: false
        });
      }

      // Insert new user
      await client.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
        [name, email, password, role]
      );

      res.status(201).json({ 
        message: 'User registered successfully',
        success: true
      });
    } finally {
      client.release();
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        errors: error.errors,
        success: false
      });
    }
    console.error(error);
    res.status(500).json({ 
      message: 'Server error',
      success: false
    });
  }
};

export const login = async (req, res) => {
  try {
    const parsedData = loginSchema.parse(req.body);
    const { email, password } = parsedData;

    const client = await pool.connect();

    try {
      // Check user credentials
      const { rows: users } = await client.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (users.length === 0 || users[0].password !== password) {
        return res.status(400).json({ 
          message: 'Invalid credentials',
          success: false
        });
      }

      // Generate JWT token
      const payload = {
        userid: users[0].userid,
        role: users[0].role,
      };
      const secretKey = process.env.JWT_SECRET_KEY || 'your-secret-key'; // Use an environment variable for secret
      const token = jwt.sign(payload, secretKey, { expiresIn: '1d' }); // 1 day expiration

      res.json({ 
        message: 'Login successful', 
        token,
        success: true
      }); // Send token in response
    } finally {
      client.release();
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        errors: error.errors,
        success: false
      });
    }
    console.error(error);
    res.status(500).json({ 
      message: 'Server error',
      success: true
    });
  }
};

export const approveUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const client = await pool.connect();

    try {
      // Update user's approval status
      const { rowCount } = await client.query(
        'UPDATE users SET is_approved = true WHERE id = $1',
        [userId]
      );

      if (rowCount === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ message: 'User approved successfully' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
