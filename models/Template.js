const { runQuery, getOne, getAll } = require('../config/database');

class Template {
    constructor(data) {
        this.id = data.id;
        this.user_id = data.user_id;
        this.name = data.name;
        this.subject = data.subject;
        this.html_content = data.html_content;
        this.text_content = data.text_content;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

  
    static async create(templateData) {
        const { user_id, name, subject, html_content, text_content } = templateData;
        
        const sql = `
            INSERT INTO templates (user_id, name, subject, html_content, text_content)
            VALUES (?, ?, ?, ?, ?)
        `;
        
        const result = await runQuery(sql, [user_id, name, subject, html_content, text_content || '']);
        return result.id;
    }

  
    static async findById(id) {
        const sql = 'SELECT * FROM templates WHERE id = ?';
        const templateData = await getOne(sql, [id]);
        return templateData ? new Template(templateData) : null;
    }

   
    static async findByUserId(userId) {
        const sql = `
            SELECT * FROM templates 
            WHERE user_id = ? 
            ORDER BY updated_at DESC
        `;
        const templates = await getAll(sql, [userId]);
        return templates.map(t => new Template(t));
    }

   
    async update(updateData) {
        const allowedFields = ['name', 'subject', 'html_content', 'text_content'];
        const updates = [];
        const values = [];

        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                updates.push(`${field} = ?`);
                values.push(updateData[field]);
            }
        }

        if (updates.length === 0) return false;

        updates.push('updated_at = CURRENT_TIMESTAMP');
        values.push(this.id);
        
        const sql = `UPDATE templates SET ${updates.join(', ')} WHERE id = ?`;
        await runQuery(sql, values);
        return true;
    }

   
    async delete() {
        const sql = 'DELETE FROM templates WHERE id = ?';
        await runQuery(sql, [this.id]);
    }

   
    async clone(newName) {
        const sql = `
            INSERT INTO templates (user_id, name, subject, html_content, text_content)
            VALUES (?, ?, ?, ?, ?)
        `;
        
        const result = await runQuery(sql, [
            this.user_id,
            newName,
            this.subject,
            this.html_content,
            this.text_content
        ]);
        
        return result.id;
    }

   
    renderWithVariables(variables) {
        let htmlContent = this.html_content;
        let textContent = this.text_content;
        let subject = this.subject;

        
        Object.keys(variables).forEach(key => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            const value = variables[key] || '';
            
            htmlContent = htmlContent.replace(regex, value);
            textContent = textContent.replace(regex, value);
            subject = subject.replace(regex, value);
        });

        return {
            subject,
            htmlContent,
            textContent
        };
    }
}

module.exports = Template;