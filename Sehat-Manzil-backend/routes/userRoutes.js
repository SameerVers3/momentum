import express from 'express';
import {
  updateUserProfile,
  getUserProfile,
  getUserData
} from '../controllers/userProfileController.js';
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

// Route to update user profile
router.post('/profile', isAuthenticated, updateUserProfile);

// Route to fetch combined user and profile data
router.get('/profile', isAuthenticated, getUserData);

export default router;
