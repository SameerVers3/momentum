import pkg from 'pg';
import jwt from 'jsonwebtoken';
import connectDB from '../config/db.js';
const { Pool } = pkg;

const pool = await connectDB();

export const isAuthenticated = async (req, res, next) => {
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

        // Call the next middleware or controller
        next();
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

