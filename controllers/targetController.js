const Target = require('../models/Target');
const Campaign = require('../models/Campaign');
const { runQuery } = require('../config/database');

// Afișare formular adăugare țintă
const showAddForm = async (req, res) => {
    const campaignId = req.query.campaign;
    
    if (!campaignId) {
        return res.redirect('/campaigns');
    }
    
    try {
        const campaign = await Campaign.findById(campaignId);
        
        if (!campaign || campaign.user_id !== req.session.user.id) {
            return res.status(403).render('error', {
                title: 'Acces interzis',
                message: 'Nu aveți acces la această campanie'
            });
        }
        
        res.render('targets/add', {
            title: 'Adaugă Țintă',
            campaignId,
            error: null
        });
    } catch (error) {
        console.error('Eroare:', error);
        res.redirect('/campaigns');
    }
};

// Adaugă țintă nouă
const addTarget = async (req, res) => {
    const { campaignId, email, first_name, last_name, position, company, addAnother } = req.body;
    
    try {
        // Verifică campania
        const campaign = await Campaign.findById(campaignId);
        
        if (!campaign || campaign.user_id !== req.session.user.id) {
            return res.status(403).render('error', {
                title: 'Acces interzis',
                message: 'Nu aveți acces la această campanie'
            });
        }
        
        // Creează ținta
        await Target.create({
            campaign_id: campaignId,
            email: email.trim(),
            first_name: first_name?.trim() || '',
            last_name: last_name?.trim() || '',
            position: position?.trim() || '',
            company: company?.trim() || ''
        });
        
        if (addAnother) {
            res.render('targets/add', {
                title: 'Adaugă Țintă',
                campaignId,
                error: null,
                success: 'Țintă adăugată cu succes!'
            });
        } else {
            res.redirect(`/targets/campaign/${campaignId}`);
        }
    } catch (error) {
        console.error('Eroare la adăugarea țintei:', error);
        res.render('targets/add', {
            title: 'Adaugă Țintă',
            campaignId,
            error: 'Email-ul există deja sau a apărut o eroare'
        });
    }
};

// Listare ținte pentru o campanie
const listTargets = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.campaignId);
        
        if (!campaign) {
            return res.status(404).render('404', {
                title: 'Campanie negăsită'
            });
        }

        if (campaign.user_id !== req.session.user.id) {
            return res.status(403).render('error', {
                title: 'Acces interzis',
                message: 'Nu aveți permisiunea de a vizualiza această campanie'
            });
        }

        const targets = await Target.findByCampaignId(campaign.id);

        res.render('targets/list', {
            title: `Ținte - ${campaign.name}`,
            campaign,
            targets
        });
    } catch (error) {
        console.error('Eroare la listarea țintelor:', error);
        res.status(500).render('error', {
            title: 'Eroare',
            message: 'Nu am putut încărca lista de ținte'
        });
    }
};

// Ștergere țintă
const deleteTarget = async (req, res) => {
    try {
        const target = await Target.findById(req.params.id);
        
        if (!target) {
            return res.status(404).json({ error: 'Țintă negăsită' });
        }
        
        // Verifică dacă utilizatorul are acces
        const campaign = await Campaign.findById(target.campaign_id);
        if (!campaign || campaign.user_id !== req.session.user.id) {
            return res.status(403).json({ error: 'Acces interzis' });
        }
        
        await runQuery('DELETE FROM targets WHERE id = ?', [target.id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Eroare la ștergerea țintei:', error);
        res.status(500).json({ error: 'Nu am putut șterge ținta' });
    }
};

// Pagină temporară pentru import
const showImportPage = (req, res) => {
    const campaignId = req.query.campaign;
    res.redirect(`/targets/add?campaign=${campaignId}`);
};

// Import fictiv
const importTargets = (req, res) => {
    const campaignId = req.body.campaignId || req.query.campaign;
    res.redirect(`/targets/add?campaign=${campaignId}`);
};

module.exports = {
    showAddForm,
    addTarget,
    listTargets,
    deleteTarget,
    showImportPage,
    importTargets,
    upload: (req, res, next) => next() // Placeholder pentru multer
};