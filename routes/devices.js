const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

// Public — lahat pwedeng makita ang devices
router.get('/', verifyToken, deviceController.getAllDevices);
router.get('/team/:team_id', verifyToken, deviceController.getDevicesByTeam);
router.get('/:id', verifyToken, deviceController.getDeviceById);

// Protected — may team restriction
router.patch('/:id/control', verifyToken, deviceController.controlDevice);
router.put('/:id', verifyToken, deviceController.updateDevice);

// Admin only
router.post('/', verifyToken, isAdmin, deviceController.createDevice);
router.delete('/:id', verifyToken, isAdmin, deviceController.deleteDevice);

module.exports = router;