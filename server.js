const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();


const sessionConfig = require('./config/session');


const { requireAuth } = require('./middleware/auth');


const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const apiRoutes = require('./routes/api');


let campaignsRoutes;
try {
    campaignsRoutes = require('./routes/campaigns');
} catch (error) {
    console.warn('⚠️ Modulul campaigns nu a fost găsit. Verifică dacă ai creat fișierul routes/campaigns.js');
}


let templatesRoutes;
try {
    templatesRoutes = require('./routes/templates');
} catch (error) {
    console.warn('⚠️ Modulul templates nu a fost găsit. Verifică dacă ai creat fișierul routes/templates.js');
}


let trackingRoutes;
try {
    trackingRoutes = require('./routes/tracking');
} catch (error) {
    console.warn('⚠️ Modulul tracking nu a fost găsit.');
}


let targetsRoutes;
try {
    targetsRoutes = require('./routes/targets');
} catch (error) {
    console.warn('⚠️ Modulul targets nu a fost găsit.');
}


let reportsRoutes;
try {
    reportsRoutes = require('./routes/reports');
} catch (error) {
    console.warn('⚠️ Modulul reports nu a fost găsit.');
}
const emailSender = require('./services/emailSender');

const app = express();
const PORT = process.env.PORT || 3000;


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session(sessionConfig));


app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});


app.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect('/dashboard');
    } else {
        res.redirect('/auth/login');
    }
});


if (trackingRoutes) {
    app.use('/track', trackingRoutes);
}

app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/api', apiRoutes);

if (campaignsRoutes) {
    app.use('/campaigns', campaignsRoutes);
}


if (templatesRoutes) {
    app.use('/templates', templatesRoutes);
}

if (targetsRoutes) {
    app.use('/targets', targetsRoutes);
}


if (reportsRoutes) {
    app.use('/reports', reportsRoutes);
}


app.get('/campaigns/:id/targets', requireAuth, (req, res) => {
    res.redirect(`/targets/campaign/${req.params.id}`);
});


app.get('/targets', requireAuth, (req, res) => {
    res.redirect('/targets/import');
});


if (!campaignsRoutes) {
    app.get('/campaigns*', requireAuth, (req, res) => {
        res.render('under-construction', {
            title: 'Campanii',
            section: 'Modul Campanii',
            message: 'Modulul de campanii nu este încă instalat. Verifică că ai creat toate fișierele necesare.'
        });
    });
}

app.use((req, res) => {
    res.status(404).render('404', { title: 'Pagină negăsită' });
});


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { 
        title: 'Eroare server',
        error: process.env.NODE_ENV === 'development' ? err : {},
        message: err.message || 'A apărut o eroare'
    });
});
emailSender.startWorker();

app.listen(PORT, () => {
    console.log(`🚀 Server pornit pe http://localhost:${PORT}`);
});