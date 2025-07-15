const { runQuery, getOne, getAll } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    constructor(data) {
        this.id = data.id;
        this.username = data.username;
        this.email = data.email;
        this.role = data.role || 'user';
        this.created_at = data.created_at;
        this.last_login = data.last_login;
    }

   
    static async create(userData) {
        const { username, email, password, role = 'user' } = userData;
        
      
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const sql = `
            INSERT INTO users (username, email, password, role)
            VALUES (?, ?, ?, ?)
        `;
        
        try {
            const result = await runQuery(sql, [username, email, hashedPassword, role]);
            return result.id;
        } catch (error) {
            if (error.code === 'SQLITE_CONSTRAINT') {
                throw new Error('Username sau email deja există');
            }
            throw error;
        }
    }

    
    static async findById(id) {
        const sql = 'SELECT * FROM users WHERE id = ?';
        const userData = await getOne(sql, [id]);
        return userData ? new User(userData) : null;
    }

    
    static async findByEmail(email) {
        const sql = 'SELECT * FROM users WHERE email = ?';
        const userData = await getOne(sql, [email]);
        return userData ? new User(userData) : null;
    }

    
    static async findByUsername(username) {
        const sql = 'SELECT * FROM users WHERE username = ?';
        const userData = await getOne(sql, [username]);
        return userData ? new User(userData) : null;
    }

   
    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    
    static async authenticate(emailOrUsername, password) {
        const sql = `
            SELECT * FROM users 
            WHERE email = ? OR username = ?
        `;
        
        const userData = await getOne(sql, [emailOrUsername, emailOrUsername]);
        
        if (!userData) {
            return { success: false, message: 'Utilizator negăsit' };
        }

        const isValid = await bcrypt.compare(password, userData.password);
        
        if (!isValid) {
            return { success: false, message: 'Parolă incorectă' };
        }

        
        await runQuery(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
            [userData.id]
        );

        return { 
            success: true, 
            user: new User(userData) 
        };
    }

   
    async update(updateData) {
        const allowedFields = ['username', 'email'];
        const updates = [];
        const values = [];

        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                updates.push(`${field} = ?`);
                values.push(updateData[field]);
            }
        }

        if (updates.length === 0) {
            return false;
        }

        values.push(this.id);
        const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
        
        await runQuery(sql, values);
        return true;
    }

   
    async changePassword(currentPassword, newPassword) {
        const sql = 'SELECT password FROM users WHERE id = ?';
        const result = await getOne(sql, [this.id]);
        
        const isValid = await bcrypt.compare(currentPassword, result.password);
        if (!isValid) {
            throw new Error('Parola curentă este incorectă');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await runQuery(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, this.id]
        );
        
        return true;
    }

    
    async getCampaigns() {
        const sql = `
            SELECT * FROM campaigns 
            WHERE user_id = ? 
            ORDER BY created_at DESC
        `;
        return await getAll(sql, [this.id]);
    }

   
    async getTemplates() {
        const sql = `
            SELECT * FROM templates 
            WHERE user_id = ? 
            ORDER BY updated_at DESC
        `;
        return await getAll(sql, [this.id]);
    }

    
    async getStats() {
        const stats = {};
        
       
        const campaigns = await getOne(
            'SELECT COUNT(*) as count FROM campaigns WHERE user_id = ?',
            [this.id]
        );
        stats.totalCampaigns = campaigns.count;

        
       const templates = await getOne(
    'SELECT COUNT(*) as count FROM templates WHERE user_id = ?',
    [this.id]
);
stats.totalTemplates = templates.count;

        
        const emails = await getOne(`
            SELECT COUNT(*) as count 
            FROM targets t
            JOIN campaigns c ON t.campaign_id = c.id
            WHERE c.user_id = ? AND t.status != 'pending'
        `, [this.id]);
        stats.totalEmailsSent = emails.count;

        return stats;
    }
}

module.exports = User;