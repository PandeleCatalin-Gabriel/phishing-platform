const express = require('express');
const router = express.Router();
const targetController = require('../controllers/targetController');
const { requireAuth } = require('../middleware/auth');

// Toate rutele necesită autentificare
router.use(requireAuth);

// Pagină import
router.get('/import', targetController.showImportPage);

// Procesare import
router.post('/import', targetController.upload, targetController.importTargets);

// Listare ținte pentru o campanie
router.get('/campaign/:campaignId', targetController.listTargets);

module.exports = router;