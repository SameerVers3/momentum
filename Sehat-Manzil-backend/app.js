import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import cookieParser from 'cookie-parser';
import errorHandler from './middleware/errorHandler.js';

import userRoutes from './routes/userRoutes.js';
import workoutRoutes from './routes/workoutRoutes.js';
import exerciseRoutes from './routes/exerciseRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import mealRoutes from './routes/mealRoutes.js';
import progressRoutes from './routes/progressRoutes.js';

dotenv.config();

const app = express();
app.use(express.json());

const env = process.env.NODE_ENV || 'development';

connectDB(env);

app.use(cookieParser());


app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/workout', workoutRoutes);
app.use('/api/exercise', exerciseRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/progress', progressRoutes);

app.use('/', (req, res) => {
  res.send('welcome to momentum, API is running...');
});

app.use(errorHandler);

export default app;