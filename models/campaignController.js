const Campaign = require('../models/Campaign');
const User = require('../models/User');


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


const showNewCampaignForm = (req, res) => {
    res.render('campaigns/new', {
        title: 'Campanie nouă',
        error: null
    });
};


const createCampaign = async (req, res) => {
    const { name, description } = req.body;

   
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

        await campaign.launch();
        res.json({ success: true, message: 'Campanie lansată cu succes' });
    } catch (error) {
        console.error('Eroare la lansarea campaniei:', error);
        res.status(500).json({ error: 'Nu am putut lansa campania' });
    }
};


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

module.exports = {
    listCampaigns,
    showNewCampaignForm,
    createCampaign,
    viewCampaign,
    showEditForm,
    updateCampaign,
    launchCampaign,
    deleteCampaign
};