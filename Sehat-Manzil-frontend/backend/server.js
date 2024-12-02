const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use(cors({
    origin: '*', // Allow all origins
}));
app.use(bodyParser.json());

const { Client } = require('pg');
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'admin',
    port: 5432,
})
client.connect()
    .then(() => console.log('Connected to the database'))
    .catch(err => console.error('Connection error', err.stack));

app.get('/getuser', async (req, res) => {
    try {
        const results = await client.query('SELECT * FROM users');
        res.json(results.rows); // Send rows to the client
    } catch (err) {
        console.error('Error executing query', err.stack);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/adduser', async (req, res) => {
    try {
        const { email, pass } = req.body;
        console.log(email, pass);

        // Validate inputs
        if (!email || !pass) {
            return res.status(400).send('All fields (email, pass) are required.');
        }

        // Parameterized INSERT query
        const query = 'INSERT INTO users (email, pass) VALUES ($1, $2)';
        const values = [email, pass];

        // Execute query
        await client.query(query, values);
        res.status(201).send('User added successfully');
    } catch (err) {
        console.error('Error inserting user:', err.stack);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/signin', async (req, res) => {
    try {
        const { email, pass } = req.body;

        // Validate inputs
        if (!email || !pass) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Query to check if user exists with provided credentials
        const query = 'SELECT * FROM users WHERE email = $1 AND pass = $2';
        const values = [email, pass];

        const result = await client.query(query, values);

        if (result.rows.length > 0) {
            // User found - login successful
            res.status(200).json({
                success: true,
                message: 'Login successful',
                user: {
                    email: result.rows[0].email,
                    // Add any other user data you want to send
                    // Don't send sensitive information like passwords
                }
            });
        } else {
            // No user found with those credentials
            res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
    } catch (err) {
        console.error('Error during signin:', err.stack);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
});

app.post('/adduserprofile', async (req, res) => {
    const { email, date_of_birth, gender, weight, height, goal } = req.body;

    try {
        // Validate required fields
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Check if profile already exists
        const checkQuery = 'SELECT email FROM user_profile WHERE email = $1';
        const existing = await client.query(checkQuery, [email]);

        let query;
        let values;

        if (existing.rows.length > 0) {
            // Update existing profile
            query = `
                    UPDATE user_profile 
                    SET date_of_birth = $2, gender = $3, weight = $4, height = $5, goal = $6 
                    WHERE email = $1
                `;
        } else {
            // Insert new profile
            query = `
                    INSERT INTO user_profile (email, date_of_birth, gender, weight, height, goal) 
                    VALUES ($1, $2, $3, $4, $5, $6)
                `;
        }

        values = [email, date_of_birth, gender, weight, height, goal];
        await client.query(query, values);

        res.status(201).json({
            success: true,
            message: existing.rows.length > 0 ? 'Profile updated successfully' : 'Profile created successfully',
            profile: {
                email,
                date_of_birth,
                gender,
                weight,
                height,
                goal
            }
        });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({
            success: false,
            message: 'Database error: ' + err.message
        });
    }
});

app.post('/checkUserProfile', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required.' });
    }

    try {
        // Query to check if the email exists
        const result = await pool.query('SELECT COUNT(*) AS count FROM user_profile WHERE email = $1', [email]);

        const userExists = parseInt(result.rows[0].count, 10) > 0;

        res.json({ exists: userExists });
    } catch (error) {
        console.error('Error checking user profile:', error);
        res.status(500).json({ error: 'An error occurred while checking the user profile.' });
    }
});

// Get all workouts
app.get('/getworkouts', async (req, res) => {
    try {
        const query = 'SELECT * FROM workouts';
        const result = await client.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching workouts:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch workouts'
        });
    }
});

// Add workout to user's workouts
app.post('/addUserWorkout', async (req, res) => {
    const { email, workout_id } = req.body;

    try {
        // Check if workout already exists for user
        const checkQuery = 'SELECT * FROM users_workouts WHERE email = $1 AND workout_id = $2';
        const checkResult = await client.query(checkQuery, [email, workout_id]);

        if (checkResult.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Workout already added to your list'
            });
        }

        // Add workout to user's workouts
        const query = 'INSERT INTO users_workouts (email, workout_id) VALUES ($1, $2)';
        await client.query(query, [email, workout_id]);

        res.json({
            success: true,
            message: 'Workout added successfully'
        });
    } catch (err) {
        console.error('Error adding workout:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to add workout'
        });
    }
});

// Get specific workout details
app.get('/workout/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'SELECT * FROM workouts WHERE workout_id = $1';
        const result = await client.query(query, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Workout not found'
            });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching workout details:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch workout details'
        });
    }
});


// Get exercises for a specific workout
app.get('/workout/:id/exercises', async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT e.* 
            FROM exercises e
            WHERE e.workout_id = $1
            ORDER BY e.exercise_id
        `;
        const result = await client.query(query, [id]);
        
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching exercises:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch exercises'
        });
    }
});
app.post('/getUserWorkouts', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const query = 'SELECT * FROM users_workouts WHERE email = $1';
        const result = await client.query(query, [email]);

        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching workouts:', err.stack);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
});

app.delete('/deleteWorkout/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { email } = req.body;  // Get email from request body

        if (!email || !id) {
            return res.status(400).json({
                success: false,
                message: 'Email and workout ID are required'
            });
        }

        const query = 'DELETE FROM users_workouts WHERE email = $1 AND workout_id = $2';
        await client.query(query, [email, id]);

        res.json({
            success: true,
            message: 'Workout deleted successfully'
        });
    } catch (err) {
        console.error('Error deleting workout:', err.stack);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
});

app.get('/searchExercises', async (req, res) => {
    const { keyword } = req.query;
    
    try {
        if (!keyword) {
            return res.status(400).json({
                success: false,
                message: 'Search keyword is required'
            });
        }

        const query = `
            SELECT * FROM exercises 
            WHERE LOWER(name) LIKE LOWER($1) 
            OR LOWER(muscle_group) LIKE LOWER($1) 
            OR LOWER(instructions) LIKE LOWER($1)
        `;
        const result = await client.query(query, [`%${keyword}%`]);
        
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error searching exercises:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Updated search by muscle group endpoint
app.get('/searchExercisesByMuscle', async (req, res) => {
    const { muscle } = req.query;
    
    try {
        if (!muscle) {
            return res.status(400).json({
                success: false,
                message: 'Muscle group is required'
            });
        }

        const query = `
            SELECT * FROM exercises 
            WHERE LOWER(muscle_group) = LOWER($1)
        `;
        const result = await client.query(query, [muscle]);
        
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error searching exercises by muscle:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});
app.listen(3000, () => { console.log('listening on on 3000') });