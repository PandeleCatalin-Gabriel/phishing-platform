const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireGuest } = require('../middleware/auth');

// Rute pentru vizitatori (neautentificați)
router.get('/login', requireGuest, authController.showLoginPage);
router.get('/register', requireGuest, authController.showRegisterPage);

// Procesare formular
router.post('/login', requireGuest, authController.login);
router.post('/register', requireGuest, authController.register);

// Logout
router.get('/logout', authController.logout);

module.exports = router;