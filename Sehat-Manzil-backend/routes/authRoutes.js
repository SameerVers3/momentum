import express from 'express';
import { 
  register,
  login,
  approveUser,
} from '../controllers/authController.js';
import {isAuthenticated} from "../middleware/auth.js";

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.get('/verifysession' , isAuthenticated)

// router.get('/getUsers', authorizeRoles("admin"), getAllUsers)

export default router;
