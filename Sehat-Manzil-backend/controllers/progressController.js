import { z } from 'zod';
import connectDB from '../config/db.js';
import pkg from 'pg';

const { Pool } = pkg;
const pool = await connectDB();

// Get all progress entries for a user
export const getProgressByUserId = async (req, res) => {
    const { userId } = req.params;

    try {
        const result = await pool.query(
            'SELECT * FROM progress_tracking WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching progress:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Add a new progress entry
export const addProgress = async (req, res) => {
    const { userId, weight, height, body_fat_percentage, muscle_mass, notes } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO progress_tracking 
                (user_id, weight, height, body_fat_percentage, muscle_mass, notes, created_at) 
             VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP) RETURNING *`,
            [userId, weight, height, body_fat_percentage, muscle_mass, notes]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding progress:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Update an existing progress entry
export const updateProgress = async (req, res) => {
    const { progressId } = req.params;
    const { weight, height, body_fat_percentage, muscle_mass, notes } = req.body;

    try {
        const result = await pool.query(
            `UPDATE progress_tracking 
             SET weight = $1, height = $2, body_fat_percentage = $3, muscle_mass = $4, notes = $5, created_at = CURRENT_TIMESTAMP 
             WHERE progress_id = $6 RETURNING *`,
            [weight, height, body_fat_percentage, muscle_mass, notes, progressId]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Progress entry not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error updating progress:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Delete a progress entry
export const deleteProgress = async (req, res) => {
    const { progressId } = req.params;

    try {
        const result = await pool.query(
            'DELETE FROM progress_tracking WHERE progress_id = $1 RETURNING *',
            [progressId]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Progress entry not found' });
        }
        res.status(200).json({ message: 'Progress entry deleted successfully' });
    } catch (error) {
        console.error('Error deleting progress:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};