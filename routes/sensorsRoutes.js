// backend/routes/sensorRoutes.js
const express = require('express');
const router = express.Router();
const {
  getLatestReading,
  getHistoricalReadings,
  insertReading,
  getDeviceControls,
  updateDeviceControl,
} = require('../controllers/sensorController');

// ─── Sensor Readings ──────────────────────────────────────
// GET  /api/sensors/latest      → pinakabagong reading
// GET  /api/sensors/history     → historical data para sa graph
// POST /api/sensors/readings    → mag-save ng bagong reading (hardware)

router.get('/latest', getLatestReading);
router.get('/history', getHistoricalReadings);
router.post('/readings', insertReading);

// ─── Device Controls ─────────────────────────────────────
// GET /api/sensors/controls     → lahat ng devices at status nila
// PUT /api/sensors/controls/:id → i-update ang status ng device

router.get('/controls', getDeviceControls);
router.put('/controls/:id', updateDeviceControl);

module.exports = router;