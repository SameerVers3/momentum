import express from 'express';
import {
    getProgressByUserId,
    addProgress,
    updateProgress,
    deleteProgress,
    getUserMetricsHistory
} from '../controllers/progress.js';
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

// Routes for progress tracking
router.get("/bmi", isAuthenticated, getUserMetricsHistory);

router.get('/user/:userId', getProgressByUserId); // Get progress entries for a user
router.post('/', addProgress); // Add a new progress entry
router.put('/:progressId', updateProgress); // Update a progress entry
router.delete('/:progressId', deleteProgress); // Delete a progress entry

export default router;
