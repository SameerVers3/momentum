import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
// import courseRoutes from './routes/courseRoutes.js';
// import gradeRoutes from './routes/gradeRoutes.js';
import cookieParser from 'cookie-parser';
import errorHandler from './middleware/errorHandler.js';

dotenv.config();

const app = express();
app.use(express.json());

const env = process.env.NODE_ENV || 'development';

connectDB(env);

app.use(cookieParser());


app.use('/api/auth', authRoutes);
// app.use('/api/courses', courseRoutes);
// app.use('/api/grade', gradeRoutes);

app.use(errorHandler);

export default app;