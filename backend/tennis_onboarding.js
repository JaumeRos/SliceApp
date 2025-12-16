const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

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

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// POST /api/tennis/onboarding - Save onboarding data
router.post('/', authenticateToken, async (req, res) => {
  const {
    tennisLevel,
    courtPreference,
    playingFrequency,
    preferredTimes,
  } = req.body;

  const userId = req.user.userId;

  try {
    // Validate required fields
    if (!tennisLevel || !courtPreference || !playingFrequency || !preferredTimes) {
      return res.status(400).json({ message: 'Missing required onboarding fields' });
    }

    // Update user with onboarding data
    const result = await pool.query(
      `UPDATE users 
       SET tennis_level = $1, 
           court_preference = $2, 
           playing_frequency = $3, 
           preferred_times = $4,
           onboarding_completed = TRUE,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING id, email, tennis_level, court_preference, playing_frequency, preferred_times, onboarding_completed`,
      [
        tennisLevel,
        courtPreference,
        playingFrequency,
        JSON.stringify(preferredTimes),
        userId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result.rows[0];

    res.json({
      success: true,
      message: 'Onboarding completed successfully',
      user: {
        ...user,
        preferred_times: JSON.parse(user.preferred_times),
      },
    });
  } catch (error) {
    console.error('Error saving onboarding data:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/tennis/onboarding - Get user's onboarding data
router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      `SELECT id, email, tennis_level, court_preference, playing_frequency, preferred_times, onboarding_completed
       FROM users 
       WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result.rows[0];

    res.json({
      success: true,
      user: {
        ...user,
        preferred_times: user.preferred_times ? JSON.parse(user.preferred_times) : null,
      },
    });
  } catch (error) {
    console.error('Error fetching onboarding data:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

