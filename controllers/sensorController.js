// backend/controllers/sensorController.js
const db = require('../config/database');

// ─── GET LATEST READING ───────────────────────────────────
// Endpoint: GET /api/sensors/latest?team_id=1
const getLatestReading = async (req, res) => {
  try {
    const { team_id } = req.query;

    if (!team_id) {
      return res.status(400).json({ message: 'team_id is required.' });
    }

    const [rows] = await db.query(
      `SELECT * FROM sensor_readings 
       WHERE team_id = ?
       ORDER BY timestamp DESC 
       LIMIT 1`,
      [team_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No readings found for this team.' });
    }

    const reading = rows[0];
    res.json({
      readingId:   reading.reading_id,
      teamId:      reading.team_id,
      timestamp:   reading.timestamp,
      waterLevel:  parseFloat(reading.water_level),
      temperature: parseFloat(reading.temperature),
      humidity:    parseFloat(reading.humidity),
      phLevel:     parseFloat(reading.ph_level),
      nutrient:    parseFloat(reading.nutrient_ppm),
    });
  } catch (error) {
    console.error('getLatestReading error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── GET HISTORICAL DATA ──────────────────────────────────
// Endpoint: GET /api/sensors/history?team_id=1&limit=7
const getHistoricalReadings = async (req, res) => {
  try {
    const { team_id } = req.query;
    const limit = parseInt(req.query.limit) || 7;

    if (!team_id) {
      return res.status(400).json({ message: 'team_id is required.' });
    }

    const [rows] = await db.query(
      `SELECT * FROM sensor_readings 
       WHERE team_id = ?
       ORDER BY timestamp DESC 
       LIMIT ?`,
      [team_id, limit]
    );

    const reversed = rows.reverse();

    const result = {
      labels:      reversed.map((r) => {
        const date = new Date(r.timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }),
      waterLevel:  reversed.map((r) => parseFloat(r.water_level)  || 0),
      temperature: reversed.map((r) => parseFloat(r.temperature)  || 0),
      humidity:    reversed.map((r) => parseFloat(r.humidity)      || 0),
      phLevel:     reversed.map((r) => parseFloat(r.ph_level)      || 0),
      nutrient:    reversed.map((r) => parseFloat(r.nutrient_ppm)  || 0),
    };

    res.json(result);
  } catch (error) {
    console.error('getHistoricalReadings error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── INSERT NEW READING ───────────────────────────────────
// Endpoint: POST /api/sensors/readings
// Ginagamit ng ESP32 para mag-send ng sensor data
// Body: { team_id, waterLevel, temperature, humidity, phLevel, nutrient }
const insertReading = async (req, res) => {
  try {
    const { team_id, waterLevel, temperature, humidity, phLevel, nutrient } = req.body;

    if (
      !team_id ||
      waterLevel === undefined || temperature === undefined ||
      humidity === undefined || phLevel === undefined || nutrient === undefined
    ) {
      return res.status(400).json({ message: 'team_id and all sensor values are required.' });
    }

    await db.query(
      `INSERT INTO sensor_readings 
       (team_id, water_level, temperature, humidity, ph_level, nutrient_ppm) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [team_id, waterLevel, temperature, humidity, phLevel, nutrient]
    );

    res.status(201).json({ message: 'Reading saved successfully.' });
  } catch (error) {
    console.error('insertReading error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── GET DEVICE CONTROLS BY TEAM ─────────────────────────
// Endpoint: GET /api/sensors/controls?team_id=1
const getDeviceControls = async (req, res) => {
  try {
    const { team_id } = req.query;

    if (!team_id) {
      return res.status(400).json({ message: 'team_id is required.' });
    }

    const [rows] = await db.query(
      'SELECT * FROM device_controls WHERE team_id = ?',
      [team_id]
    );
    res.json(rows);
  } catch (error) {
    console.error('getDeviceControls error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── UPDATE DEVICE CONTROL ────────────────────────────────
// Endpoint: PUT /api/sensors/controls/:id
// Body: { status } → 1 = ON, 0 = OFF
const updateDeviceControl = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (status === undefined) {
      return res.status(400).json({ message: 'Status is required.' });
    }

    await db.query(
      'UPDATE device_controls SET status = ? WHERE control_id = ?',
      [status, id]
    );

    res.json({ message: 'Device updated successfully.' });
  } catch (error) {
    console.error('updateDeviceControl error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  getLatestReading,
  getHistoricalReadings,
  insertReading,
  getDeviceControls,
  updateDeviceControl,
};