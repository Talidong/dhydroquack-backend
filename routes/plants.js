const express = require('express');
const router = express.Router();
const plantController = require('../controllers/plantController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

// Lahat pwedeng mag-view
router.get('/', verifyToken, plantController.getAllPlants);
router.get('/team/:teamId', verifyToken, plantController.getPlantsByTeam);
router.get('/:id', verifyToken, plantController.getPlantById);

// Admin only — add, edit, delete
router.post('/', verifyToken, isAdmin, plantController.createPlant);
router.put('/:id', verifyToken, isAdmin, plantController.updatePlant);
router.delete('/:id', verifyToken, isAdmin, plantController.deletePlant);

module.exports = router;