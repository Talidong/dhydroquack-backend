const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensorController');

// 1. Unahin ang mga static at specific routes para hindi sila makain ng /:id
router.get('/latest', sensorController.getLatestReading); //
router.get('/range', sensorController.getReadingsByDateRange); //

// 2. Dynamic parameter route (Dapat laging nasa ilalim ng static routes)
router.get('/:id', sensorController.getReadingById); //

// 3. Lahat ng GET logs
router.get('/', sensorController.getAllReadings); //

// 4. POST Routes para sa ESP32
router.post('/', sensorController.createReading); //
router.post('/water-level', sensorController.createWaterLevelReading); // Idinagdag para magamit ang controller function mo!

module.exports = router; //