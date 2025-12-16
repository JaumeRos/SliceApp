const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');
const { uploadFile, deleteFile } = require('../utils/storageService');

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  const jwt = require('jsonwebtoken');
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/tennis_users');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// PUT /tennis/user/profile - Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { full_name, bio, link, sex, birthday } = req.body;

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (full_name !== undefined) {
      updates.push(`full_name = $${paramIndex++}`);
      values.push(full_name);
    }
    if (bio !== undefined) {
      updates.push(`bio = $${paramIndex++}`);
      values.push(bio);
    }
    if (link !== undefined) {
      updates.push(`link = $${paramIndex++}`);
      values.push(link);
    }
    if (sex !== undefined) {
      updates.push(`sex = $${paramIndex++}`);
      values.push(sex);
    }
    if (birthday !== undefined) {
      updates.push(`birthday = $${paramIndex++}`);
      values.push(birthday);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    values.push(userId);
    const query = `
      UPDATE tennis_users 
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING id, email, full_name, profile_image_url, bio, link, sex, birthday
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// POST /tennis/user/profile-image - Upload profile image
router.post('/profile-image', authenticateToken, upload.single('profile_image'), async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    // Get current user to check for existing image
    const userResult = await pool.query(
      'SELECT profile_image_url FROM tennis_users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Upload to S3
    const imageUrl = await uploadFile(req.file, 'tennis_users');

    // Delete old image from S3 if it exists
    if (userResult.rows[0].profile_image_url) {
      try {
        await deleteFile(userResult.rows[0].profile_image_url);
      } catch (deleteError) {
        console.error('Error deleting old image:', deleteError);
        // Continue even if deletion fails
      }
    }

    // Delete local file if it exists
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting local file:', unlinkError);
        // Continue even if deletion fails
      }
    }

    // Update database
    const updateResult = await pool.query(
      'UPDATE tennis_users SET profile_image_url = $1, updated_at = NOW() WHERE id = $2 RETURNING profile_image_url',
      [imageUrl, userId]
    );

    res.json({
      success: true,
      imageUrl: updateResult.rows[0].profile_image_url,
    });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    
    // Clean up local file if upload failed
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting local file:', unlinkError);
      }
    }

    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;

