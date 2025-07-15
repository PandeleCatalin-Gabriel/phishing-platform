
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
           
            return res.status(401).json({ error: 'Neautentificat' });
        }
        
        return res.redirect('/auth/login');
    }
    next();
};


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