const nodemailer = require('nodemailer');
const Template = require('../models/Template');
const Target = require('../models/Target');

class EmailService {
    constructor() {
        // Configurare SMTP - folosește propriile credențiale
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    // Trimite email către o țintă
    async sendToTarget(target, template, campaignBaseUrl) {
        try {
            // Generează link-uri personalizate
            const trackingLink = target.generateTrackingLink(campaignBaseUrl);
            const trackingPixel = target.generateTrackingPixel(campaignBaseUrl);

            // Înlocuiește variabilele în template
            const rendered = template.renderWithVariables({
                first_name: target.first_name || 'Utilizator',
                last_name: target.last_name || '',
                email: target.email,
                company: target.company || '',
                link: trackingLink
            });

            // Adaugă pixel de tracking în HTML
            const htmlWithTracking = rendered.htmlContent + 
                `<img src="${trackingPixel}" width="1" height="1" style="display:none;" />`;

            // Configurare email
            const mailOptions = {
                from: process.env.SMTP_FROM || 'noreply@phishedu.com',
                to: target.email,
                subject: rendered.subject,
                html: htmlWithTracking,
                text: rendered.textContent || 'Vezi versiunea HTML a acestui email.'
            };

            // Trimite email
            await this.transporter.sendMail(mailOptions);
            
            // Marchează ca trimis
            await target.markAsSent();
            
            return { success: true };
        } catch (error) {
            console.error('Eroare trimitere email:', error);
            return { success: false, error: error.message };
        }
    }

    // Trimite email-uri pentru o campanie
    async sendCampaignEmails(campaign, template, targets, options = {}) {
        const results = [];
        const delay = options.delay || 30000; // 30 secunde implicit
        const baseUrl = options.baseUrl || process.env.BASE_URL || 'http://localhost:3000';

        for (const target of targets) {
            // Verifică dacă campania e încă activă
            if (campaign.status !== 'active') {
                break;
            }

            // Trimite email
            const result = await this.sendToTarget(target, template, baseUrl);
            results.push({
                targetId: target.id,
                email: target.email,
                ...result
            });

            // Așteaptă între email-uri
            if (delay > 0) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        return results;
    }

    // Verifică configurarea SMTP
    async verifyConnection() {
        try {
            await this.transporter.verify();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

module.exports = new EmailService();