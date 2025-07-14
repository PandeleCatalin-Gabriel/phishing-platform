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
let trackingRoutes;
try {
    trackingRoutes = require('./routes/tracking');
} catch (error) {
    console.warn('⚠️ Modulul tracking nu a fost găsit.');
}

// Verifică dacă există modulul targets
let targetsRoutes;
try {
    targetsRoutes = require('./routes/targets');
} catch (error) {
    console.warn('⚠️ Modulul targets nu a fost găsit.');
}

// Verifică dacă există modulul reports
let reportsRoutes;
try {
    reportsRoutes = require('./routes/reports');
} catch (error) {
    console.warn('⚠️ Modulul reports nu a fost găsit.');
}

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
if (trackingRoutes) {
    app.use('/track', trackingRoutes);
}

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
}

// Montare rute targets dacă există
if (targetsRoutes) {
    app.use('/targets', targetsRoutes);
}

// Montare rute reports dacă există
if (reportsRoutes) {
    app.use('/reports', reportsRoutes);
}

// Rute temporare pentru secțiunile care nu au rute dedicate
app.get('/campaigns/:id/targets', requireAuth, (req, res) => {
    res.redirect(`/targets/campaign/${req.params.id}`);
});

// Redirecționare pentru /targets
app.get('/targets', requireAuth, (req, res) => {
    res.redirect('/targets/import');
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