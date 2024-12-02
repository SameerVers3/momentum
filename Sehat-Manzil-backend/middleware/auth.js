import pkg from 'pg';
import connectDB from "../config/db.js";
import jwt from 'jsonwebtoken';
const { Pool } = pkg;


const pool = await connectDB();

export const isAuthenticated = async (req, res) => {
  try {
    // Get the Authorization header from the request
    const authHeader = req.headers['authorization'];
    
    // Check if the header exists
    if (!authHeader) {
      return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }

    // Extract token from the header
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized. Token missing.' });
    }

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Forbidden. Invalid token.' });
      }

      // Token is valid, extract user data from the decoded token
      const { userid, role } = decoded;

      // Check if the user exists in the database
      const client = await pool.connect();

      try {
        const { rows } = await client.query(
          'SELECT userid, role, name, email, status FROM users WHERE userid = $1',
          [userid]
        );

        if (rows.length === 0) {
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
