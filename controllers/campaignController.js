const Campaign = require('../models/Campaign');
const User = require('../models/User');
const { runQuery } = require('../config/database');

// Afișare toate campaniile
const listCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaign.findByUserId(req.session.user.id);
        
        res.render('campaigns/list', {
            title: 'Campaniile mele',
            campaigns
        });
    } catch (error) {
        console.error('Eroare la listarea campaniilor:', error);
        res.status(500).render('error', {
            title: 'Eroare',
            message: 'Nu am putut încărca campaniile'
        });
    }
};

// Afișare formular campanie nouă
const showNewCampaignForm = (req, res) => {
    res.render('campaigns/new', {
        title: 'Campanie nouă',
        error: null
    });
};

// Creare campanie nouă
const createCampaign = async (req, res) => {
    const { name, description } = req.body;

    // Validări
    if (!name || name.trim().length === 0) {
        return res.render('campaigns/new', {
            title: 'Campanie nouă',
            error: 'Numele campaniei este obligatoriu'
        });
    }

    try {
        const campaignId = await Campaign.create({
            user_id: req.session.user.id,
            name: name.trim(),
            description: description?.trim() || ''
        });

        res.redirect(`/campaigns/${campaignId}`);
    } catch (error) {
        console.error('Eroare la crearea campaniei:', error);
        res.render('campaigns/new', {
            title: 'Campanie nouă',
            error: 'Nu am putut crea campania. Vă rugăm încercați din nou.'
        });
    }
};

// Vizualizare detalii campanie
const viewCampaign = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);
        
        if (!campaign) {
            return res.status(404).render('404', {
                title: 'Campanie negăsită'
            });
        }

        // Verifică dacă utilizatorul are acces
        if (campaign.user_id !== req.session.user.id) {
            return res.status(403).render('error', {
                title: 'Acces interzis',
                message: 'Nu aveți permisiunea de a vizualiza această campanie'
            });
        }

        const stats = await campaign.getStats();

        res.render('campaigns/view', {
            title: campaign.name,
            campaign,
            stats
        });
    } catch (error) {
        console.error('Eroare la vizualizarea campaniei:', error);
        res.status(500).render('error', {
            title: 'Eroare',
            message: 'Nu am putut încărca campania'
        });
    }
};

// Afișare formular editare
const showEditForm = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);
        
        if (!campaign) {
            return res.status(404).render('404', {
                title: 'Campanie negăsită'
            });
        }

        if (!campaign.canBeEditedBy(req.session.user.id)) {
            return res.status(403).render('error', {
                title: 'Acces interzis',
                message: 'Nu puteți edita această campanie'
            });
        }

        res.render('campaigns/edit', {
            title: `Editare: ${campaign.name}`,
            campaign,
            error: null
        });
    } catch (error) {
        console.error('Eroare la editarea campaniei:', error);
        res.status(500).render('error', {
            title: 'Eroare',
            message: 'Nu am putut încărca campania'
        });
    }
};

// Actualizare campanie
const updateCampaign = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);
        
        if (!campaign) {
            return res.status(404).render('404', {
                title: 'Campanie negăsită'
            });
        }

        if (!campaign.canBeEditedBy(req.session.user.id)) {
            return res.status(403).render('error', {
                title: 'Acces interzis',
                message: 'Nu puteți edita această campanie'
            });
        }

        const { name, description } = req.body;

        if (!name || name.trim().length === 0) {
            return res.render('campaigns/edit', {
                title: `Editare: ${campaign.name}`,
                campaign,
                error: 'Numele campaniei este obligatoriu'
            });
        }

        await campaign.update({
            name: name.trim(),
            description: description?.trim() || ''
        });

        res.redirect(`/campaigns/${campaign.id}`);
    } catch (error) {
        console.error('Eroare la actualizarea campaniei:', error);
        res.status(500).render('error', {
            title: 'Eroare',
            message: 'Nu am putut actualiza campania'
        });
    }
};

