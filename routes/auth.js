const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireGuest } = require('../middleware/auth');


router.get('/login', requireGuest, authController.showLoginPage);
router.get('/register', requireGuest, authController.showRegisterPage);


router.post('/login', requireGuest, authController.login);
router.post('/register', requireGuest, authController.register);


router.get('/logout', authController.logout);

module.exports = router;