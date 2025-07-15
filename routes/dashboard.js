const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);


router.get('/', dashboardController.showDashboard);

module.exports = router;