// Lansare campanie cu frecvență
const launchCampaign = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);
        
        if (!campaign) {
            return res.status(404).json({ error: 'Campanie negăsită' });
        }

        if (campaign.user_id !== req.session.user.id) {
            return res.status(403).json({ error: 'Acces interzis' });
        }

        if (!campaign.canBeLaunched()) {
            return res.status(400).json({ error: 'Campania nu poate fi lansată' });
        }

        // Verifică dacă are template și ținte
        const stats = await campaign.getStats();
        if (stats.totalTargets === 0) {
            return res.status(400).json({ error: 'Adaugă ținte înainte de a lansa campania' });
        }
        
        if (!campaign.template_id) {
            return res.status(400).json({ error: 'Selectează un template înainte de a lansa campania' });
        }

        const frequency = req.body.frequency || 30;
        
        // Actualizează campania cu frecvența
        await runQuery(
            'UPDATE campaigns SET status = "active", launched_at = CURRENT_TIMESTAMP, frequency = ? WHERE id = ?',
            [frequency, campaign.id]
        );
        
        res.json({ success: true, message: `Campanie lansată! Email-urile vor fi trimise la fiecare ${frequency} minute.` });
    } catch (error) {
        console.error('Eroare la lansarea campaniei:', error);
        res.status(500).json({ error: 'Nu am putut lansa campania' });
    }
};

// Oprire campanie
const stopCampaign = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);
        
        if (!campaign) {
            return res.status(404).json({ error: 'Campanie negăsită' });
        }

        if (campaign.user_id !== req.session.user.id) {
            return res.status(403).json({ error: 'Acces interzis' });
        }

        if (campaign.status !== 'active') {
            return res.status(400).json({ error: 'Campania nu este activă' });
        }

        await campaign.complete();
        res.json({ success: true, message: 'Campanie oprită cu succes' });
    } catch (error) {
        console.error('Eroare la oprirea campaniei:', error);
        res.status(500).json({ error: 'Nu am putut opri campania' });
    }
};

// Ștergere campanie
const deleteCampaign = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);
        
        if (!campaign) {
            return res.status(404).json({ error: 'Campanie negăsită' });
        }

        if (campaign.user_id !== req.session.user.id) {
            return res.status(403).json({ error: 'Acces interzis' });
        }

        await campaign.delete();
        res.json({ success: true, message: 'Campanie ștearsă cu succes' });
    } catch (error) {
        console.error('Eroare la ștergerea campaniei:', error);
        res.status(500).json({ error: 'Nu am putut șterge campania' });
    }
};

// Afișare selector de template
const showTemplateSelector = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);
        
        if (!campaign) {
            return res.status(404).render('404', {
                title: 'Campanie negăsită'
            });
        }

        if (campaign.user_id !== req.session.user.id) {
            return res.status(403).render('error', {
                title: 'Acces interzis',
                message: 'Nu aveți permisiunea pentru această campanie'
            });
        }

        res.render('templates/selector', {
            title: 'Alege Template',
            campaign
        });
    } catch (error) {
        console.error('Eroare:', error);
        res.redirect('/campaigns');
    }
};

// Setare template pentru campanie
const setTemplate = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);
        
        if (!campaign) {
            return res.status(404).json({ error: 'Campanie negăsită' });
        }

        if (campaign.user_id !== req.session.user.id) {
            return res.status(403).json({ error: 'Acces interzis' });
        }

        const { template } = req.body;
        
        // Mapare template la ID
        const templateMap = {
            'instagram': 1,
            'facebook': 2,
            'gmail': 3
        };
        
        const templateId = templateMap[template] || 1;

        await runQuery(
            'UPDATE campaigns SET template_id = ? WHERE id = ?',
            [templateId, campaign.id]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Eroare la setarea template-ului:', error);
        res.status(500).json({ error: 'Nu am putut seta template-ul' });
    }
};

module.exports = {
    listCampaigns,
    showNewCampaignForm,
    createCampaign,
    viewCampaign,
    showEditForm,
    updateCampaign,
    launchCampaign,
    stopCampaign,
    showTemplateSelector,
    setTemplate,
    deleteCampaign
};