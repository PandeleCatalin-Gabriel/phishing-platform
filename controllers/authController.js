const User = require('../models/User');

// Afișare pagină login
const showLoginPage = (req, res) => {
    res.render('login', { 
        title: 'Autentificare',
        error: req.query.error || null
    });
};

// Afișare pagină înregistrare
const showRegisterPage = (req, res) => {
    res.render('register', { 
        title: 'Înregistrare',
        error: null
    });
};

// Procesare login
const login = async (req, res) => {
    const { emailOrUsername, password } = req.body;

    try {
        const result = await User.authenticate(emailOrUsername, password);
        
        if (!result.success) {
            return res.render('login', {
                title: 'Autentificare',
                error: result.message
            });
        }

        // Salvează utilizatorul în sesiune
        req.session.user = {
            id: result.user.id,
            username: result.user.username,
            email: result.user.email,
            role: result.user.role
        };

        res.redirect('/dashboard');
    } catch (error) {
        console.error('Eroare la autentificare:', error);
        res.render('login', {
            title: 'Autentificare',
            error: 'Eroare la autentificare. Vă rugăm încercați din nou.'
        });
    }
};

// Procesare înregistrare
const register = async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    // Validări
    if (!username || !email || !password) {
        return res.render('register', {
            title: 'Înregistrare',
            error: 'Toate câmpurile sunt obligatorii'
        });
    }

    if (password !== confirmPassword) {
        return res.render('register', {
            title: 'Înregistrare',
            error: 'Parolele nu coincid'
        });
    }

    if (password.length < 6) {
        return res.render('register', {
            title: 'Înregistrare',
            error: 'Parola trebuie să aibă minim 6 caractere'
        });
    }

    try {
        const userId = await User.create({
            username,
            email,
            password
        });

        // Auto-login după înregistrare
        const user = await User.findById(userId);
        req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        };

        res.redirect('/dashboard');
    } catch (error) {
        console.error('Eroare la înregistrare:', error);
        res.render('register', {
            title: 'Înregistrare',
            error: error.message || 'Eroare la înregistrare. Vă rugăm încercați din nou.'
        });
    }
};

// Logout
const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Eroare la logout:', err);
        }
        res.redirect('/auth/login');
    });
};

module.exports = {
    showLoginPage,
    showRegisterPage,
    login,
    register,
    logout
};