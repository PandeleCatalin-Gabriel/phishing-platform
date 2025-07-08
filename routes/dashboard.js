const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { requireAuth } = require('../middleware/auth');

// Toate rutele de dashboard necesită autentificare
router.use(requireAuth);

// Dashboard principal
router.get('/', dashboardController.showDashboard);

module.exports = router;