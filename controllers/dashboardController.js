const User = require('../models/User');

const showDashboard = async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id);
        const stats = await user.getStats();
        const recentCampaigns = await user.getCampaigns();

        res.render('dashboard', {
            title: 'Dashboard',
            stats,
            recentCampaigns: recentCampaigns.slice(0, 5) // Ultimele 5 campanii
        });
    } catch (error) {
        console.error('Eroare la încărcarea dashboard-ului:', error);
        res.status(500).render('error', {
            title: 'Eroare',
            message: 'Eroare la încărcarea dashboard-ului'
        });
    }
};

module.exports = {
    showDashboard
};