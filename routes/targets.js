const express = require('express');
const router = express.Router();
const targetController = require('../controllers/targetController');
const { requireAuth } = require('../middleware/auth');

// Toate rutele necesită autentificare
router.use(requireAuth);

// Pagină import (redirect către add)
router.get('/import', (req, res) => {
    const campaign = req.query.campaign;
    res.redirect(`/targets/add?campaign=${campaign}`);
});

// Formular adăugare țintă
router.get('/add', targetController.showAddForm);

// Procesare adăugare țintă
router.post('/add', targetController.addTarget);

// Listare ținte pentru o campanie
router.get('/campaign/:campaignId', targetController.listTargets);

// Ștergere țintă
router.delete('/:id', targetController.deleteTarget);

module.exports = router;.showImportPage);

// Procesare import
router.post('/import', targetController.upload, targetController.importTargets);

// Listare ținte pentru o campanie
router.get('/campaign/:campaignId', targetController.listTargets);

module.exports = router;