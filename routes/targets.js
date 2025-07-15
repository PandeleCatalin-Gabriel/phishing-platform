const express = require('express');
const router = express.Router();
const targetController = require('../controllers/targetController');
const { requireAuth } = require('../middleware/auth');


router.use(requireAuth);


router.get('/import', targetController.showImportPage);


router.get('/add', targetController.showAddForm);


router.post('/add', targetController.addTarget);


router.get('/campaign/:campaignId', targetController.listTargets);


router.delete('/:id', targetController.deleteTarget);


router.post('/import', targetController.upload, targetController.importTargets);

module.exports = router;