const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/trackingController');


router.get('/open/:trackingId', trackingController.trackOpen);


router.get('/click/:trackingId', trackingController.trackClick);


router.post('/submit/:trackingId', trackingController.submitPhishing);


router.post('/webhook', trackingController.webhook);

module.exports = router;