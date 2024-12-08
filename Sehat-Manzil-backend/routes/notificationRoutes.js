import express from 'express';
import {
  getNotifications,
  markNotificationAsRead,
  createNotification,
  deleteNotification,
} from '../controllers/notification.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// Route to fetch all notifications for the authenticated user
router.get('/', isAuthenticated, getNotifications);

// Route to mark a notification as read
router.put('/:notificationId/read', isAuthenticated, markNotificationAsRead);

// Route to create a new notification
router.post('/', isAuthenticated, createNotification);

// Route to delete a notification
router.delete('/:notificationId', isAuthenticated, deleteNotification);

export default router;
