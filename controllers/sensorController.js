const db = require('../config/database');

// Get all sensor readings (May proteksyon sa LIMIT placeholder)
exports.getAllReadings = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;

    const [rows] = await db.query(
      'SELECT * FROM sensor_readings ORDER BY timestamp DESC LIMIT ?', 
      [limit]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Get latest sensor reading (Para sa live status updates)
exports.getLatestReading = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM sensor_readings ORDER BY timestamp DESC LIMIT 1'); //
    if (rows.length === 0) return res.status(404).json({ error: 'No readings found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Get reading by ID
exports.getReadingById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM sensor_readings WHERE reading_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Reading not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Create full sensor reading (Gagamitin ng ESP32 kapag kumpleto ang data)
exports.createReading = async (req, res) => {
  try {
    const { water_level, temperature, humidity, ph_level, nutrient_ppm } = req.body; //
    const [result] = await db.query(
      'INSERT INTO sensor_readings (water_level, temperature, humidity, ph_level, nutrient_ppm) VALUES (?, ?, ?, ?, ?)', //
      [water_level, temperature, humidity, ph_level, nutrient_ppm]
    );
    
    // Magandang kasanayan na ibalik ang kumpletong data kasama ang message para sa log ng hardware
    res.status(201).json({ 
      reading_id: result.insertId, 
      water_level, 
      temperature, 
      humidity, 
      ph_level, 
      nutrient_ppm,
      message: 'Sensor readings logged successfully' 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Create water level only reading
exports.createWaterLevelReading = async (req, res) => {
  try {
    const { water_level } = req.body; //
    const [result] = await db.query(
      'INSERT INTO sensor_readings (water_level) VALUES (?)', //
      [water_level]
    );
    res.status(201).json({ 
      reading_id: result.insertId, 
      water_level,
      message: 'Water level logged successfully' 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Get readings by date range (Napakahusay para sa paggawa ng charts/graphs)
exports.getReadingsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const [rows] = await db.query(
      'SELECT * FROM sensor_readings WHERE timestamp BETWEEN ? AND ? ORDER BY timestamp DESC',
      [startDate, endDate]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};