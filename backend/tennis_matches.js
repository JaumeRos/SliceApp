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

// POST /api/tennis/matches - Create a new match
router.post('/', authenticateToken, async (req, res) => {
  const {
    opponentName,
    matchType,
    result,
    playerSets,
    opponentSets,
    sets,
    location,
    notes,
    playedAt,
  } = req.body;

  const userId = req.user.userId;

  try {
    // Validate required fields
    if (!opponentName || !matchType || !result || !sets || sets.length === 0) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Insert match
    const matchResult = await pool.query(
      `INSERT INTO tennis_matches 
       (user_id, opponent_name, match_type, result, player_sets, opponent_sets, sets, location, notes, played_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        userId,
        opponentName,
        matchType,
        result,
        playerSets || 0,
        opponentSets || 0,
        JSON.stringify(sets),
        location || null,
        notes || null,
        playedAt || new Date(),
      ]
    );

    const match = matchResult.rows[0];

    // Get updated stats
    const statsResult = await pool.query(
      'SELECT * FROM tennis_user_stats WHERE user_id = $1',
      [userId]
    );

    res.status(201).json({
      success: true,
      match: {
        ...match,
        sets: JSON.parse(match.sets),
      },
      stats: statsResult.rows[0] || null,
    });
  } catch (error) {
    console.error('Error creating match:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/tennis/matches - Get user's match history
router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { limit = 50, offset = 0 } = req.query;

  try {
    const matchesResult = await pool.query(
      `SELECT * FROM tennis_matches 
       WHERE user_id = $1 
       ORDER BY played_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const matches = matchesResult.rows.map(match => ({
      ...match,
      sets: JSON.parse(match.sets),
    }));

    res.json({
      success: true,
      matches,
      count: matches.length,
    });
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/tennis/matches/stats - Get user's stats
router.get('/stats', authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    const statsResult = await pool.query(
      'SELECT * FROM tennis_user_stats WHERE user_id = $1',
      [userId]
    );

    if (statsResult.rows.length === 0) {
      // Return default stats if no matches yet
      return res.json({
        success: true,
        stats: {
          total_matches: 0,
          total_wins: 0,
          total_losses: 0,
          win_rate: 0,
          current_streak: 0,
          longest_win_streak: 0,
          longest_loss_streak: 0,
          last_match_date: null,
        },
      });
    }

    res.json({
      success: true,
      stats: statsResult.rows[0],
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/tennis/matches/:id - Get specific match
router.get('/:id', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const matchId = req.params.id;

  try {
    const matchResult = await pool.query(
      'SELECT * FROM tennis_matches WHERE id = $1 AND user_id = $2',
      [matchId, userId]
    );

    if (matchResult.rows.length === 0) {
      return res.status(404).json({ message: 'Match not found' });
    }

    const match = {
      ...matchResult.rows[0],
      sets: JSON.parse(matchResult.rows[0].sets),
    };

    res.json({
      success: true,
      match,
    });
  } catch (error) {
    console.error('Error fetching match:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/tennis/matches/:id - Delete a match
router.delete('/:id', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const matchId = req.params.id;

  try {
    const deleteResult = await pool.query(
      'DELETE FROM tennis_matches WHERE id = $1 AND user_id = $2 RETURNING *',
      [matchId, userId]
    );

    if (deleteResult.rows.length === 0) {
      return res.status(404).json({ message: 'Match not found' });
    }

    // Note: Stats will need to be recalculated manually or via a separate trigger
    // For now, we'll just return success

    res.json({
      success: true,
      message: 'Match deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting match:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

