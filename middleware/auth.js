// Verifică dacă utilizatorul este autentificat
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            // Pentru request-uri AJAX
            return res.status(401).json({ error: 'Neautentificat' });
        }
        // Pentru request-uri normale
        return res.redirect('/auth/login');
    }
    next();
};

// Verifică dacă utilizatorul este admin
const requireAdmin = (req, res, next) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.status(403).json({ error: 'Acces interzis' });
        }
        return res.status(403).render('error', { 
            title: 'Acces interzis',
            message: 'Nu aveți permisiunea de a accesa această pagină' 
        });
    }
    next();
};

// Verifică dacă utilizatorul este deja autentificat (pentru paginile de login/register)
const requireGuest = (req, res, next) => {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    next();
};

module.exports = {
    requireAuth,
    requireAdmin,
    requireGuest
};