const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

// Importă configurări
const sessionConfig = require('./config/session');

// Importă rute
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const apiRoutes = require('./routes/api');
let campaignsRoutes;
try {
    campaignsRoutes = require('./routes/campaigns');
} catch (error) {
    console.warn('⚠️ Modulul campaignsRoutes nu a putut fi încărcat:', error.message);
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

// Montare rute
app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/api', apiRoutes);
if (campaignsRoutes) {
    app.use('/campaigns', campaignsRoutes);
} else {
    console.warn('⚠️ Ruta /campaigns/ nu este activă deoarece modulul nu a fost încărcat.');
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
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Pornire server
app.listen(PORT, () => {
    console.log(`🚗 Server pornit pe http://localhost:${PORT}`);
});