const Target = require('../models/Target');
const fs = require('fs').promises;
const path = require('path');


const trackOpen = async (req, res) => {
    try {
        const { trackingId } = req.params;
        const target = await Target.findByTrackingId(trackingId);

        if (target) {
            const ipAddress = req.ip || req.connection.remoteAddress;
            const userAgent = req.headers['user-agent'];
            
            await target.markAsOpened(ipAddress, userAgent);
            
            
            console.log(`📧 Email deschis: ${target.email} la ${new Date().toISOString()}`);
        }

        
        const pixel = Buffer.from(
            'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
            'base64'
        );
        
        res.writeHead(200, {
            'Content-Type': 'image/gif',
            'Content-Length': pixel.length,
            'Cache-Control': 'no-store, no-cache, must-revalidate, private'
        });
        
        res.end(pixel);
    } catch (error) {
        console.error('Eroare tracking open:', error);
        res.status(404).send('Not found');
    }
};


const trackClick = async (req, res) => {
    try {
        const { trackingId } = req.params;
        const { url } = req.query;
        
        const target = await Target.findByTrackingId(trackingId);

        if (target) {
            const ipAddress = req.ip || req.connection.remoteAddress;
            const userAgent = req.headers['user-agent'];
            
            await target.markAsClicked(ipAddress, userAgent);
            
            
            console.log(`🎯 Link accesat: ${target.email} la ${new Date().toISOString()}`);
        }

        
        if (url && isValidUrl(url)) {
            res.redirect(url);
        } else {
            
            res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Atenție - Test Phishing</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                            margin: 0;
                            background-color: #f0f0f0;
                        }
                        .warning {
                            background: white;
                            padding: 40px;
                            border-radius: 10px;
                            box-shadow: 0 0 20px rgba(0,0,0,0.1);
                            text-align: center;
                            max-width: 500px;
                        }
                        .warning h1 {
                            color: #e74c3c;
                        }
                        .warning p {
                            color: #333;
                            line-height: 1.6;
                        }
                        .tips {
                            background: #f8f9fa;
                            padding: 20px;
                            border-radius: 5px;
                            margin-top: 20px;
                            text-align: left;
                        }
                    </style>
                </head>
                <body>
                    <div class="warning">
                        <h1>⚠️ Atenție!</h1>
                        <h2>Acesta a fost un test de phishing</h2>
                        <p>Dacă acesta ar fi fost un atac real de phishing, datele dvs. ar fi putut fi compromise.</p>
                        
                        <div class="tips">
                            <h3>🛡️ Cum să vă protejați:</h3>
                            <ul>
                                <li>Verificați întotdeauna adresa expeditorului</li>
                                <li>Nu dați click pe link-uri suspecte</li>
                                <li>Verificați URL-ul înainte de a introduce date</li>
                                <li>Raportați email-urile suspecte departamentului IT</li>
                            </ul>
                        </div>
                    </div>
                </body>
                </html>
            `);
        }
    } catch (error) {
        console.error('Eroare tracking click:', error);
        res.status(404).send('Not found');
    }
};


const webhook = async (req, res) => {
    try {
        const { event, targetId, timestamp } = req.body;
        
        
        
        console.log(`🔔 Webhook: ${event} pentru target ${targetId} la ${timestamp}`);
        
        res.json({ success: true });
    } catch (error) {
        console.error('Eroare webhook:', error);
        res.status(500).json({ error: 'Eroare procesare webhook' });
    }
};


function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

module.exports = {
    trackOpen,
    trackClick,
    webhook
};