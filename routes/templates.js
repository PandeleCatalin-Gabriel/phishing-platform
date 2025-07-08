const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');
const { requireAuth } = require('../middleware/auth');

// Toate rutele necesită autentificare
router.use(requireAuth);

// Listare template-uri
router.get('/', templateController.listTemplates);

// Formular template nou
router.get('/new', templateController.showNewTemplateForm);

// Creare template
router.post('/new', templateController.createTemplate);

// Vizualizare template
router.get('/:id', templateController.viewTemplate);

// Preview template
router.get('/:id/preview', templateController.previewTemplate);

// Formular editare
router.get('/:id/edit', templateController.showEditForm);

// Actualizare template
router.post('/:id/edit', templateController.updateTemplate);

// Ștergere template
router.delete('/:id', templateController.deleteTemplate);

module.exports = router;