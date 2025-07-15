const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');
const { requireAuth } = require('../middleware/auth');


router.use(requireAuth);


router.get('/', templateController.listTemplates);


router.get('/gallery', templateController.showGallery);


router.get('/create-preset', templateController.createFromPreset);


router.get('/new', templateController.showNewTemplateForm);


router.post('/new', templateController.createTemplate);


router.get('/:id', templateController.viewTemplate);


router.get('/:id/preview', templateController.previewTemplate);


router.get('/:id/edit', templateController.showEditForm);


router.post('/:id/edit', templateController.updateTemplate);


router.delete('/:id', templateController.deleteTemplate);

module.exports = router;