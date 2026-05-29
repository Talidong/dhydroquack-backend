const db = require('../config/database');

// Get all plants
exports.getAllPlants = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM plants ORDER BY plant_id DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Get plants by user ID
exports.getPlantsByUser = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM plants WHERE user_id = ? ORDER BY plant_id DESC',
      [req.params.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Get plant by ID
exports.getPlantById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM plants WHERE plant_id = ?', [req.params.id]);
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
    const { user_id, group_name, plant_name, date_planted, growth_stage } = req.body;

    // Check if user exists before inserting (avoid FK constraint crash)
    const [user] = await db.query('SELECT user_id FROM users WHERE user_id = ?', [user_id]);
    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const [result] = await db.query(
      'INSERT INTO plants (user_id, group_name, plant_name, date_planted, growth_stage) VALUES (?, ?, ?, ?, ?)',
      [user_id, group_name, plant_name, date_planted, growth_stage]
    );
    
    // Mas maganda kung kumpleto ang ibabalik na detalye para magamit agad ng frontend components nina Saulong
    res.status(201).json({ 
      plant_id: result.insertId, 
      user_id,
      group_name,
      plant_name, 
      date_planted, 
      growth_stage,
      message: 'Plant added successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Update plant
exports.updatePlant = async (req, res) => {
  try {
    const { group_name, plant_name, date_planted, growth_stage } = req.body;

    // Check if plant exists
    const [plant] = await db.query('SELECT plant_id FROM plants WHERE plant_id = ?', [req.params.id]);
    if (plant.length === 0) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    await db.query(
      'UPDATE plants SET group_name = ?, plant_name = ?, date_planted = ?, growth_stage = ? WHERE plant_id = ?',
      [group_name, plant_name, date_planted, growth_stage, req.params.id]
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