const Campaign = require('../models/Campaign');
const Target = require('../models/Target');
const { getAll } = require('../config/database');

// Dashboard rapoarte
const showReports = async (req, res) => {
    try {
        const userId = req.session.user.id;
        
        // Statistici generale
        const campaigns = await Campaign.findByUserId(userId);
        const totalCampaigns = campaigns.length;
        const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
        const completedCampaigns = campaigns.filter(c => c.status === 'completed').length;
        
        // Statistici ținte
        let totalTargets = 0;
        let totalSent = 0;
        let totalOpened = 0;
        let totalClicked = 0;
        
        for (const campaign of campaigns) {
            const targets = await Target.findByCampaignId(campaign.id);
            totalTargets += targets.length;
            totalSent += targets.filter(t => t.sent_at).length;
            totalOpened += targets.filter(t => t.opened_at).length;
            totalClicked += targets.filter(t => t.clicked_at).length;
        }
        
        // Calculează rate
        const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;
        const clickRate = totalSent > 0 ? Math.round((totalClicked / totalSent) * 100) : 0;
        
        // Cele mai recente evenimente
        const recentEvents = await getAll(`
            SELECT 
                te.event_type,
                te.timestamp,
                t.email,
                c.name as campaign_name
            FROM tracking_events te
            JOIN targets t ON te.target_id = t.id
            JOIN campaigns c ON t.campaign_id = c.id
            WHERE c.user_id = ?
            ORDER BY te.timestamp DESC
            LIMIT 10
        `, [userId]);
        
        // Performanța campaniilor
        const campaignStats = [];
        for (const campaign of campaigns) {
            const stats = await campaign.getStats();
            campaignStats.push({
                id: campaign.id,
                name: campaign.name,
                status: campaign.status,
                ...stats
            });
        }
        
        res.render('reports/dashboard', {
            title: 'Rapoarte și Analize',
            stats: {
                totalCampaigns,
                activeCampaigns,
                completedCampaigns,
                totalTargets,
                totalSent,
                totalOpened,
                totalClicked,
                openRate,
                clickRate
            },
            recentEvents,
            campaignStats
        });
    } catch (error) {
        console.error('Eroare la generarea rapoartelor:', error);
        res.status(500).render('error', {
            title: 'Eroare',
            message: 'Nu am putut genera rapoartele'
        });
    }
};

// Raport detaliat campanie
const campaignReport = async (req, res) => {
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
                message: 'Nu aveți permisiunea de a vizualiza acest raport'
            });
        }
        
        const stats = await campaign.getStats();
        const targets = await Target.findByCampaignId(campaign.id);
        
        // Grupează țintele pe status
        const targetsByStatus = {
            pending: targets.filter(t => t.status === 'pending'),
            sent: targets.filter(t => t.status === 'sent'),
            opened: targets.filter(t => t.status === 'opened'),
            clicked: targets.filter(t => t.status === 'clicked')
        };
        
        // Timeline evenimente
        const events = await getAll(`
            SELECT 
                te.*,
                t.email
            FROM tracking_events te
            JOIN targets t ON te.target_id = t.id
            WHERE t.campaign_id = ?
            ORDER BY te.timestamp DESC
        `, [campaign.id]);
        
        res.render('reports/campaign', {
            title: `Raport: ${campaign.name}`,
            campaign,
            stats,
            targetsByStatus,
            events
        });
    } catch (error) {
        console.error('Eroare la generarea raportului:', error);
        res.status(500).render('error', {
            title: 'Eroare',
            message: 'Nu am putut genera raportul'
        });
    }
};

module.exports = {
    showReports,
    campaignReport
};