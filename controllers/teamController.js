const db = require('../config/database');

// GET all teams
exports.getAllTeams = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT team_id, team_name FROM teams');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};