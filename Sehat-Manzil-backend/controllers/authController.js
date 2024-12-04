import { z } from 'zod';
import connectDB from "../config/db.js";
import pkg from 'pg';
import jwt from 'jsonwebtoken';
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
    console.log('Logging in...');
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


export const checkSession = async (req, res) => {
  try {
    console.log('Checking authentication...');

    // Get the Authorization header from the request
    const authHeader = req.headers['authorization'];
    console.log('Authorization header:', authHeader);

    // Check if the header exists
    if (!authHeader) {
      console.log('Authorization header missing.');
      return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }

    // Extract token from the header
    const token = authHeader.split(' ')[1];
    console.log('Token:', token);

    if (!token) {
      console.log('Token missing.');
      return res.status(401).json({ message: 'Unauthorized. Token missing.' });
    }

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decoded) => {
      if (err) {
        console.log('Invalid token:', err);
        return res.status(403).json({ message: 'Forbidden. Invalid token.' });
      }

      // Token is valid, extract user data from the decoded token
      const { userid, role } = decoded;
      console.log('Decoded token:', decoded);

      // Check if the user exists in the database
      const client = await pool.connect();

      console.log('Checking user in the database...');
      console.log(userid);

      try {
        const { rows } = await client.query(
          'SELECT userid, role, name, email, status FROM users WHERE userid = $1',
          [userid]
        );
        console.log('User query result:', rows);

        if (rows.length === 0) {
          console.log('User not found.');
          return res.status(401).json({ message: 'Unauthorized. User not found.' });
        }

        // Attach user info to the request object
        req.user = {
          userId: rows[0].userid,
          role: rows[0].role,
          username: rows[0].username, // Include more user data if needed
          email: rows[0].email,       // Include more user data if needed
          status: rows[0].status
        };
        console.log('Authenticated user:', req.user);

        // Send user data in the response
        return res.status(200).json({
          message: 'Authenticated successfully',
          success: true,
          user: req.user, // Send the user data to the client
        });

      } finally {
        client.release();
      }
    });
  } catch (error) {
    console.error('Error checking authentication:', error);
    res.status(500).json({ 
      message: 'Server error',
      success: false
    });
  }
};

export const approveUser = async (userId) => {
  try {
    const client = await pool.connect();
    console.log('Approving user:', userId);
    try {
      // Update user's approval status
      
      const { rowCount } = await client.query(
        'UPDATE users SET status = $1 WHERE userid = $2',
        ['active', userId]
      );      

      if (rowCount === 0) {
        console.log('User not found');
        return res.status(404).json({ message: 'User not found' });
      }

    } finally {
      client.release();
    }
  } catch (error) {
    console.error(error);
  }
};
