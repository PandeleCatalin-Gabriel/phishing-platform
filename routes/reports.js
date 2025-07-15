const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { requireAuth } = require('../middleware/auth');


router.use(requireAuth);


router.get('/', reportController.showReports);


router.get('/campaign/:id', reportController.campaignReport);

module.exports = router;