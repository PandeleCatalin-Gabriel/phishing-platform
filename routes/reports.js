const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { requireAuth } = require('../middleware/auth');

// Toate rutele necesită autentificare
router.use(requireAuth);

// Dashboard rapoarte
router.get('/', reportController.showReports);

// Raport individual campanie
router.get('/campaign/:id', reportController.campaignReport);

module.exports = router;