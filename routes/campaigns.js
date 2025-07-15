const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');
const { requireAuth } = require('../middleware/auth');


router.use(requireAuth);


router.get('/', campaignController.listCampaigns);


router.get('/new', campaignController.showNewCampaignForm);


router.post('/new', campaignController.createCampaign);


router.get('/:id', campaignController.viewCampaign);


router.get('/:id/edit', campaignController.showEditForm);


router.post('/:id/edit', campaignController.updateCampaign);


router.get('/:id/select-template', campaignController.showTemplateSelector);


router.post('/:id/launch', campaignController.launchCampaign);
router.post('/:id/stop', campaignController.stopCampaign);
router.post('/:id/set-template', campaignController.setTemplate);
router.delete('/:id', campaignController.deleteCampaign);

module.exports = router;