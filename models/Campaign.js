const { runQuery, getOne, getAll } = require('../config/database');

class Campaign {
    constructor(data) {
        this.id = data.id;
        this.user_id = data.user_id;
        this.name = data.name;
        this.description = data.description;
        this.status = data.status || 'draft';
        this.created_at = data.created_at;
        this.launched_at = data.launched_at;
        this.completed_at = data.completed_at;
    }

    // Creare campanie nouă
    static async create(campaignData) {
        const { user_id, name, description } = campaignData;
        
        const sql = `
            INSERT INTO campaigns (user_id, name, description, status)
            VALUES (?, ?, ?, 'draft')
        `;
        
        const result = await runQuery(sql, [user_id, name, description]);
        return result.id;
    }

    // Găsește campanie după ID
    static async findById(id) {
        const sql = 'SELECT * FROM campaigns WHERE id = ?';
        const campaignData = await getOne(sql, [id]);
        return campaignData ? new Campaign(campaignData) : null;
    }

    // Găsește toate campaniile unui utilizator
    static async findByUserId(userId) {
        const sql = `
            SELECT * FROM campaigns 
            WHERE user_id = ? 
            ORDER BY created_at DESC
        `;
        const campaigns = await getAll(sql, [userId]);
        return campaigns.map(c => new Campaign(c));
    }

    // Actualizare campanie
    async update(updateData) {
        const allowedFields = ['name', 'description', 'status'];
        const updates = [];
        const values = [];

        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                updates.push(`${field} = ?`);
                values.push(updateData[field]);
            }
        }

        if (updates.length === 0) return false;

        values.push(this.id);
        const sql = `UPDATE campaigns SET ${updates.join(', ')} WHERE id = ?`;
        
        await runQuery(sql, values);
        return true;
    }

    // Lansare campanie
    async launch() {
        const sql = `
            UPDATE campaigns 
            SET status = 'active', launched_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `;
        await runQuery(sql, [this.id]);
        this.status = 'active';
        this.launched_at = new Date();
    }

    // Finalizare campanie
    async complete() {
        const sql = `
            UPDATE campaigns 
            SET status = 'completed', completed_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `;
        await runQuery(sql, [this.id]);
        this.status = 'completed';
        this.completed_at = new Date();
    }

    // Ștergere campanie
    async delete() {
        const sql = 'DELETE FROM campaigns WHERE id = ?';
        await runQuery(sql, [this.id]);
    }

    // Obține statistici campanie
    async getStats() {
        const stats = {};
        
        // Total ținte
        const targets = await getOne(
            'SELECT COUNT(*) as count FROM targets WHERE campaign_id = ?',
            [this.id]
        );
        stats.totalTargets = targets.count;

        // Email-uri trimise
        const sent = await getOne(
            'SELECT COUNT(*) as count FROM targets WHERE campaign_id = ? AND status = "sent"',
            [this.id]
        );
        stats.emailsSent = sent.count;

        // Email-uri deschise
        const opened = await getOne(
            'SELECT COUNT(*) as count FROM targets WHERE campaign_id = ? AND opened_at IS NOT NULL',
            [this.id]
        );
        stats.emailsOpened = opened.count;

        // Click-uri
        const clicked = await getOne(
            'SELECT COUNT(*) as count FROM targets WHERE campaign_id = ? AND clicked_at IS NOT NULL',
            [this.id]
        );
        stats.linksClicked = clicked.count;

        // Calculează rate
        stats.openRate = stats.emailsSent > 0 
            ? Math.round((stats.emailsOpened / stats.emailsSent) * 100) 
            : 0;
        
        stats.clickRate = stats.emailsSent > 0 
            ? Math.round((stats.linksClicked / stats.emailsSent) * 100) 
            : 0;

        return stats;
    }

    // Verifică dacă utilizatorul poate edita campania
    canBeEditedBy(userId) {
        return this.user_id === userId && this.status === 'draft';
    }

    // Verifică dacă campania poate fi lansată
    canBeLaunched() {
        return this.status === 'draft';
    }
}

module.exports = Campaign;