const Target = require('../models/Target');
const Campaign = require('../models/Campaign');
const multer = require('multer');
const csv = require('csv-parse');
const fs = require('fs').promises;

// Configurare multer pentru upload
const upload = multer({
    dest: 'uploads/',
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
            cb(null, true);
        } else {
            cb(new Error('Doar fișiere CSV sunt acceptate'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

// Afișare pagină import
const showImportPage = async (req, res) => {
    try {
        const campaignId = req.query.campaign;
        let campaign = null;
        
        if (campaignId) {
            campaign = await Campaign.findById(campaignId);
            if (campaign && campaign.user_id !== req.session.user.id) {
                campaign = null;
            }
        }
        
        const campaigns = await Campaign.findByUserId(req.session.user.id);
        
        res.render('targets/import', {
            title: 'Import ținte',
            campaign,
            campaigns,
            error: null,
            success: null
        });
    } catch (error) {
        console.error('Eroare la afișarea paginii de import:', error);
        res.status(500).render('error', {
            title: 'Eroare',
            message: 'Nu am putut încărca pagina de import'
        });
    }
};

// Procesare import CSV
const importTargets = async (req, res) => {
    if (!req.file) {
        const campaigns = await Campaign.findByUserId(req.session.user.id);
        return res.render('targets/import', {
            title: 'Import ținte',
            campaign: null,
            campaigns,
            error: 'Vă rugăm selectați un fișier CSV',
            success: null
        });
    }

    try {
        const { campaignId } = req.body;
        
        if (!campaignId) {
            await fs.unlink(req.file.path);
            const campaigns = await Campaign.findByUserId(req.session.user.id);
            return res.render('targets/import', {
                title: 'Import ținte',
                campaign: null,
                campaigns,
                error: 'Vă rugăm selectați o campanie',
                success: null
            });
        }

        // Verifică dacă utilizatorul are acces la campanie
        const campaign = await Campaign.findById(campaignId);
        if (!campaign || campaign.user_id !== req.session.user.id) {
            await fs.unlink(req.file.path);
            return res.status(403).render('error', {
                title: 'Acces interzis',
                message: 'Nu aveți permisiunea pentru această campanie'
            });
        }

        // Citește și parsează CSV
        const fileContent = await fs.readFile(req.file.path, 'utf-8');
        const targets = [];

        // Parsează CSV
        const parser = csv.parse({
            columns: true,
            skip_empty_lines: true,
            trim: true
        });

        parser.on('readable', function() {
            let record;
            while (record = parser.read()) {
                targets.push({
                    email: record.email || record.Email || record.EMAIL,
                    first_name: record.first_name || record.firstName || record['First Name'] || '',
                    last_name: record.last_name || record.lastName || record['Last Name'] || '',
                    position: record.position || record.Position || record.title || '',
                    company: record.company || record.Company || record.organization || ''
                });
            }
        });

        parser.on('error', async (err) => {
            await fs.unlink(req.file.path);
            const campaigns = await Campaign.findByUserId(req.session.user.id);
            res.render('targets/import', {
                title: 'Import ținte',
                campaign,
                campaigns,
                error: 'Eroare la parsarea fișierului CSV: ' + err.message,
                success: null
            });
        });

        parser.on('end', async () => {
            // Șterge fișierul uploadat
            await fs.unlink(req.file.path);

            // Validează că avem ținte
            const validTargets = targets.filter(t => t.email && t.email.includes('@'));
            
            if (validTargets.length === 0) {
                const campaigns = await Campaign.findByUserId(req.session.user.id);
                return res.render('targets/import', {
                    title: 'Import ținte',
                    campaign,
                    campaigns,
                    error: 'Nu s-au găsit adrese de email valide în fișier',
                    success: null
                });
            }

            // Importă țintele
            const results = await Target.bulkCreate(campaignId, validTargets);
            const successCount = results.filter(r => r.success).length;
            const campaigns = await Campaign.findByUserId(req.session.user.id);

            res.render('targets/import', {
                title: 'Import ținte',
                campaign,
                campaigns,
                error: null,
                success: `Import finalizat! ${successCount} din ${validTargets.length} ținte au fost importate cu succes.`
            });
        });

        parser.write(fileContent);
        parser.end();

    } catch (error) {
        console.error('Eroare la import:', error);
        if (req.file) {
            await fs.unlink(req.file.path).catch(() => {});
        }
        const campaigns = await Campaign.findByUserId(req.session.user.id);
        res.render('targets/import', {
            title: 'Import ținte',
            campaign: null,
            campaigns,
            error: 'Eroare la procesarea fișierului',
            success: null
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

module.exports = {
    upload: upload.single('csvFile'),
    showImportPage,
    importTargets,
    listTargets
};