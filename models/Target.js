const { runQuery, getOne, getAll } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Target {
    constructor(data) {
        this.id = data.id;
        this.campaign_id = data.campaign_id;
        this.email = data.email;
        this.first_name = data.first_name;
        this.last_name = data.last_name;
        this.position = data.position;
        this.company = data.company;
        this.custom_attributes = data.custom_attributes;
        this.status = data.status || 'pending';
        this.sent_at = data.sent_at;
        this.opened_at = data.opened_at;
        this.clicked_at = data.clicked_at;
        this.tracking_id = data.tracking_id;
    }

    
    static async create(targetData) {
        const {
            campaign_id,
            email,
            first_name,
            last_name,
            position,
            company,
            custom_attributes
        } = targetData;

        const tracking_id = uuidv4();
        
        const sql = `
            INSERT INTO targets (
                campaign_id, email, first_name, last_name, 
                position, company, custom_attributes, tracking_id
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const result = await runQuery(sql, [
            campaign_id,
            email,
            first_name || '',
            last_name || '',
            position || '',
            company || '',
            custom_attributes || '{}',
            tracking_id
        ]);
        
        return result.id;
    }

   
    static async bulkCreate(campaignId, targets) {
        const results = [];
        
        for (const target of targets) {
            try {
                const id = await Target.create({
                    campaign_id: campaignId,
                    ...target
                });
                results.push({ success: true, id, email: target.email });
            } catch (error) {
                results.push({ 
                    success: false, 
                    email: target.email, 
                    error: error.message 
                });
            }
        }
        
        return results;
    }

  
    static async findById(id) {
        const sql = 'SELECT * FROM targets WHERE id = ?';
        const targetData = await getOne(sql, [id]);
        return targetData ? new Target(targetData) : null;
    }

   
    static async findByTrackingId(trackingId) {
        const sql = 'SELECT * FROM targets WHERE tracking_id = ?';
        const targetData = await getOne(sql, [trackingId]);
        return targetData ? new Target(targetData) : null;
    }

   
    static async findByCampaignId(campaignId) {
        const sql = `
            SELECT * FROM targets 
            WHERE campaign_id = ? 
            ORDER BY id ASC
        `;
        const targets = await getAll(sql, [campaignId]);
        return targets.map(t => new Target(t));
    }

 
    async markAsSent() {
        const sql = `
            UPDATE targets 
            SET status = 'sent', sent_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `;
        await runQuery(sql, [this.id]);
        this.status = 'sent';
        this.sent_at = new Date();
    }

 
    async markAsOpened(ipAddress, userAgent) {
        if (!this.opened_at) {
            const sql = `
                UPDATE targets 
                SET status = 'opened', opened_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            `;
            await runQuery(sql, [this.id]);
            this.status = 'opened';
            this.opened_at = new Date();

         
            await this.logEvent('open', ipAddress, userAgent);
        }
    }

  
    async markAsClicked(ipAddress, userAgent) {
        if (!this.clicked_at) {
            const sql = `
                UPDATE targets 
                SET status = 'clicked', clicked_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            `;
            await runQuery(sql, [this.id]);
            this.status = 'clicked';
            this.clicked_at = new Date();
        }

       
        if (!this.opened_at) {
            await this.markAsOpened(ipAddress, userAgent);
        }

    
        await this.logEvent('click', ipAddress, userAgent);
    }

 
    async logEvent(eventType, ipAddress, userAgent) {
        const sql = `
            INSERT INTO tracking_events (target_id, event_type, ip_address, user_agent)
            VALUES (?, ?, ?, ?)
        `;
        
        await runQuery(sql, [this.id, eventType, ipAddress || '', userAgent || '']);
    }

   
    async getEvents() {
        const sql = `
            SELECT * FROM tracking_events 
            WHERE target_id = ? 
            ORDER BY timestamp DESC
        `;
        return await getAll(sql, [this.id]);
    }

 
    generateTrackingLink(baseUrl) {
        return `${baseUrl}/track/click/${this.tracking_id}`;
    }

 
    generateTrackingPixel(baseUrl) {
        return `${baseUrl}/track/open/${this.tracking_id}`;
    }
}

module.exports = Target;