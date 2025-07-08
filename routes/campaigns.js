const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');
const { requireAuth } = require('../middleware/auth');

// Toate rutele necesită autentificare
router.use(requireAuth);

// Listare campanii
router.get('/', campaignController.listCampaigns);

// Formular campanie nouă
router.get('/new', campaignController.showNewCampaignForm);

// Creare campanie
router.post('/new', campaignController.createCampaign);

// Vizualizare campanie
router.get('/:id', campaignController.viewCampaign);

// Formular editare
router.get('/:id/edit', campaignController.showEditForm);

// Actualizare campanie
router.post('/:id/edit', campaignController.updateCampaign);

// API endpoints
router.post('/:id/launch', campaignController.launchCampaign);
router.delete('/:id', campaignController.deleteCampaign);

module.exports = router;