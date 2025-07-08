const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/trackingController');

// Tracking deschidere email (pixel invizibil)
router.get('/open/:trackingId', trackingController.trackOpen);

// Tracking click pe link
router.get('/click/:trackingId', trackingController.trackClick);

// Webhook pentru notificări
router.post('/webhook', trackingController.webhook);

module.exports = router;