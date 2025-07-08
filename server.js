const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

// Importă configurări
const sessionConfig = require('./config/session');

// Importă middleware
const { requireAuth } = require('./middleware/auth');

// Importă rute
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const apiRoutes = require('./routes/api');

// Verifică dacă există modulul campaigns
let campaignsRoutes;
try {
    campaignsRoutes = require('./routes/campaigns');
} catch (error) {
    console.warn('⚠️ Modulul campaigns nu a fost găsit. Verifică dacă ai creat fișierul routes/campaigns.js');
}

// Verifică dacă există modulul templates
let templatesRoutes;
try {
    templatesRoutes = require('./routes/templates');
} catch (error) {
    console.warn('⚠️ Modulul templates nu a fost găsit. Verifică dacă ai creat fișierul routes/templates.js');
}

// Tracking routes (nu necesită autentificare)
const trackingRoutes = require('./routes/tracking');

// Inițializare aplicație
const app = express();
const PORT = process.env.PORT || 3000;

// Configurare view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session(sessionConfig));

// Middleware pentru a face user-ul disponibil în toate view-urile
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// Rute principale
app.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect('/dashboard');
    } else {
        res.redirect('/auth/login');
    }
});

// Montare rute publice (fără autentificare)
app.use('/track', trackingRoutes);

// Montare rute
app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/api', apiRoutes);

// Montare rute campaigns dacă există
if (campaignsRoutes) {
    app.use('/campaigns', campaignsRoutes);
}

// Montare rute templates dacă există
if (templatesRoutes) {
    app.use('/templates', templatesRoutes);
} else {
    // Rute temporare pentru templates
    app.get('/templates', requireAuth, (req, res) => {
        res.render('under-construction', {
            title: 'Template-uri',
            section: 'Template-uri Email',
            message: 'Această secțiune va permite crearea și gestionarea template-urilor de email.'
        });
    });

    app.get('/templates/new', requireAuth, (req, res) => {
        res.render('under-construction', {
            title: 'Template nou',
            section: 'Creare Template',
            message: 'Aici veți putea crea template-uri de email personalizate.'
        });
    });
}

app.get('/targets', requireAuth, (req, res) => {
    res.render('under-construction', {
        title: 'Ținte',
        section: 'Gestionare Ținte',
        message: 'Această secțiune va permite importul și gestionarea listelor de destinatari.'
    });
});

app.get('/targets/import', requireAuth, (req, res) => {
    res.render('under-construction', {
        title: 'Import ținte',
        section: 'Import Destinatari',
        message: 'Aici veți putea importa liste de destinatari din fișiere CSV.'
    });
});

app.get('/reports', requireAuth, (req, res) => {
    res.render('under-construction', {
        title: 'Rapoarte',
        section: 'Rapoarte și Analize',
        message: 'Această secțiune va oferi rapoarte detaliate despre campaniile dvs.'
    });
});

// Fallback pentru campaigns dacă modulul nu există
if (!campaignsRoutes) {
    app.get('/campaigns*', requireAuth, (req, res) => {
        res.render('under-construction', {
            title: 'Campanii',
            section: 'Modul Campanii',
            message: 'Modulul de campanii nu este încă instalat. Verifică că ai creat toate fișierele necesare.'
        });
    });
}

// 404 handler
app.use((req, res) => {
    res.status(404).render('404', { title: 'Pagină negăsită' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { 
        title: 'Eroare server',
        error: process.env.NODE_ENV === 'development' ? err : {},
        message: err.message || 'A apărut o eroare'
    });
});

// Pornire server
app.listen(PORT, () => {
    console.log(`🚀 Server pornit pe http://localhost:${PORT}`);
});