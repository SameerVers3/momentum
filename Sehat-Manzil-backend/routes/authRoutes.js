import express from 'express';
import { 
  register,
  login,
  checkSession,
  adminLogin
} from '../controllers/auth.js';

const router = express.Router();

router.post('/register', register);

router.post('/login', login);

router.get('/verifysession' , checkSession)

router.post('/adminlogin', adminLogin);

export default router;
