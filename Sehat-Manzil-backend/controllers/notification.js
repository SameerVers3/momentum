import { z } from 'zod';
import connectDB from '../config/db.js';

const pool = await connectDB();

// Validation schema for creating a notification
const notificationSchema = z.object({
  user_id: z.number().int(),
  message: z.string().min(1),
  action: z.string().optional(),
});

// Fetch all notifications for a user
export const getNotifications = async (req, res) => {
  const { userId } = req.user;

  try {
    const client = await pool.connect();
    try {
      const { rows } = await client.query(
        `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC`,
        [userId]
      );

      res.status(200).json({
        success: true,
        message: 'Notifications fetched successfully',
        notifications: rows,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message,
    });
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (req, res) => {
  const { notificationId } = req.params;

  try {
    const client = await pool.connect();
    try {
      const { rowCount } = await client.query(
        `UPDATE notifications SET read = TRUE WHERE notification_id = $1`,
        [notificationId]
      );

      if (rowCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Notification marked as read',
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message,
    });
  }
};

// Create a new notification
export const createNotification = async (req, res) => {
  try {
    const parsedData = notificationSchema.parse(req.body);

    const client = await pool.connect();
    try {
      const { rows } = await client.query(
        `
        INSERT INTO notifications (user_id, message, action)
        VALUES ($1, $2, $3)
        RETURNING *;
        `,
        [parsedData.user_id, parsedData.message, parsedData.action]
      );

      res.status(201).json({
        success: true,
        message: 'Notification created successfully',
        notification: rows[0],
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notification',
      error: error.message,
    });
  }
};

// Delete a notification
export const deleteNotification = async (req, res) => {
  const { notificationId } = req.params;

  try {
    const client = await pool.connect();
    try {
      const { rowCount } = await client.query(
        `DELETE FROM notifications WHERE notification_id = $1`,
        [notificationId]
      );

      if (rowCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Notification deleted successfully',
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message,
    });
  }
};
