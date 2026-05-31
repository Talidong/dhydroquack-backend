// backend/controllers/sensorController.js
const db = require('../config/database');

// ─── GET LATEST READING ───────────────────────────────────
// Endpoint: GET /api/sensors/latest
// Ginagamit: para sa current readings cards sa Analytics screen
// Ibinabalik: pinakabagong sensor reading
const getLatestReading = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM sensor_readings 
       ORDER BY timestamp DESC 
       LIMIT 1`
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No readings found.' });
    }

    // I-format ang data para madaling gamitin sa frontend
    const reading = rows[0];
    res.json({
      readingId: reading.reading_id,
      timestamp: reading.timestamp,
      waterLevel: parseFloat(reading.water_level),
      temperature: parseFloat(reading.temperature),
      humidity: parseFloat(reading.humidity),
      phLevel: parseFloat(reading.ph_level),
      nutrient: parseFloat(reading.nutrient_ppm),
    });
  } catch (error) {
    console.error('getLatestReading error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── GET HISTORICAL DATA ──────────────────────────────────
// Endpoint: GET /api/sensors/history?limit=7
// Ginagamit: para sa line charts sa Analytics screen
// Ibinabalik: last N readings para sa graph
const getHistoricalReadings = async (req, res) => {
  try {
    // Pwedeng mag-specify ng limit sa query param, default 7
    const limit = parseInt(req.query.limit) || 7;

    const [rows] = await db.query(
      `SELECT * FROM sensor_readings 
       ORDER BY timestamp DESC 
       LIMIT ?`,
      [limit]
    );

    // Reverse para maging chronological order (oldest to newest)
    const reversed = rows.reverse();

    // I-format para sa chart — kailangan ng labels at data arrays
    const result = {
      labels: reversed.map((r) => {
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
// Ginagamit: ng hardware/sensor para mag-save ng bagong data
// Body: { waterLevel, temperature, humidity, phLevel, nutrient }
const insertReading = async (req, res) => {
  try {
    const { waterLevel, temperature, humidity, phLevel, nutrient } = req.body;

    // Basic validation
    if (
      waterLevel === undefined || temperature === undefined ||
      humidity === undefined || phLevel === undefined || nutrient === undefined
    ) {
      return res.status(400).json({ message: 'All sensor values are required.' });
    }

    await db.query(
      `INSERT INTO sensor_readings 
       (water_level, temperature, humidity, ph_level, nutrient_ppm) 
       VALUES (?, ?, ?, ?, ?)`,
      [waterLevel, temperature, humidity, phLevel, nutrient]
    );

    res.status(201).json({ message: 'Reading saved successfully.' });
  } catch (error) {
    console.error('insertReading error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── GET ALL DEVICE CONTROLS ──────────────────────────────
// Endpoint: GET /api/sensors/controls
// Ginagamit: para makita ang status ng bawat device
const getDeviceControls = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM device_controls');
    res.json(rows);
  } catch (error) {
    console.error('getDeviceControls error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── UPDATE DEVICE CONTROL ────────────────────────────────
// Endpoint: PUT /api/sensors/controls/:id
// Ginagamit: para i-on/off ang device
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