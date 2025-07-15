const { db } = require('../config/database');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const initDatabase = async () => {
    console.log('🔄 Inițializare bază de date...');

   
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_login DATETIME
        )
    `, (err) => {
        if (err) console.error('Eroare creare tabel users:', err);
        else console.log('✅ Tabel users creat');
    });

   
    db.run(`
        CREATE TABLE IF NOT EXISTS campaigns (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            template_id INTEGER,
            frequency INTEGER DEFAULT 30,
            status TEXT DEFAULT 'draft',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            launched_at DATETIME,
            completed_at DATETIME,
            last_sent_at DATETIME,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `, (err) => {
        if (err) console.error('Eroare creare tabel campaigns:', err);
        else console.log('✅ Tabel campaigns creat');
    });

   
    db.run(`
        CREATE TABLE IF NOT EXISTS templates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            subject TEXT NOT NULL,
            html_content TEXT NOT NULL,
            text_content TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `, (err) => {
        if (err) console.error('Eroare creare tabel templates:', err);
        else console.log('✅ Tabel templates creat');
    });

   
    db.run(`
        CREATE TABLE IF NOT EXISTS targets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            campaign_id INTEGER NOT NULL,
            email TEXT NOT NULL,
            first_name TEXT,
            last_name TEXT,
            position TEXT,
            company TEXT,
            custom_attributes TEXT,
            status TEXT DEFAULT 'pending',
            sent_at DATETIME,
            opened_at DATETIME,
            clicked_at DATETIME,
            tracking_id TEXT UNIQUE,
            FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
        )
    `, (err) => {
        if (err) console.error('Eroare creare tabel targets:', err);
        else console.log('✅ Tabel targets creat');
    });

    
   db.run(`
    CREATE TABLE IF NOT EXISTS tracking_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        target_id INTEGER NOT NULL,
        event_type TEXT NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        extra_data TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (target_id) REFERENCES targets(id) ON DELETE CASCADE
    )
`, (err) => {
    if (err) console.error('Eroare creare tabel tracking_events:', err);
    else console.log('✅ Tabel tracking_events creat');
});

  
    setTimeout(async () => {
        try {
          
            db.get('SELECT * FROM users WHERE email = ?', [process.env.ADMIN_EMAIL], async (err, row) => {
                if (!row) {
                    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
                    db.run(
                        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
                        ['admin', process.env.ADMIN_EMAIL, hashedPassword, 'admin'],
                        (err) => {
                            if (err) console.error('Eroare creare admin:', err);
                            else console.log('✅ Utilizator admin creat');
                        }
                    );
                } else {
                    console.log('ℹ️  Utilizator admin există deja');
                }
            });
        } catch (error) {
            console.error('Eroare la crearea admin-ului:', error);
        }
    }, 1000);

   
    setTimeout(() => {
        db.close((err) => {
            if (err) console.error('Eroare la închiderea conexiunii:', err);
            else console.log('✅ Bază de date inițializată cu succes!');
        });
    }, 3000);
};

initDatabase();