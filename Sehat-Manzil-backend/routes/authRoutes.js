import express from 'express';
import { 
  register,
  login,
  approveUser,
  checkSession
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.get('/verifysession' , checkSession)

// router.get('/getUsers', authorizeRoles("admin"), getAllUsers)

export default router;
