// backend/controllers/plantController.js
const db = require('../config/database');

// Get all plants (with team name)
exports.getAllPlants = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, t.team_name 
      FROM plants p
      LEFT JOIN teams t ON p.team_id = t.team_id
      ORDER BY p.plant_id DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Get plants by team ID
exports.getPlantsByTeam = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, t.team_name 
      FROM plants p
      LEFT JOIN teams t ON p.team_id = t.team_id
      WHERE p.team_id = ?
      ORDER BY p.plant_id DESC
    `, [req.params.teamId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Get plant by ID
exports.getPlantById = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, t.team_name 
      FROM plants p
      LEFT JOIN teams t ON p.team_id = t.team_id
      WHERE p.plant_id = ?
    `, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Plant not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Create plant
exports.createPlant = async (req, res) => {
  try {
    const { team_id, user_id, plant_name, date_planted, growth_stage } = req.body;

    if (!team_id || !plant_name || !date_planted) {
      return res.status(400).json({ error: 'team_id, plant_name, and date_planted are required.' });
    }

    const [result] = await db.query(
      'INSERT INTO plants (team_id, user_id, plant_name, date_planted, growth_stage) VALUES (?, ?, ?, ?, ?)',
      [team_id, user_id || null, plant_name, date_planted, growth_stage || 'Seedling']
    );

    res.status(201).json({
      plant_id: result.insertId,
      team_id,
      user_id,
      plant_name,
      date_planted,
      growth_stage: growth_stage || 'Seedling',
      message: 'Plant added successfully',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Update plant
exports.updatePlant = async (req, res) => {
  try {
    const { team_id, plant_name, date_planted, growth_stage } = req.body;

    const [plant] = await db.query('SELECT plant_id FROM plants WHERE plant_id = ?', [req.params.id]);
    if (plant.length === 0) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    await db.query(
      'UPDATE plants SET team_id = ?, plant_name = ?, date_planted = ?, growth_stage = ? WHERE plant_id = ?',
      [team_id, plant_name, date_planted, growth_stage, req.params.id]
    );
    res.json({ success: true, message: 'Plant updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Delete plant
exports.deletePlant = async (req, res) => {
  try {
    await db.query('DELETE FROM plants WHERE plant_id = ?', [req.params.id]);
    res.json({ success: true, message: 'Plant deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};