const Template = require('../models/Template');

// Listare template-uri
const listTemplates = async (req, res) => {
    try {
        const templates = await Template.findByUserId(req.session.user.id);
        
        res.render('templates/list', {
            title: 'Template-uri Email',
            templates
        });
    } catch (error) {
        console.error('Eroare la listarea template-urilor:', error);
        res.status(500).render('error', {
            title: 'Eroare',
            message: 'Nu am putut încărca template-urile'
        });
    }
};

// Afișare formular template nou
const showNewTemplateForm = (req, res) => {
    res.render('templates/new', {
        title: 'Template nou',
        campaignId: req.query.campaign || null,
        error: null
    });
};

// Creare template nou
const createTemplate = async (req, res) => {
    const { name, subject, html_content, text_content, campaignId } = req.body;

    // Validări
    if (!name || !subject || !html_content) {
        return res.render('templates/new', {
            title: 'Template nou',
            campaignId,
            error: 'Numele, subiectul și conținutul HTML sunt obligatorii'
        });
    }

    try {
        const templateId = await Template.create({
            user_id: req.session.user.id,
            name: name.trim(),
            subject: subject.trim(),
            html_content: html_content.trim(),
            text_content: text_content?.trim() || ''
        });

        if (campaignId) {
            res.redirect(`/campaigns/${campaignId}`);
        } else {
            res.redirect(`/templates/${templateId}`);
        }
    } catch (error) {
        console.error('Eroare la crearea template-ului:', error);
        res.render('templates/new', {
            title: 'Template nou',
            campaignId,
            error: 'Nu am putut crea template-ul. Vă rugăm încercați din nou.'
        });
    }
};

// Vizualizare template
const viewTemplate = async (req, res) => {
    try {
        const template = await Template.findById(req.params.id);
        
        if (!template) {
            return res.status(404).render('404', {
                title: 'Template negăsit'
            });
        }

        // Verifică dacă utilizatorul are acces
        if (template.user_id !== req.session.user.id) {
            return res.status(403).render('error', {
                title: 'Acces interzis',
                message: 'Nu aveți permisiunea de a vizualiza acest template'
            });
        }

        res.render('templates/view', {
            title: template.name,
            template
        });
    } catch (error) {
        console.error('Eroare la vizualizarea template-ului:', error);
        res.status(500).render('error', {
            title: 'Eroare',
            message: 'Nu am putut încărca template-ul'
        });
    }
};

// Afișare formular editare
const showEditForm = async (req, res) => {
    try {
        const template = await Template.findById(req.params.id);
        
        if (!template) {
            return res.status(404).render('404', {
                title: 'Template negăsit'
            });
        }

        if (template.user_id !== req.session.user.id) {
            return res.status(403).render('error', {
                title: 'Acces interzis',
                message: 'Nu aveți permisiunea de a edita acest template'
            });
        }

        res.render('templates/edit', {
            title: `Editare: ${template.name}`,
            template,
            error: null
        });
    } catch (error) {
        console.error('Eroare la editarea template-ului:', error);
        res.status(500).render('error', {
            title: 'Eroare',
            message: 'Nu am putut încărca template-ul'
        });
    }
};

// Actualizare template
const updateTemplate = async (req, res) => {
    try {
        const template = await Template.findById(req.params.id);
        
        if (!template) {
            return res.status(404).render('404', {
                title: 'Template negăsit'
            });
        }

        if (template.user_id !== req.session.user.id) {
            return res.status(403).render('error', {
                title: 'Acces interzis',
                message: 'Nu aveți permisiunea de a edita acest template'
            });
        }

        const { name, subject, html_content, text_content } = req.body;

        if (!name || !subject || !html_content) {
            return res.render('templates/edit', {
                title: `Editare: ${template.name}`,
                template,
                error: 'Numele, subiectul și conținutul HTML sunt obligatorii'
            });
        }

        await template.update({
            name: name.trim(),
            subject: subject.trim(),
            html_content: html_content.trim(),
            text_content: text_content?.trim() || ''
        });

        res.redirect(`/templates/${template.id}`);
    } catch (error) {
        console.error('Eroare la actualizarea template-ului:', error);
        res.status(500).render('error', {
            title: 'Eroare',
            message: 'Nu am putut actualiza template-ul'
        });
    }
};

// Ștergere template
const deleteTemplate = async (req, res) => {
    try {
        const template = await Template.findById(req.params.id);
        
        if (!template) {
            return res.status(404).json({ error: 'Template negăsit' });
        }

        if (template.user_id !== req.session.user.id) {
            return res.status(403).json({ error: 'Acces interzis' });
        }

        await template.delete();
        res.json({ success: true, message: 'Template șters cu succes' });
    } catch (error) {
        console.error('Eroare la ștergerea template-ului:', error);
        res.status(500).json({ error: 'Nu am putut șterge template-ul' });
    }
};

// Preview template
const previewTemplate = async (req, res) => {
    try {
        const template = await Template.findById(req.params.id);
        
        if (!template) {
            return res.status(404).send('Template negăsit');
        }

        if (template.user_id !== req.session.user.id) {
            return res.status(403).send('Acces interzis');
        }

        // Trimite doar conținutul HTML pentru preview
        res.send(template.html_content);
    } catch (error) {
        console.error('Eroare la preview template:', error);
        res.status(500).send('Eroare la încărcarea preview-ului');
    }
};

module.exports = {
    listTemplates,
    showNewTemplateForm,
    createTemplate,
    viewTemplate,
    showEditForm,
    updateTemplate,
    deleteTemplate,
    previewTemplate
};